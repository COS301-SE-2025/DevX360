import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import rateLimit from "express-rate-limit";
import multer from "multer";
import mongoose from "mongoose";
import { performDORAAnalysis } from "../services/codeInterpretor.js";
import { parseGitHubUrl } from "../Data_Collection/repository-info-service.js";
import { getRepositoryInfo } from "../Data_Collection/repository-info-service.js";
import { analyzeRepository } from "../services/metricsService.js";
import RepoMetrics from "./models/RepoMetrics.js";
import { hashPassword, comparePassword, generateToken } from "./utils/auth.js";
import cookieParser from "cookie-parser";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const upload = multer({ dest: path.join(__dirname, "uploads") });
const app = express();
app.use(cookieParser());

// Load environment variables
import "dotenv/config";

// Middleware
const allowedOrigins = [
  "http://localhost:5500",
  "http://localhost:5050",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS error: Not allowed"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const JWT_SECRET = process.env.JWT_SECRET;

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Import models
import User from "./models/User.js";
import Team from "./models/Team.js";

// JWT auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Access token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err)
      return res.status(403).json({ message: "Invalid or expired token" });
    req.user = user;
    next();
  });
};

// Routes
app.get("/api/health", async (req, res) => {
  try {
    const dbStatus =
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected";
    
    let ollamaStatus = "Unavailable";
    try {
      const ollamaRes = await fetch("http://localhost:11434");
      ollamaStatus = ollamaRes.status === 200 ? "Operational" : "Unavailable";
    } catch (ollamaError) {
      // Ollama service is not available, but this shouldn't cause a 500 error
      ollamaStatus = "Unavailable";
    }

    res.json({
      status: "OK",
      database: dbStatus,
      ollama: ollamaStatus,
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

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid email" });

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid)
      return res.status(401).json({ message: "Invalid password" });

    user.lastLogin = new Date();
    await user.save();

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
        user,
      });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    const teams = await Team.find({ members: user._id }).select("name");

    if (!user) return res.status(404).json({ message: "User not found" });

    const userObj = user.toObject();
    userObj.teams = teams;
    if (user.avatar) {
      userObj.avatar = `/uploads/${user.avatar}`;
    }
    res.json({ user: userObj });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/profile", authenticateToken, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};

    if (!name && !email && !password) {
      return res
        .status(400)
        .json({
          message: "At least one field (name, email, or password) is required",
        });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) {
      updates.name = name.trim();
    }

    if (email) {
      const emailExists = await User.findOne({
        email: email.trim().toLowerCase(),
      });
      if (emailExists && emailExists._id.toString() !== req.user.userId) {
        return res
          .status(400)
          .json({ message: "Email already in use by another account" });
      }
      updates.email = email.trim().toLowerCase();
    }

    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters" });
      }
      updates.password = await hashPassword(password);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
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

app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin access required" });
    const users = await User.find({}).select("-password");
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/logout", authenticateToken, (req, res) => {
  console.log("User logged out:", { email: req.user.email });
  res.clearCookie("token").json({ message: "Logged out" });
});

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
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
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

app.post("/api/teams", authenticateToken, async (req, res) => {
  try {
    const { name, password, repoUrl } = req.body;
    if (!name || !password || !repoUrl)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await Team.findOne({ name });
    if (exists) return res.status(400).json({ message: "Team exists" });

    const hashed = await bcrypt.hash(password, 12);
    const team = new Team({
      name,
      password: hashed,
      creator: req.user.userId,
      members: [req.user.userId],
      repoUrl,
    });

    await team.save();

    let owner, repo;
    try {
      ({ owner, repo } = parseGitHubUrl(repoUrl));
    } catch (parseError) {
      return res.status(400).json({
        message: "Invalid GitHub URL",
        details: parseError.message,
        example: "Valid format: https://github.com/username/repository",
      });
    }

    let metrics;
    let repositoryInfo;
    try {
      const analysis = await analyzeRepository(repoUrl);
      metrics = analysis.metrics;
      repositoryInfo = await getRepositoryInfo(repoUrl);
    } catch (analysisError) {
      console.error("Repository analysis failed:", analysisError);
      return res.status(500).json({
        message: "Repository analysis failed",
        error: analysisError.message,
        suggestion: "Check repository accessibility or try again later",
      });
    }

    await RepoMetrics.create({
      teamId: team._id,
      repoUrl,
      owner,
      repo,
      metrics,
      repositoryInfo, 
      lastUpdated: new Date(),
    });

    res.status(201).json({
      message: "Team created successfully",
      team: {
        id: team._id,
        name: team.name,
        repoUrl: team.repoUrl,
      },
      repositoryInfo,
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

    // Default error response
    res.status(500).json({
      message: "Team creation failed",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

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

    res.json({ message: "Joined team", teamId: team._id });
  } catch (error) {
    res.status(500).json({ message: "Joining team error" });
  }
});

app.get("/api/teams/:name", authenticateToken, async (req, res) => {
  try {
    const team = await Team.findOne({ name: req.params.name })
      .populate("creator", "name")
      .populate("members", "name email");

    if (!team) return res.status(404).json({ message: "Team not found" });

    const repoData = await RepoMetrics.findOne({ teamId: team._id });

    res.json({
      team,
      doraMetrics: repoData?.metrics || null,       // Existing DORA metrics
      repositoryInfo: repoData?.repositoryInfo || null, // Full GitHub data
      lastUpdated: repoData?.lastUpdated || null,
    });
  } catch (err) {
    console.error("Error retrieving team info:", err);
    res.status(500).json({ message: "Failed to retrieve team info" });
  }
});

//AI INTERGATION
app.get("/api/ai-review", authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.query; // Changed from req.body to req.query
    if (!teamId)
      return res
        .status(400)
        .json({ message: "teamId query parameter is required" });

    const metricsEntry = await RepoMetrics.findOne({ teamId });
    if (!metricsEntry)
      return res.status(404).json({ message: "Metrics not found" });

    const { repoUrl, metrics } = metricsEntry;
    const { owner, repo } = parseGitHubUrl(repoUrl);

    console.log(`Starting optimized AI review for ${owner}/${repo}...`);
    const startTime = Date.now();

    // Step 1: Analyze the repository (structure + DORA indicators)
    const { insights, repositoryAnalysis, performance, analyzedFiles } =
      await performDORAAnalysis(owner, repo, metrics);

    const totalTime = Date.now() - startTime;
    // Handle case where no indicators were found
    const totalIndicators = Object.values(
      repositoryAnalysis.doraIndicators
    ).flat().length;
    if (totalIndicators === 0) {
      return res.status(404).json({
        message: "No DORA-relevant files or patterns found in this repository",
        suggestion:
          "Ensure your repository contains CI/CD, tests, monitoring, or security-related files",
      });
    }

    console.log(`AI review completed in ${Math.round(totalTime / 1000)}s`);

    res.json({
      aiFeedback: insights,
      analyzedFiles,
      analysisMetadata: {
        repo: repositoryAnalysis.repository.name,
        primaryLanguage: repositoryAnalysis.repository.language,
        doraIndicatorsFound: totalIndicators,
        filesAnalyzed: performance.filesAnalyzed,
        doraMetricsCovered: Object.keys(
          repositoryAnalysis.doraIndicators
        ).filter((k) => repositoryAnalysis.doraIndicators[k].length > 0),
        processingTimeMs: totalTime,
        analyzedAt: repositoryAnalysis.analyzedAt,
      },
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

//Error handling
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Something went wrong!" });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
