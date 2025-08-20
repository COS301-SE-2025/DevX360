import { performDORAAnalysis } from "./codeInterpretor.js";
import RepoMetrics from "../api/models/RepoMetrics.js";
import { parseGitHubUrl } from "../Data Collection/repository-info-service.js";

export async function runAIAnalysis(teamId) {
    let metricsEntry;
  try {
    metricsEntry = await RepoMetrics.findOne({ teamId });
    if (!metricsEntry) {
      console.error(`Metrics not found for team: ${teamId}`);
      return;
    }
    
    metricsEntry.analysisStatus = 'pending';
    await metricsEntry.save();

    const { metrics } = metricsEntry;
    const repoUrl = metricsEntry.repositoryInfo.url;
    const { owner, repo } = parseGitHubUrl(repoUrl);
    
    console.log(`Starting AI analysis for ${owner}/${repo}...`);
    const { insights, repositoryAnalysis, performance } = 
      await performDORAAnalysis(owner, repo, metrics);

    metricsEntry.aiAnalysis = {
      insights,
      lastAnalyzed: new Date(),
      metadata: {
        repo: repositoryAnalysis.repository.name,
        primaryLanguage: repositoryAnalysis.repository.language,
        doraIndicatorsFound: performance.doraIndicatorsFound,
        filesAnalyzed: performance.filesAnalyzed,
        doraMetricsCovered: Object.keys(
          repositoryAnalysis.doraIndicators
        ).filter(k => repositoryAnalysis.doraIndicators[k].length > 0),
        processingTimeMs: performance.totalTimeMs
      }
    };
    
    metricsEntry.analysisStatus = 'completed';
    await metricsEntry.save();
    
    console.log(`AI analysis completed for ${owner}/${repo}`);
  } catch (error) {
    console.error(`Analysis failed for team ${teamId}:`, error);
    metricsEntry.analysisStatus = 'failed';
    await metricsEntry.save();
  }
}