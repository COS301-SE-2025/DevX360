// services/mockWrappers.js
import { analyzeRepository } from "./metricsService.js";
import { runAIAnalysis } from "./analysisService.js";
import { collectMemberActivity } from "../Data-Collection/repository-info-service.js";

const MOCK_MODE = process.env.MOCK_MODE === "true";

/**
 * Safe wrapper for analyzeRepository
 */
export async function safeAnalyzeRepository(url, userId = null) {
  if (MOCK_MODE) {
    console.log("MOCK: analyzeRepository called for", url);
    return {
      metrics: {
        deploymentFrequency: "daily",
        leadTimeForChanges: "2h",
        changeFailureRate: "5%",
        timeToRestoreService: "1h",
      },
      metadata: {
        url,
        name: "mock-repo",
        owner: "mock-owner",
        description: "This is mock repository metadata",
      },
    };
  }
  
  try {
    return await analyzeRepository(url, userId);
  } catch (error) {
    console.error("analyzeRepository failed, returning mock data:", error.message);
    // Return mock data when GitHub tokens are not available
    return {
      metrics: {
        deploymentFrequency: "daily",
        leadTimeForChanges: "2h", 
        changeFailureRate: "5%",
        timeToRestoreService: "1h",
      },
      metadata: {
        url,
        name: "demo-repo",
        owner: "demo-owner", 
        description: "Demo repository analysis (GitHub tokens not available)",
      },
      error: "GitHub tokens not available in deployed environment",
      mock: true
    };
  }
}

/**
 * Safe wrapper for analyzeRepository with user-provided GitHub token
 */
export async function safeAnalyzeRepositoryWithToken(url, githubToken) {
  if (MOCK_MODE) {
    console.log("MOCK: analyzeRepositoryWithToken called for", url);
    return {
      metrics: {
        deploymentFrequency: "daily",
        leadTimeForChanges: "2h",
        changeFailureRate: "5%",
        timeToRestoreService: "1h",
      },
      metadata: {
        url,
        name: "mock-repo",
        owner: "mock-owner",
        description: "This is mock repository metadata (user token)",
      },
    };
  }
  
  try {
    // Import the analysis functions
    const { analyzeRepositoryWithToken } = await import("./metricsService.js");
    
    // Use the token-based analysis function
    return await analyzeRepositoryWithToken(url, githubToken);
  } catch (error) {
    console.error("analyzeRepositoryWithToken failed:", error.message);
    throw error; // Don't return mock data for user tokens - let the caller handle the error
  }
}

/**
 * Safe wrapper for runAIAnalysis
 */
export async function safeRunAIAnalysis(teamId) {
  if (MOCK_MODE) {
    console.log("MOCK: runAIAnalysis called for team", teamId);
    return {
      insights: [
        "Mock AI: Your repo is healthy.",
        "Mock AI: Consider improving commit messages.",
      ],
      metadata: { mocked: true },
    };
  }
  return runAIAnalysis(teamId);
}

/**
 * Safe wrapper for collectMemberActivity
 */
export async function safeCollectMemberActivity(owner, repo, username, userId = null) {
  if (MOCK_MODE) {
    console.log(`MOCK: collectMemberActivity(${owner}/${repo}, ${username})`);
    return {
      commits: 5,
      pullRequests: 2,
      issues: 1,
    };
  }
  return collectMemberActivity(owner, repo, username, userId);
}
