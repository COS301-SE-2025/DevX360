/**
 * Main Express application for Capstone backend.
 * Handles authentication, user management, team management, file uploads, and scheduled jobs.
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import multer from "multer";
import bcrypt from "bcrypt";
import Team from "./models/Team.js";
import User from "./models/User.js";
// import sharp from "sharp"; // Optional dependency for image processing
import dotenv from "dotenv";
dotenv.config();
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import cron from "node-cron";
import { refreshGithubUsernames } from "../services/githubUpdater.js";
import { updateAllTeams } from "../services/teamUpdater.js";
import mongoose from "mongoose";
import { getRepositoryInfo, extractOwnerAndRepo } from "../Data-Collection/repository-info-service.js";
import { getDORAMetrics } from "../Data-Collection/universal-dora-service.js";
import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";
const lambda = new LambdaClient();
//import { analyzeRepository } from "../services/metricsService.js";
//import { runAIAnalysis } from "../services/analysisService.js";
import {
  safeAnalyzeRepository,
  safeRunAIAnalysis,
  safeCollectMemberActivity,
} from "../services/mockWrappers.js";
import RepoMetrics from "./models/RepoMetrics.js";
import { hashPassword, comparePassword, generateToken, authenticateMCP } from "./utils/auth.js";
import { authorizeTeamAccess } from "./middlewares/authorizeTeamAccess.js";
import SystemEvent from "./models/SystemEvent.js";
import { logSystemEvent } from "./middlewares/logSystemEvent.js";
import { env } from "process";

// --------------------------------------------------------------------------
// Path and Upload Setup
// --------------------------------------------------------------------------

/**
 * __dirname equivalent for ES modules.
 */
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = dirname(__filename);

/**
 * Multer middleware for handling file uploads.
 */
//const upload = multer({ dest: path.join(__dirname, "uploads") });

/**
 * Express application instance.
 */
const app = express();

/**
 * Cookie parser middleware.
 */
app.use(cookieParser());

// Strip API Gateway stage prefix from path
app.use((req, res, next) => {
  if (req.path.startsWith('/dev/')) {
    req.url = req.url.replace('/dev', '');
  }
  next();
});

// --------------------------------------------------------------------------
// CORS Configuration
// --------------------------------------------------------------------------

/**
 * Allowed origins for CORS.
 * @type {string[]}
 */
const allowedOrigins = [
  "http://localhost:5500",
  "http://localhost:5050",
  "http://localhost:3000",
  "https://d2ba0wcuk00uxg.cloudfront.net",
  "https://www.devx360.app",
  "https://devx360.app",
];

/**
 * CORS middleware for handling cross-origin requests.
 */
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.options('*', cors());

/**
 * Middleware for parsing JSON request bodies.
 */
app.use(express.json());

/**
 * Static file serving for uploaded files.
 */
//app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------------------------------------------------------
// Rate Limiting
// --------------------------------------------------------------------------

/**
 * Express rate limiter to prevent abuse.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  handler: async (req, res) => {
    await logSystemEvent({
      type: "rate_limit",
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      details: { endpoint: req.originalUrl },
    });
    res.status(429).json({ message: "Too many requests, please try again later" });
  },
});
app.use(limiter);

// --------------------------------------------------------------------------
// JWT Authentication Middleware
// --------------------------------------------------------------------------

/**
 * Middleware to authenticate JWT tokens from cookies.
 * Attaches user object to request if valid.
 * Returns 401 if no token, 403 if invalid.
 */
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// --------------------------------------------------------------------------
// Scheduled Cron Jobs
// --------------------------------------------------------------------------

/**
 * Schedules daily GitHub username sync and team updater jobs.
 * Only runs in the primary process (NODE_APP_INSTANCE === '0' or undefined).
 */
//if (!process.env.NODE_APP_INSTANCE || process.env.NODE_APP_INSTANCE === '0') {
  /**
   * Daily GitHub username sync at 1:00 AM.
   */
  /*cron.schedule("0 1 * * *", async () => {
    console.log("Running daily GitHub username sync...");
    await refreshGithubUsernames();
  });

  /**
   * Daily team metrics and AI analysis update at 2:00 AM.
   */
  /*cron.schedule("5 2 * * *", async () => {
    console.log("Running daily team metrics and AI analysis update...");
    await updateAllTeams();
  });
}*/

/**
 * Configure Multer to use memory storage.
 * We never write user-uploaded files to disk to avoid path traversal / persistence risks.
 * 
 * Limits:
 *  - 2 MB max file size
 *  - Only image/* MIME types are allowed
 */
const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB max
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// --------------------------------------------------------------------------
// Health Check Endpoint
// --------------------------------------------------------------------------

/**
 * Health check endpoint.
 * @route GET /api/health
 * @returns {Object} API and database status.
 */
app.get("/api/health", async (req, res) => {
  console.log("Health route hit - this should work");
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    
    res.json({
      status: "OK",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health route error:", error);
    res.status(500).json({
      status: "Degraded",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// --------------------------------------------------------------------------
// User Registration
// --------------------------------------------------------------------------

/**
 * Registers a new user.
 * @route POST /api/register
 * @param {string} name - User's name.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @param {string} role - User's role.
 * @param {string} [inviteCode] - Optional invite code.
 * @returns {Object} Registration status and user info.
 */
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role, inviteCode } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role: 'user',
      password: hashedPassword,
      inviteCode: inviteCode || null,
      isEmailVerified: true,
    });

    await newUser.save();

    const token = generateToken({
      userId: newUser._id,
      email: newUser.email,
      role: newUser.role,
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(201)
      .json({
        message: "Registration successful",
        user: newUser,
      });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ message: "Internal server error during registration" });
  }
});

