// services/mockWrappers.js
import { analyzeRepository } from "./metricsService.js";
import { runAIAnalysis } from "./analysisService.js";
import { collectMemberActivity } from "../Data-Collection/repository-info-service.js";

const MOCK_MODE = process.env.MOCK_MODE === "true";

/**
 * Safe wrapper for analyzeRepository
 */
export async function safeAnalyzeRepository(url) {
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
  return analyzeRepository(url);
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
export async function safeCollectMemberActivity(owner, repo, username) {
  if (MOCK_MODE) {
    console.log(`MOCK: collectMemberActivity(${owner}/${repo}, ${username})`);
    return {
      commits: 5,
      pullRequests: 2,
      issues: 1,
    };
  }
  return collectMemberActivity(owner, repo, username);
}
