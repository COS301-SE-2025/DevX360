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
import { getRepositoryInfo, collectMemberActivity, extractOwnerAndRepo } from "../Data Collection/repository-info-service.js";
import { analyzeRepository } from "../services/metricsService.js";
import { runAIAnalysis } from "../services/analysisService.js";
import RepoMetrics from "./models/RepoMetrics.js";
import { hashPassword, comparePassword, generateToken, authenticateMCP } from "./utils/auth.js";
import { authorizeTeamAccess } from "./middlewares/authorizeTeamAccess.js";

// --------------------------------------------------------------------------
// Path and Upload Setup
// --------------------------------------------------------------------------

/**
 * __dirname equivalent for ES modules.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Multer middleware for handling file uploads.
 */
const upload = multer({ dest: path.join(__dirname, "uploads") });

/**
 * Express application instance.
 */
const app = express();

/**
 * Cookie parser middleware.
 */
app.use(cookieParser());

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

/**
 * Middleware for parsing JSON request bodies.
 */
app.use(express.json());

/**
 * Static file serving for uploaded files.
 */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --------------------------------------------------------------------------
// Rate Limiting
// --------------------------------------------------------------------------

/**
 * Express rate limiter to prevent abuse.
 */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
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
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
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

// --------------------------------------------------------------------------
// Health Check Endpoint
// --------------------------------------------------------------------------

/**
 * Health check endpoint.
 * @route GET /api/health
 * @returns {Object} API and database status.
 */
app.get("/api/health", async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    
    res.json({
      status: "OK",
      database: dbStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
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
      role: role.trim(),
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
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
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
  console.log("GITHUB OAUTH ENDPOINT");
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user`;
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

    // Fetch user info from GitHub
    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const githubUser = await userRes.json();

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
      secure: process.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const redirectUrl = `${frontendUrl}/dashboard/overview`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    res.redirect(`${frontendUrl}/login?error=github_auth_failed`);
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

    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid password" });

    User.updateOne({ _id: user._id }, { $set: { lastLogin: new Date() } }).exec();

    const token = generateToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Lax",
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
  res.clearCookie("token").json({ message: "Logged out" });
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
    const user = await User.findById(req.user.userId).select("-password").lean();

    if (!user) return res.status(404).json({ message: "User not found" });

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
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members",
        },
      },
      { $unwind: "$creator" },
    ]);

    // Get all repo metrics in a single query
    const teamIds = teams.map(t => t._id);
    const repoDataList = await RepoMetrics.find({
      teamId: { $in: teamIds }
    }).lean();

    const teamsWithMetrics = teams.map(team => {
      const repoData = repoDataList.find(r => r.teamId.toString() === team._id.toString());
      return {
        id: team._id,
        name: team.name,
        creator: team.creator,
        members: team.members,
        doraMetrics: repoData?.metrics || null,
        repositoryInfo: repoData?.repositoryInfo || null,
      };
    });

    user.teams = teamsWithMetrics;
    if (user.avatar) {
      user.avatar = `/uploads/${user.avatar}`;
    }
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
    const user = await User.findById(req.user.userId);
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
    ).select("-password");

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
    const users = await User.find({}).select("-password").lean();
    res.json({ users });
  } catch (error) {
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
 * Uploads a user avatar image.
 * @route POST /api/avatar
 * @middleware authenticateToken
 * @middleware upload.single("avatar")
 */
app.post(
  "/api/avatar",
  authenticateToken,
  upload.single("avatar"),
  async (req, res) => {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.avatar) {
        const oldPath = path.join(__dirname, "uploads", user.avatar);
        fs.promises.unlink(oldPath).catch(() => {});
      }

      user.avatar = req.file.filename;
      await user.save();

      res.json({
        message: "Avatar uploaded",
        avatarUrl: `/uploads/${req.file.filename}`,
      });
    } catch (error) {
      res.status(500).json({ message: "Avatar upload error" });
    }
  }
);

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
          return await analyzeRepository(repoUrl);
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
    });

    // Non-blocking AI analysis
    setTimeout(() => runAIAnalysis(team._id), 0);

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
            const stats = await collectMemberActivity(owner, repo, user.githubUsername);
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
 * Exposes team + RepoMetrics for consumption by an external MCP.
 * Auth: x-mcp-token header (value = process.env.MCP_API_TOKEN)
 * @route GET /api/mcp/team/:teamName
 */
app.get("/api/mcp/team/:teamName", authenticateMCP, async (req, res) => {
  try {
    const { teamName } = req.params;

    const team = await Team.findOne({ name: teamName })
      .populate("creator", "name email")
      .populate("members", "name email")
      .lean();

    if (!team) return res.status(404).json({ message: "Team not found" });

    const repoData = await RepoMetrics.findOne({ teamId: team._id }).lean();

    let memberStats = {};
    if (repoData?.memberStats) {
      try {
        memberStats = Object.fromEntries(repoData.memberStats);
      } catch {
        memberStats = repoData.memberStats;
      }
    }

    res.json({
      team: {
        name: team.name,
        creator: team.creator || null,
        members: team.members || [],
      },
      repositoryInfo: repoData?.repositoryInfo || null,
      doraMetrics: repoData?.metrics || null,
      memberStats,
      lastUpdated: repoData?.lastUpdated || null,
    });
  } catch (err) {
    console.error("MCP team fetch error:", err);
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
  res.status(404).json({ message: "Route not found" });
});

export default app;
