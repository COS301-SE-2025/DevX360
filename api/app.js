const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const multer = require("multer");
const mongoose = require("mongoose");
//INTEGRATION WITH DATA INGESTION
const { fetchRepoCodeFiles } = require('../services/codeFetcher');
const { interpretCodeLocally } = require('../services/codeInterpretor');
const { analyzeWithMistral } = require('../services/aiReviewer');
const { parseGitHubUrl } = require('../Data Collection/repository-info-service');
const { analyzeRepository } = require("../services/metricsService");
const RepoMetrics = require("./models/RepoMetrics");
//INTEGRATION WITH DATA INGESTION
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("./utils/auth");
const upload = multer({ dest: "uploads/" });
const path = require("path");
const fs = require("fs");
const app = express();
const cookieParser = require("cookie-parser");
app.use(cookieParser());

require("dotenv").config();
require("./db");

// Middleware
const allowedOrigins = ["http://localhost:5500"];

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

const User = require("./models/User");
const Team = require("./models/Team");

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
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database:
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  });
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
        message: "Login successful",
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

    res.json({ user: { ...user.toObject(), teams } });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const updates = {};
    
    if (!name && !email && !password) {
      return res.status(400).json({ message: "At least one field (name, email, or password) is required" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) {
      updates.name = name.trim();
    }
    
    if (email) {
      const emailExists = await User.findOne({ email: email.trim().toLowerCase() });
      if (emailExists && emailExists._id.toString() !== req.user.userId) {
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

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ 
      message: "Profile updated successfully",
      user: updatedUser 
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
    const { name, password, repoURL } = req.body;
    if (!name || !password || !repoURL)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await Team.findOne({ name });
    if (exists) return res.status(400).json({ message: "Team exists" });

    const hashed = await bcrypt.hash(password, 12);
    const team = new Team({
      name,
      password: hashed,
      creator: req.user.userId,
      members: [req.user.userId],
      repoURL
    });

    await team.save();

    const { owner, repo } = parseGitHubUrl(repoURL);
    const { metrics } = await analyzeRepository(repoURL);

    await RepoMetrics.create({
      teamId: team._id,
      repoURL,
      owner,
      repo,
      metrics,
      lastUpdated: new Date()
    });

    res.status(201).json({ message: "Team created", team });
  } catch (error) {
    res.status(500).json({ message: "Team creation error" });
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

    const metrics = await RepoMetrics.findOne({ teamId: team._id });

    res.json({
      team,
      doraMetrics: metrics?.metrics || null,
      lastUpdated: metrics?.lastUpdated || null
    });
  } catch (err) {
    console.error("Error retrieving team info:", err);
    res.status(500).json({ message: "Failed to retrieve team info" });
  }
});

//AI INTERGATION
app.post("/api/ai-review", authenticateToken, async (req, res) => {
  try {
    const { teamId } = req.body;
    if (!teamId) return res.status(400).json({ message: "teamId is required" });

    const metricsEntry = await RepoMetrics.findOne({ teamId });
    if (!metricsEntry) return res.status(404).json({ message: "Metrics not found" });

    const { repoUrl, metrics } = metricsEntry;
    const { owner, repo } = parseGitHubUrl(repoUrl);

    const codeFiles = await fetchRepoCodeFiles(owner, repo);
    const interpreted = await interpretCodeLocally(codeFiles);
    const feedback = await analyzeWithMistral(interpreted, metrics);

    res.json({ aiFeedback: feedback });
  } catch (err) {
    console.error("AI Review Error:", err);
    res.status(500).json({ message: "AI review failed" });
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

module.exports = app;