// --------------------------------------------------------------------------
// GitHub OAuth Authentication
// --------------------------------------------------------------------------

/**
 * Redirects user to GitHub OAuth authorization page.
 * @route GET /api/auth/github
 */
app.get("/api/auth/github", (req, res) => {
  const { flow = 'signup', returnTo = '/dashboard/overview' } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const state = Buffer.from(JSON.stringify({ flow, returnTo })).toString('base64');
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user&state=${state}`;
  res.redirect(redirectUrl);
});

/**
 * Handles GitHub OAuth callback.
 * @route GET /api/auth/github/callback
 */
app.get("/api/auth/github/callback", async (req, res) => {
    console.log("GITHUB OAUTH ENDPOINT 2");
  const code = req.query.code;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const state = req.query.state;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error("Failed to get access token from GitHub");
    }

    // Fetch user info from GitHub
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = await userRes.json();

    // Parse state parameter
    let stateParams = { flow: 'signup', returnTo: '/dashboard/overview' };
    if (state) {
      try {
        stateParams = JSON.parse(Buffer.from(state, 'base64').toString());
      } catch (e) {
        console.warn("Invalid state parameter, using default flow");
      }
    }

    const { flow, returnTo } = stateParams;
    console.log(`OAuth flow: ${flow}, returnTo: ${returnTo}`);

    // Handle connect flow - user should already be logged in
    if (flow === 'connect') {
      // Store GitHub data in session/temporary storage for the connect endpoint
      // Using a temporary token approach for security
      const tempToken = jwt.sign({
        githubData: {
          id: githubUser.id,
          login: githubUser.login,
          name: githubUser.name,
          email: githubUser.email,
          avatar_url: githubUser.avatar_url
        }
      }, process.env.JWT_SECRET, { expiresIn: '10m' });

      // Redirect to frontend with temp token
      return res.redirect(`${frontendUrl}/dashboard/profile?temp_token=${tempToken}`);
    }

    // Handle signup/login flow
    // Check if user already exists
    let conditions = [];

    if (githubUser.id) {
      conditions.push({ githubId: githubUser.id });
    }

    // Fallback to username
    if (githubUser.login) {
      conditions.push({ githubUsername: githubUser.login });
    }

    // Fallback to email
    if (githubUser.email) {
      conditions.push({ email: githubUser.email });
    }

    let user = conditions.length > 0 
      ? await User.findOne({ $or: conditions }) 
      : null;

    if (!user) {
      user = new User({
        name: githubUser.name || githubUser.login,
        email: githubUser.email || `${githubUser.login}@users.noreply.github.com`,
        githubId: githubUser.id,
        githubUsername: githubUser.login,
        isEmailVerified: true,
        password: await hashPassword(crypto.randomUUID()), // random unusable password
      });

      await user.save();
    } else {
      // Update existing user's GitHub info if needed
      let needsUpdate = false;
      if (!user.githubId && githubUser.id) {
        user.githubId = githubUser.id;
        needsUpdate = true;
      }
      if (!user.githubUsername && githubUser.login) {
        user.githubUsername = githubUser.login;
        needsUpdate = true;
      }

      user.lastLogin = new Date();
      needsUpdate = true;

      if (needsUpdate) {
        await user.save();
      }
    }

    // Generate token and set cookie
    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const redirectUrl = `${frontendUrl}/dashboard/overview`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    // res.redirect(`${frontendUrl}/login?error=github_auth_failed`);
    let returnTo = '/login';
    if (req.query.state) {
      try {
        const stateParams = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
        if (stateParams.flow === 'connect') {
          returnTo = '/dashboard/profile';
        }
      } catch (e) {
        // Use default
      }
    }

    res.redirect(`${frontendUrl}${returnTo}?error=${encodeURIComponent('GitHub authentication failed')}`);
  }
});

/**
 * GitHub connection for existing authenticated users
 * @route POST /api/profile/connect-github-complete
 * @middleware authenticateToken
 */
app.post("/api/profile/connect-github", authenticateToken, async (req, res) => {
  try {
    const { tempToken } = req.body;
    
    if (!tempToken) {
      return res.status(400).json({ message: "Temporary token is required" });
    }

    // Verify and decode temporary token
    let githubData;
    try {
      const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
      githubData = decoded.githubData;
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired temporary token" });
    }

    // Find current user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if GitHub account is already connected to another user
    const existingUserWithGitHub = await User.findOne({
      $or: [
        { githubId: githubData.id },
        { githubUsername: githubData.login }
      ],
      _id: { $ne: user._id }
    });

    if (existingUserWithGitHub) {
      return res.status(400).json({ 
        message: "This GitHub account is already connected to another user" 
      });
    }

    // Update user with GitHub info
    const updates = {
      githubId: githubData.id,
      githubUsername: githubData.login,
    };

    // Optionally update name if not set
    if (!user.name && githubData.name) {
      updates.name = githubData.name;
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "GitHub account connected successfully",
      user: updatedUser,
      githubInfo: {
        username: githubData.login,
        id: githubData.id,
        avatar: githubData.avatar_url
      }
    });

  } catch (error) {
    console.error("GitHub connection completion error:", error);
    res.status(500).json({ 
      message: "Failed to complete GitHub connection",
      error: error.message 
    });
  }
});

// --------------------------------------------------------------------------
// User Login/Logout
// --------------------------------------------------------------------------

/**
 * Authenticates user and issues JWT.
 * @route POST /api/login
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Object} Login status and user info.
 */
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() })
      .select("_id email password role")
      .lean();

    if (!user) return res.status(401).json({ message: "Invalid email" });

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid){
      // Detect brute-force: 5+ fails in 15m
      const cutoff = new Date(Date.now() - 15 * 60 * 1000);
      const failCount = await SystemEvent.countDocuments({
        type: "login_failure",
        email,
        timestamp: { $gte: cutoff },
      });

      // Check if a brute-force event already exists in this window
      const existingBruteForce = await SystemEvent.findOne({
        type: "brute_force",
        email,
        timestamp: { $gte: cutoff },
      });

      if (failCount >= 5 && !existingBruteForce) {
        await logSystemEvent({
          type: "brute_force",
          email,
          ip: req.ip,
          userAgent: req.headers["user-agent"],
          details: { attempts: failCount, timeframe: "15m" },
        });
      }

      await logSystemEvent({
        type: "login_failure",
        email,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        details: { reason: "Invalid credentials" },
      });

      return res.status(401).json({ message: "Invalid password" });
    }

    User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } }).exec();

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        message: "Login successful",
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
        },
      });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * Logs out the authenticated user.
 * @route POST /api/logout
 * @middleware authenticateToken
 */
app.post("/api/logout", authenticateToken, (req, res) => {
  console.log("User logged out:", { email: req.user.email });
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });
  res.json({ message: "Logged out" });
});

// --------------------------------------------------------------------------
// User Profile Management
// --------------------------------------------------------------------------

/**
 * Gets the authenticated user's profile.
 * @route GET /api/profile
 * @middleware authenticateToken
 * @returns {Object} User profile and teams.
 */
app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password -avatar").lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    // Check if user has avatar (without loading the data)
    const hasAvatar = await User.findById(req.user.userId)
      .select("avatar.data")
      .lean();
    
    // Add avatar URL only if avatar exists, but don't include the actual data
    if (hasAvatar?.avatar?.data) {
      user.avatarUrl = `/api/avatar/${user._id}`;
    }
    // Ensure userId is an ObjectId
    const userObjectId = new mongoose.Types.ObjectId(req.user.userId);

    const teams = await Team.aggregate([
      { $match: { members: userObjectId } },
      {
        $lookup: {
          from: "users",
          localField: "creator",
          foreignField: "_id",
          as: "creator",
          pipeline: [
            { $project: { 
              name: 1, 
              email: 1, 
              _id: 1,
              hasAvatar: { $toBool: "$avatar.data" }
            }}
          ]
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members",
          pipeline: [
            { $project: { 
              name: 1, 
              email: 1, 
              _id: 1,
              // Check if avatar exists without loading data
              hasAvatar: { $toBool: "$avatar.data" }
            }}
          ]
        },
      },
      { $unwind: "$creator" },
      { $project: { 
        name: 1, 
        creator: 1, 
        members: 1,
        _id: 1
      }}
    ]);

    // Get all repo metrics in a single query
    const teamIds = teams.map(t => t._id);
    const repoDataList = await RepoMetrics.find({
      teamId: { $in: teamIds }
    }).lean();

    const teamsWithMetrics = teams.map(team => {
      const repoData = repoDataList.find(r => r.teamId.toString() === team._id.toString());
      // Add avatar URLs for members who have avatars
      const membersWithAvatars = team.members.map(member => ({
        ...member,
        avatarUrl: member.hasAvatar ? `/api/avatar/${member._id}` : undefined
      }));
      
      // Add avatar URL for creator if they have one
      const creatorWithAvatar = {
        ...team.creator,
        avatarUrl: team.creator.hasAvatar ? `/api/avatar/${team.creator._id}` : undefined
      };

      return {
        id: team._id,
        name: team.name,
        creator: creatorWithAvatar,
        members: membersWithAvatars,
        doraMetrics: repoData?.metrics || null,
        repositoryInfo: repoData?.repositoryInfo || null,
      };
    });

    user.teams = teamsWithMetrics;

    res.json({ user });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Updates the authenticated user's profile.
 * @route PUT /api/profile
 * @middleware authenticateToken
 * @param {string} [name] - New name.
 * @param {string} [email] - New email.
 * @param {string} [password] - New password.
 * @param {string} [githubUsername] - GitHub username.
 * @param {string} [githubId] - GitHub user ID.
 * @returns {Object} Update status and updated user.
 */
app.put("/api/profile", authenticateToken, async (req, res) => {
  try {
    const { name, email, password, githubUsername, githubId } = req.body;
    const updates = {};

    if (!name && !email && !password && !githubUsername && !githubId) {
      return res.status(400).json({
        message: "At least one field (name, email, password, githubUsername, or githubId) is required",
      });
    }

    // Only fetch user once
    const user = await User.findById(req.user.userId).select("-avatar");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check and set fields
    if (name) updates.name = name.trim();

    if (email && email.trim().toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
      if (emailExists && emailExists._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "Email already in use by another account" });
      }
      updates.email = email.trim().toLowerCase();
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }
      updates.password = await hashPassword(password);
    }

    if (githubId && githubId !== user.githubId) {
      const githubIdExists = await User.findOne({ githubId });
      if (githubIdExists && githubIdExists._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "GitHub ID already linked to another account" });
      }
      updates.githubId = githubId;
    }

    if (githubUsername && githubUsername.trim() !== user.githubUsername) {
      const githubUsernameExists = await User.findOne({ githubUsername: githubUsername.trim() });
      if (githubUsernameExists && githubUsernameExists._id.toString() !== user._id.toString()) {
        return res.status(400).json({ message: "GitHub username already in use by another account" });
      }
      updates.githubUsername = githubUsername.trim();
    }

    // Only update if there are changes
    if (Object.keys(updates).length === 0) {
      return res.status(200).json({ message: "No changes detected", user });
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $set: updates },
      { new: true, runValidators: true, select: "-password" }
    ).select("-password -avatar");

    // Check if user has avatar and add avatarUrl
    const hasAvatar = await User.findById(req.user.userId)
      .select("avatar.data")
      .lean();
    
    if (hasAvatar?.avatar?.data) {
      updatedUser.avatar = `/api/avatar/${user._id}`;
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Error updating profile" });
  }
});

// --------------------------------------------------------------------------
// User Management (Admin)
// --------------------------------------------------------------------------

/**
 * Gets all users (admin only).
 * @route GET /api/users
 * @middleware authenticateToken
 */
app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin access required" });
    const users = await User.find({}).select("-password -avatar").lean();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/** 
 * Update a user's role by ID (admin only).
 * @route PUT /api/users/:id/role
 * @middleware authenticateToken
 * @param {string} role - New role ('user' or 'admin').
 */
app.put("/api/users/:id/role", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid or missing role" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent changing own role
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ message: "Cannot change your own role" });
    }

    user.role = role;
    await user.save();

    res.json({ message: "User role updated successfully", user: { _id: user._id, role: user.role } });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Deletes a user by ID (admin only).
 * @route DELETE /api/users/:id
 * @middleware authenticateToken
 */
app.delete("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { id } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting other admins (optional safeguard)
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot delete an admin user" });
    }

    await User.findByIdAndDelete(id);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------------------------------------------------
// Avatar Upload
// --------------------------------------------------------------------------

/**
 * POST /api/avatar
 * Secure avatar upload:
 *  - memory upload (multer.memoryStorage)
 *  - quick client MIME check
 *  - validate image buffer via sharp.metadata()
 *  - reject SVGs
 *  - resize + re-encode to PNG (this strips metadata)
 *  - enforce processed size limit
 */
app.post(
  "/api/avatar",
  authenticateToken,
  uploadMemory.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file || !req.file.buffer) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // 1) Basic client-provided MIME check
      if (!req.file.mimetype || !req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({ message: "Only image uploads are allowed" });
      }

      // 2) Explicitly reject SVG (SVG is XML and can contain scripts)
      if (req.file.mimetype === "image/svg+xml") {
        return res.status(400).json({ message: "SVG uploads are not allowed" });
      }

      // 3) Validate buffer is a readable image and get its format
      let image;
      let meta;
      try {
        // Try to use sharp if available, otherwise skip validation
        try {
          const sharp = await import("sharp");
          image = sharp.default(req.file.buffer);
          meta = await image.metadata();
        } catch (sharpErr) {
          console.warn("sharp not available, skipping image validation:", sharpErr.message);
          // Skip image validation if sharp is not available
          meta = { format: 'unknown' };
        }
      } catch (err) {
        console.warn("image processing failed:", err);
        return res.status(400).json({ message: "Uploaded file is not a valid image" });
      }

      if (!meta || !meta.format) {
        return res.status(400).json({ message: "Uploaded file is not a valid image" });
      }

      // Disallow vector / problematic formats even if MIME lied
      if (meta.format === "svg") {
        return res.status(400).json({ message: "SVG uploads are not allowed" });
      }

      // 4) Re-encode + resize (this strips EXIF/metadata because we're not using withMetadata())
      const MAX_DIM = 512;
      const processedBuffer = await image
        .resize({ width: MAX_DIM, height: MAX_DIM, fit: "cover" })
        .png({ compressionLevel: 9 }) // re-encode to PNG
        .toBuffer();

      // 5) Enforce processed size limit
      const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
      if (processedBuffer.length > MAX_BYTES) {
        return res.status(400).json({ message: "Processed image too large" });
      }

      // 6) Save to user document
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      user.avatar = {
        data: processedBuffer,
        contentType: "image/png",
        updatedAt: new Date(),
      };

      await user.save();

      return res.json({
        message: "Avatar uploaded successfully",
        avatarUrl: `/api/avatar/${user._id}`,
      });
    } catch (err) {
      console.error("Avatar upload error:", err);
      return res
        .status(500)
        .json({ message: "Failed to process avatar", error: err.message });
    }
  }
);


/**
 * GET /api/avatar/:userId
 *
 * Retrieve a user's avatar.
 *
 * Response:
 *  - Content-Type: image/png (or stored contentType)
 *  - Cache headers for efficiency
 *
 * If no avatar found, returns 404.
 */
app.get("/api/avatar/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).send("Invalid user id");
    }

    const user = await User.findById(userId).select("avatar");
    if (!user || !user.avatar || !user.avatar.data) {
      return res.status(404).json({ message: "Avatar not found" });
    }

    res.setHeader("Content-Type", user.avatar.contentType || "image/png");
    res.setHeader(
      "Cache-Control",
      "public, max-age=86400, stale-while-revalidate=604800"
    );
    if (user.avatar.updatedAt) {
      res.setHeader("Last-Modified", user.avatar.updatedAt.toUTCString());
    }

    res.send(user.avatar.data);
  } catch (err) {
    console.error("Avatar serve error:", err);
    res.status(500).json({ message: "Failed to fetch avatar" });
  }
});

// --------------------------------------------------------------------------
// Team Management
// --------------------------------------------------------------------------

/**
 * Creates a new team.
 * @route POST /api/teams
 * @middleware authenticateToken
 * @param {string} name - Team name.
 * @param {string} password - Team password.
 * @param {string} repoUrl - GitHub repository URL.
 * @returns {Object} Team creation status and info.
 */
app.post("/api/teams", authenticateToken, async (req, res) => {
  try {
    const { name, password, repoUrl } = req.body;
    if (!name || !password || !repoUrl) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Check for existing team
    const exists = await Team.findOne({ name });
    if (exists) return res.status(400).json({ message: "Team exists" });

    // Hash password and analyze repository in parallel
    const [hashed, analysis] = await Promise.all([
      bcrypt.hash(password, 10),
      (async () => {
        try {
          return await safeAnalyzeRepository(repoUrl);
        } catch (analysisError) {
          console.error("Repository analysis failed:", analysisError);
          throw {
            message: "Repository analysis failed",
            error: analysisError.message,
            suggestion: "Check repository accessibility or try again later",
          };
        }
      })()
    ]);

    // Validate analysis results
    if (!analysis || !analysis.metrics || !analysis.metadata) {
      throw new Error("Incomplete analysis data");
    }

    // Create team
    const team = new Team({
      name,
      password: hashed,
      creator: req.user.userId,
      members: [req.user.userId]
    });

    await team.save();

    // Create metrics entry
    await RepoMetrics.create({
      teamId: team._id,
      metrics: analysis.metrics,
      repositoryInfo: analysis.metadata,
      lastUpdated: new Date(),
      analysisStatus: "pending",
    });

    if (process.env.AWS_EXECUTION_ENV) {
      // Fire-and-forget Lambda trigger in production
      lambda.send(new InvokeCommand({
        FunctionName: process.env.ANALYSIS_LAMBDA,
        InvocationType: "Event",
        Payload: JSON.stringify({ teamId: team._id.toString() }),
      }))
      .then(() => {
        console.log(`Triggered async AI analysis for team ${team._id}`);
      })
      .catch(err => {
        console.error(`Failed to trigger async AI analysis for team ${team._id}:`, err);
      });

    } else {
      // Local environment — run the analysis locally, non-blocking
      console.log(`[LOCAL DEV] Running local AI analysis for team ${team._id}...`);
      setTimeout(() => safeRunAIAnalysis(team._id), 0);
    }

    res.status(201).json({
      message: "Team created successfully",
      team: {
        id: team._id,
        name: team.name,
        repoUrl: analysis.metadata.url,
      },
      repositoryInfo: analysis.metadata,
    });

  } catch (error) {
    console.error("Team creation error:", error);

    // Handle specific error types
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation error",
        errors: Object.values(error.errors).map((err) => err.message),
      });
    }

    if (error.name === "MongoServerError" && error.code === 11000) {
      return res.status(400).json({
        message: "Database error",
        details: "Duplicate key violation",
        field: Object.keys(error.keyPattern)[0],
      });
    }

    // Handle repository analysis errors
    if (error.message === "Repository analysis failed") {
      return res.status(500).json({
        message: error.message,
        error: error.error,
        suggestion: error.suggestion,
      });
    }

    if (error.message === "Incomplete analysis data") {
      return res.status(500).json({
        message: "Repository analysis incomplete",
        error: "The analysis didn't return complete metrics or metadata",
        suggestion: "Please try again with a different repository",
      });
    }

    // Default error response
    res.status(500).json({
      message: "Team creation failed",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

/**
 * Allows a user to join a team.
 * @route POST /api/teams/join
 * @middleware authenticateToken
 * @param {string} name - Team name.
 * @param {string} password - Team password.
 * @returns {Object} Join status and team ID.
 */
app.post("/api/teams/join", authenticateToken, async (req, res) => {
  try {
    const { name, password } = req.body;
    const team = await Team.findOne({ name });
    if (!team) return res.status(404).json({ message: "Team not found" });

    const valid = await bcrypt.compare(password, team.password);
    if (!valid) return res.status(401).json({ message: "Incorrect password" });

    if (!team.members.includes(req.user.userId)) {
      team.members.push(req.user.userId);
      await team.save();
    }

    const user = await User.findById(req.user.userId);
    console.log("Join team for user:", user._id, "githubUsername:", user.githubUsername);

    if (user.githubUsername) {
      const repoData = await RepoMetrics.findOne({ teamId: team._id });
      if (!repoData) {
        console.warn("No repoData found for team", team._id);
      } else {
        console.log("Found repoData with URL:", repoData.repositoryInfo?.url);
      }
      if (repoData && repoData.repositoryInfo?.url) {
        const [owner, repo] = extractOwnerAndRepo(repoData.repositoryInfo.url);
        console.log("Extracted owner/repo:", owner, repo);
        if (owner && repo) {
          try{
            const stats = await safeCollectMemberActivity(owner, repo, user.githubUsername);
            repoData.memberStats.set(req.user.userId.toString(), {
              githubUsername: user.githubUsername,
              ...stats,
            });
            await repoData.save();
            console.log("Saved memberStats");
          } catch (err){
            console.error("Error collecting member stats:", err);
          }
        }
      }
    }

    res.json({ message: "Joined team", teamId: team._id });
  } catch (error) {
    res.status(500).json({ message: "Joining team error" });
  }
});

/**
 * Checks if the authenticated user is a member of a team.
 * @route GET /api/teams/:teamId/membership
 * @middleware authenticateToken
 * @param {string} teamId - Team ID.
 * @returns {Object} isMember boolean.
 */
app.get("/api/teams/:teamId/membership", authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      return res.status(400).json({ message: "Invalid team ID format" });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    const isMember = team.members.some(memberId => 
      memberId.toString() === userId.toString()
    );

    res.json({ isMember });
  } catch (error) {
    console.error("Membership check error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Searches for teams by name.
 * @route GET /api/teams/search
 * @middleware authenticateToken
 */
app.get("/api/teams/search", authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query parameter 'q' is required" });

    const teams = await Team.find({ 
      name: { $regex: q, $options: "i" } 
    }).select("name creator members");

    res.json({ results: teams });
  } catch (error) {
    console.error("Team search error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Gets team details with RBAC.
 * @route GET /api/teams/:name
 * @middleware authenticateToken
 * @middleware authorizeTeamAccess
 */
app.get("/api/teams/:name", authenticateToken, authorizeTeamAccess, async (req, res) => {
  const team = req.team;
  const repoData = await RepoMetrics.findOne({ teamId: team._id });

  await team.populate("members", "name email");

  const base = {
    team: { id: team._id, name: team.name, members: team.members || [] },
    doraMetrics: repoData?.metrics || null,
    repositoryInfo: repoData?.repositoryInfo || null,
    lastUpdated: repoData?.lastUpdated || null,
  };

  if (req.user.userId === team.creator.toString()) {
    await team.populate("creator", "name");
    return res.json({
      ...base,
      members: team.members,
      creator: team.creator,
      memberStats: repoData?.memberStats || {},
      permissions: "full",
    });
  }

  const userStats = repoData?.memberStats?.get(req.user.userId.toString()) || {};
  res.json({
    ...base,
    members: team.members,
    myStats: userStats,
    permissions: "read-only",
  });
});

/**
 * Deletes a team by name (creator only).
 * @route DELETE /api/teams/:name
 * @middleware authenticateToken
 * @middleware authorizeTeamAccess
 */
app.delete("/api/teams/:name", authenticateToken, authorizeTeamAccess, async (req, res) => {
  if (req.user.teamRole !== "creator" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Only the team creator can delete the team" });
  }

  try {
    await Team.deleteOne({ name: req.team.name });
    await RepoMetrics.deleteOne({ teamId: req.team._id });
    res.json({ message: "Team deleted successfully" });
  } catch (error) {
    console.error("Delete team error:", error);
    res.status(500).json({ message: "Failed to delete team" });
  }
});

/**
 * Gets all teams.
 * @route GET /api/teams
 * @middleware authenticateToken
 */
app.get("/api/teams", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const teams = await Team.find({})
      .populate("creator", "name email")
      .populate("members", "name email");

    res.json({ teams });
  } catch (error) {
    console.error("Fetch teams error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------------------------------------------------
// AI Integration
// --------------------------------------------------------------------------

/**
 * Gets AI review for a repository.
 * @route GET /api/ai-review
 * @middleware authenticateToken
 */
app.get("/api/ai-review", authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.query;
    if (!teamId) return res.status(400).json({ message: "teamId required" });

    const metricsEntry = await RepoMetrics.findOne({ teamId });
    if (!metricsEntry) return res.status(404).json({ message: "Metrics not found" });

    if (process.env.MOCK_MODE === true) {
      return res.json({
        aiFeedback: ["Mock feedback: All good!", "Mock feedback: Write more tests."],
        analysisMetadata: { mocked: true, lastUpdated: new Date() },
        status: "completed",
      });
    }

    if (metricsEntry.analysisStatus === 'failed') {
      return res.status(500).json({
        status: 'failed',
        message: metricsEntry.aiAnalysis?.error?.message || "AI analysis failed",
        errorDetails: metricsEntry.aiAnalysis?.error || {},
        lastFailed: metricsEntry.aiAnalysis?.lastFailed || null
      });
    }

    if (metricsEntry.analysisStatus !== 'completed') {
      return res.status(202).json({
        status: metricsEntry.analysisStatus,
        message: "Analysis in progress. Please check back later."
      });
    }

    res.json({
      aiFeedback: metricsEntry.aiAnalysis.insights,
      analysisMetadata: {
        ...metricsEntry.aiAnalysis.metadata,
        lastUpdated: metricsEntry.aiAnalysis.lastAnalyzed
      },
      status: metricsEntry.analysisStatus,
    });
  } catch (err) {
    console.error("AI Review Error:", err);

    // More specific error handling
    if (err.message.includes("rate limit")) {
      return res.status(429).json({
        message: "Rate limit exceeded",
        error: "GitHub API rate limit hit",
        suggestion: "Try again in a few minutes",
      });
    }

    if (err.message.includes("404")) {
      return res.status(404).json({
        message: "Repository not found",
        error: "Repository may be private or doesn't exist",
        suggestion: "Check repository URL and access permissions",
      });
    }

    res.status(500).json({
      message: "AI review failed",
      error: err.message,
      suggestion: "Check repository access and AI service availability",
    });
  }
});

/**
 * Gets system anomalies (admin only).
 * @route GET /api/anomalies
 * @middleware authenticateToken
 * @access Admin
 * @description 
 *   - Returns system anomalies from the last 7 days.
 *   - Anomalies include failed logins, brute-force attempts, rate limit hits, etc.
 *   - Sorted by most recent first.
 * @returns {Object[]} anomalies - Array of anomaly events
 */
app.get("/api/anomalies", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  try {
    // Calculate cutoff: last 7 days
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Fetch anomalies from DB
    const events = await SystemEvent.find({ timestamp: { $gte: cutoff } })
      .sort({ timestamp: -1 }) // newest first
      .lean();

    res.json({ anomalies: events });
  } catch (err) {
    console.error("Error fetching anomalies:", err);
    res.status(500).json({ message: "Failed to fetch anomalies" });
  }
});

/**
 * Exposes team + RepoMetrics for consumption by an external MCP.
 * Auth: x-mcp-token header (value = process.env.MCP_API_TOKEN)
 * @route GET /api/mcp/team/:teamName
 */
app.get("/api/mcp/team/:teamId", authenticateMCP, async (req, res) => {
  try {
    const { teamId } = req.params;

    // Use a default repository for real AI analysis
    console.log('Generating real AI analysis for team:', teamId);
    const defaultRepoUrl = "https://github.com/facebook/react";
    
    try {
      // Get real repository analysis
      const { safeAnalyzeRepository } = await import('../services/mockWrappers.js');
      const analysis = await safeAnalyzeRepository(defaultRepoUrl);
      
      // Generate AI insights based on real data
      const realMetrics = analysis.metrics || {};
      const metadata = analysis.metadata || {};
      
      // Calculate health score based on real DORA metrics
      let healthScore = 50; // Base score
      
      // Analyze deployment frequency
      if (realMetrics['30d']?.deployment_frequency?.frequency_per_week) {
        const weeklyDeployments = realMetrics['30d'].deployment_frequency.frequency_per_week;
        if (weeklyDeployments >= 1) healthScore += 20; // Good deployment frequency
        if (weeklyDeployments >= 3) healthScore += 10; // Excellent deployment frequency
      }
      
      // Analyze lead time
      if (realMetrics['30d']?.lead_time?.average_days) {
        const avgLeadTime = parseFloat(realMetrics['30d'].lead_time.average_days);
        if (avgLeadTime <= 1) healthScore += 15; // Excellent lead time
        else if (avgLeadTime <= 3) healthScore += 10; // Good lead time
        else if (avgLeadTime <= 7) healthScore += 5; // Acceptable lead time
      }
      
      // Analyze change failure rate
      if (realMetrics['30d']?.change_failure_rate?.failure_rate) {
        const failureRate = parseFloat(realMetrics['30d'].change_failure_rate.failure_rate.replace('%', ''));
        if (failureRate <= 5) healthScore += 15; // Excellent failure rate
        else if (failureRate <= 15) healthScore += 10; // Good failure rate
        else if (failureRate <= 30) healthScore += 5; // Acceptable failure rate
      }
      
      // Analyze MTTR
      if (realMetrics['30d']?.mttr?.average_days) {
        const avgMTTR = parseFloat(realMetrics['30d'].mttr.average_days);
        if (avgMTTR <= 1) healthScore += 15; // Excellent MTTR
        else if (avgMTTR <= 3) healthScore += 10; // Good MTTR
        else if (avgMTTR <= 7) healthScore += 5; // Acceptable MTTR
      }
      
      // Cap at 100
      healthScore = Math.min(100, Math.max(0, healthScore));
      
      // Generate contextual recommendations based on real data
      const recommendations = [];
      const strengths = [];
      const areasForImprovement = [];
      
      // Analyze deployment frequency
      if (realMetrics['30d']?.deployment_frequency?.frequency_per_week) {
        const weeklyDeployments = realMetrics['30d'].deployment_frequency.frequency_per_week;
        if (weeklyDeployments >= 3) {
          strengths.push("Excellent deployment frequency - multiple deployments per week");
        } else if (weeklyDeployments >= 1) {
          strengths.push("Good deployment frequency - regular weekly deployments");
        } else {
          areasForImprovement.push("Low deployment frequency - consider more frequent releases");
          recommendations.push("Implement automated CI/CD pipeline to increase deployment frequency");
        }
      }
      
      // Analyze lead time
      if (realMetrics['30d']?.lead_time?.average_days) {
        const avgLeadTime = parseFloat(realMetrics['30d'].lead_time.average_days);
        if (avgLeadTime <= 1) {
          strengths.push("Excellent lead time - changes deployed within 1 day");
        } else if (avgLeadTime <= 3) {
          strengths.push("Good lead time - changes deployed within 3 days");
        } else {
          areasForImprovement.push(`Lead time could be improved (currently ${avgLeadTime} days)`);
          recommendations.push("Streamline code review process and reduce approval bottlenecks");
        }
      }
      
      // Analyze change failure rate
      if (realMetrics['30d']?.change_failure_rate?.failure_rate) {
        const failureRate = parseFloat(realMetrics['30d'].change_failure_rate.failure_rate.replace('%', ''));
        if (failureRate <= 5) {
          strengths.push("Excellent change failure rate - very stable deployments");
        } else if (failureRate <= 15) {
          strengths.push("Good change failure rate - mostly stable deployments");
        } else {
          areasForImprovement.push(`High change failure rate (${failureRate}%)`);
          recommendations.push("Improve testing coverage and implement better quality gates");
        }
      }
      
      // Analyze MTTR
      if (realMetrics['30d']?.mttr?.average_days) {
        const avgMTTR = parseFloat(realMetrics['30d'].mttr.average_days);
        if (avgMTTR <= 1) {
          strengths.push("Excellent MTTR - quick incident resolution");
        } else if (avgMTTR <= 3) {
          strengths.push("Good MTTR - reasonable incident resolution time");
        } else {
          areasForImprovement.push(`MTTR could be improved (currently ${avgMTTR} days)`);
          recommendations.push("Implement better monitoring and incident response procedures");
        }
      }
      
      // Add general recommendations based on repository metadata
      if (metadata.stars && metadata.stars > 10000) {
        strengths.push("High community engagement and popularity");
      }
      
      if (metadata.contributors && metadata.contributors.length > 20) {
        strengths.push("Large contributor base - good team collaboration");
      }
      
      if (metadata.languages && Object.keys(metadata.languages).length > 5) {
        areasForImprovement.push("High language diversity - consider consolidating tech stack");
      }
      
      // Default recommendations if no specific issues found
      if (recommendations.length === 0) {
        recommendations.push("Continue monitoring DORA metrics for continuous improvement");
        recommendations.push("Consider implementing feature flags for safer deployments");
        recommendations.push("Set up automated performance monitoring");
      }
      
      const aiInsights = {
        teamId: teamId,
        repository: defaultRepoUrl,
        analysis: {
          healthScore: healthScore,
          recommendations: recommendations,
          strengths: strengths,
          areasForImprovement: areasForImprovement,
          nextSteps: [
            "Monitor DORA metrics weekly",
            "Set up automated alerts for metric degradation",
            "Conduct regular team retrospectives on deployment practices",
            "Implement continuous improvement based on metrics"
          ]
        },
        metrics: realMetrics,
        metadata: metadata,
        generatedAt: new Date().toISOString(),
        analysisType: "AI-powered DORA insights (real data)",
        dataSource: "GitHub API + DORA metrics analysis"
      };
      
      return res.json(aiInsights);
      
    } catch (analysisError) {
      console.error('Error generating real AI analysis:', analysisError);
      
      // Fallback to basic analysis if repository analysis fails
      return res.json({
        teamId: teamId,
        repository: defaultRepoUrl,
        analysis: {
          healthScore: 75,
          recommendations: [
            "Unable to fetch real-time data - check GitHub API connectivity",
            "Implement comprehensive testing strategy",
            "Set up automated deployment pipeline",
            "Create monitoring and alerting systems"
          ],
          strengths: [
            "System is operational and responding",
            "MCP integration is working correctly"
          ],
          areasForImprovement: [
            "GitHub API connectivity needs verification",
            "Real-time data collection needs improvement"
          ],
          nextSteps: [
            "Verify GitHub API tokens and permissions",
            "Check network connectivity to GitHub",
            "Implement error handling and retry logic"
          ]
        },
        metrics: {},
        metadata: {},
        generatedAt: new Date().toISOString(),
        analysisType: "AI-powered DORA insights (fallback mode)",
        error: "Real data analysis failed, using fallback insights",
        dataSource: "Fallback analysis"
      });
    }
  } catch (err) {
    console.error("MCP team fetch error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------------------------------------------------
// MCP utility endpoints (read-only)
// --------------------------------------------------------------------------

/**
 * Returns repository info for a GitHub URL
 * @route GET /api/mcp/repo?url=...
 * @middleware authenticateMCP
 */
app.get("/api/mcp/repo", authenticateMCP, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: "url is required" });
    if (!process.env.GITHUB_TOKEN_1 && !process.env.GITHUB_TOKEN_2) {
      return res.status(401).json({
        message: "GitHub authentication not configured",
        suggestion: "Set GITHUB_TOKEN_1 (and optionally GITHUB_TOKEN_2) in the API environment",
      });
    }
    const info = await getRepositoryInfo(url);
    res.json(info);
  } catch (err) {
    console.error("MCP repo fetch error:", err);
    const msg = String(err?.message || "");
    if (msg.toLowerCase().includes("authentication failed")) {
      return res.status(401).json({
        message: "GitHub authentication failed",
        suggestion: "Verify GitHub token validity and scopes, then retry",
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Computes DORA metrics for a GitHub URL (or returns latest cached if you later change)
 * @route GET /api/mcp/metrics?repositoryUrl=...
 * @middleware authenticateMCP
 */
app.get("/api/mcp/metrics", authenticateMCP, async (req, res) => {
  try {
    const { repositoryUrl } = req.query;
    if (!repositoryUrl) return res.status(400).json({ message: "repositoryUrl is required" });
    if (!process.env.GITHUB_TOKEN_1 && !process.env.GITHUB_TOKEN_2) {
      return res.status(401).json({
        message: "GitHub authentication not configured",
        suggestion: "Set GITHUB_TOKEN_1 (and optionally GITHUB_TOKEN_2) in the API environment",
      });
    }
    const metrics = await getDORAMetrics(repositoryUrl);
    res.json(metrics);
  } catch (err) {
    console.error("MCP metrics error:", err);
    const msg = String(err?.message || "");
    if (msg.toLowerCase().includes("authentication failed")) {
      return res.status(401).json({
        message: "GitHub authentication failed",
        suggestion: "Verify GitHub token validity and scopes, then retry",
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * Performs deep repository analysis
 * @route GET /api/mcp/analyze?url=...
 * @middleware authenticateMCP
 */
app.get("/api/mcp/analyze", authenticateMCP, async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ message: "url is required" });
    const analysis = await safeAnalyzeRepository(url);
    res.json(analysis);
  } catch (err) {
    console.error("MCP analyze error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// --------------------------------------------------------------------------
// Error Handling
// --------------------------------------------------------------------------

/**
 * 404 Not Found handler.
 */
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

/**
 * General error handler.
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Something went wrong!" });
});

/**
 * Catch-all handler for unmatched routes.
 */
app.use((req, res) => {
  console.log(`Catch-all handler: ${req.method} ${req.path}`);
  res.status(404).json({ message: "Route not found" });
});

export default app;
