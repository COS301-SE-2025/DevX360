import Team from "../api/models/Team.js";
import RepoMetrics from "../api/models/RepoMetrics.js";
import { analyzeRepository } from "./metricsService.js";
import { runAIAnalysis } from "./analysisService.js";

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