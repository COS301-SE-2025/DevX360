import Team from "../api/models/Team.js";
import RepoMetrics from "../api/models/RepoMetrics.js";
import { analyzeRepository } from "./metricsService.js";
import { runAIAnalysis } from "./analysisService.js";
import User from "../api/models/User.js";
import {extractOwnerAndRepo} from "../Data-Collection/github-utils.js";
import {safeCollectMemberActivity} from "./mockWrappers.js";

export async function updateAllTeams() {
  console.log("Running daily team metrics and AI analysis update...");
  try {
    const teams = await Team.find({});
    for (const team of teams) {
      const repoData = await RepoMetrics.findOne({ teamId: team._id });
      if (!repoData || !repoData.repositoryInfo?.url) continue;

      try {
        // Update repository metrics
        const analysis = await analyzeRepository(repoData.repositoryInfo.url);
        repoData.metrics = analysis.metrics;
        repoData.repositoryInfo = analysis.metadata;
        repoData.lastUpdated = new Date();
        await repoData.save();

        // Run AI analysis (async, non-blocking)
        setTimeout(() => runAIAnalysis(team._id), 0);

        console.log(`Updated metrics for team: ${team.name}`);
      } catch (err) {
        console.error(`Failed to update metrics for team ${team.name}:`, err.message);
      }
    }
  } catch (err) {
    console.error("Daily team update job failed:", err.message);
  }
}

export async function collectAndSaveMemberStats(teamId, userId, repoUrl) {
  const user = await User.findById(userId);
  if (!user.githubUsername) {
    console.log("User has no GitHub username, skipping stats collection");
    return;
  }

  const [owner, repo] = extractOwnerAndRepo(repoUrl);
  if (!owner || !repo) {
    console.warn("Could not extract owner/repo from URL:", repoUrl);
    return;
  }

  try {
    const repoData = await RepoMetrics.findOne({ teamId });
    if (!repoData) {
      console.warn("No repoData found for team", teamId);
      return;
    }

    const stats = await safeCollectMemberActivity(owner, repo, user.githubUsername, userId);
    repoData.memberStats.set(userId.toString(), {
      githubUsername: user.githubUsername,
      ...stats,
    });

    repoData.memberStatsLastUpdated = new Date();
    await repoData.save();
    console.log("Saved memberStats for user:", userId);
  } catch (err) {
    console.error("Error collecting member stats:", err);
  }
}

export async function refreshAllMemberStats(teamId, memberIds, repoUrl) {
  const [owner, repo] = extractOwnerAndRepo(repoUrl);
  if (!owner || !repo) return;

  const repoData = await RepoMetrics.findOne({ teamId });
  if (!repoData) return;

  for (const memberId of memberIds) {
    try {
      await collectAndSaveMemberStats(teamId, memberId, repoUrl);
    } catch (err) {
      console.error(`Failed to refresh stats for member ${memberId}:`, err);
    }
  }
}