import mongoose from "mongoose";
import RepoMetrics from "./api/models/RepoMetrics.js";
import { safeRunAIAnalysis } from "./services/mockWrappers.js";

let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedDb && mongoose.connection.readyState === 1) return cachedDb;

  console.log("Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 20000,
    connectTimeoutMS: 15000,
    bufferCommands: false,
  });

  cachedDb = mongoose.connection;
  console.log("MongoDB connected for analysis runner");
  return cachedDb;
};

export const handler = async (event) => {
  const { teamId } = typeof event === "string" ? JSON.parse(event) : event;
  if (!teamId) {
    console.error("No teamId passed to analysisRunner");
    return;
  }

  try {
    await connectToDatabase();

    console.log(`Starting AI analysis for team ${teamId}`);
    const insights = await safeRunAIAnalysis(teamId);

    await RepoMetrics.updateOne(
      { teamId },
      {
        $set: {
          "aiAnalysis.insights": insights,
          "aiAnalysis.lastAnalyzed": new Date(),
          analysisStatus: "completed",
        },
      }
    );
    console.log(`AI analysis completed for team ${teamId}`);
  } catch (err) {
    console.error(`AI analysis failed for team ${teamId}:`, err);

    await RepoMetrics.updateOne(
      { teamId },
      {
        $set: {
          "aiAnalysis.error": { message: err.message },
          "aiAnalysis.lastFailed": new Date(),
          analysisStatus: "failed",
        },
      }
    );
  } finally {
    await mongoose.disconnect();
  }
};
