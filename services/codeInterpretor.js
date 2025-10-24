import OpenAI from "openai";
import 'dotenv/config';
import { getNextOctokit } from './tokenManager.js';
import { getOctokit } from './tokenManager.js';
import { concurrentMap } from '../api/utils/concurrentMap.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const DORA_ANALYSIS_PATTERNS = {
  deployment_frequency: {
    indicators: [
      '.github/workflows/',
      'docker',
      'jenkins',
      'pipeline',
      'deploy',
      'ci/',
      'cd/',
      'build.',
      'package.json',
      'requirements.txt'
    ],
    weight: 'high'
  },
  lead_time: {
    indicators: [
      'test/',
      'spec/',
      '.test.',
      '.spec.',
      'review',
      'approve',
      'merge',
      'branch'
    ],
    weight: 'medium'
  },
  mttr: {
    indicators: [
      'monitor',
      'log',
      'error',
      'exception',
      'alert',
      'health',
      'metric',
      'rollback',
      'revert'
    ],
    weight: 'high'
  },
  change_failure_rate: {
    indicators: [
    'auth',
    'secure', 
    'permission', 
    'access', 
    'sanitiz', 
    'validate', 
    'input', 
    'csrf', 
    'xss', 
    'error-handler'
    ],
    weight: 'high'
  }
};

// Repository structure analysis - much faster than file-by-file analysis
async function analyzeRepositoryStructure(owner, repo, userId = null) {
  // const octokit = getNextOctokit();
  const analysis = {
    structure: {},
    doraIndicators: {
      deployment_frequency: [],
      lead_time: [],
      mttr: [],
      change_failure_rate: []
    },
    fileStats: {},
    allFiles: [],
    repositoryHealth: {},
    criticalFiles: []
  };

  try {

    const { octokit, tokenType } = userId
        ? await getOctokit(userId)
        : { octokit: getNextOctokit() };

    // Get repository info and recent activity
    const [repoInfo, commits, pullRequests, releases] = await Promise.all([
      octokit.rest.repos.get({ owner, repo }),
      octokit.rest.repos.listCommits({ owner, repo, per_page: 100 }),
      octokit.rest.pulls.list({ owner, repo, state: 'all', per_page: 50 }),
      octokit.rest.repos.listReleases({ owner, repo, per_page: 20 })
    ]);

    // Analyze repository structure recursively
    await analyzeDirectory(octokit, owner, repo, '', analysis, 0, 3);

    if (analysis.criticalFiles.length > 0) {
      analysis.allFiles = await fetchCriticalFilesConcurrently(analysis.criticalFiles);
      console.log(`Fetched ${analysis.allFiles.length} critical files`);
    }

    // Analyze commit patterns for DORA insights
    const commitAnalysis = analyzeCommitPatterns(commits.data);
    const prAnalysis = analyzePullRequestPatterns(pullRequests.data);
    const releaseAnalysis = analyzeReleasePatterns(releases.data);
    console.log("Analyzed Repo Structure");
    return {
      repository: {
        name: repoInfo.data.full_name,
        language: repoInfo.data.language,
        size: repoInfo.data.size,
        stars: repoInfo.data.stargazers_count,
        forks: repoInfo.data.forks_count,
        lastUpdated: repoInfo.data.updated_at
      },
      structure: analysis.structure,
      doraIndicators: analysis.doraIndicators,
      fileStats: analysis.fileStats,
      patterns: {
        commits: commitAnalysis,
        pullRequests: prAnalysis,
        releases: releaseAnalysis
      },
      analyzedAt: new Date().toISOString(),
      allFiles: analysis.allFiles || []
    };

  } catch (error) {
    throw new Error(`Repository analysis failed: ${error.message}`);
  }
}

async function analyzeDirectory(octokit, owner, repo, path, analysis, depth, maxDepth) {
  if (depth >= maxDepth) return;

  try {
    const { data: contents } = await octokit.rest.repos.getContent({ owner, repo, path });
    
    // Process files and directories concurrently
    await concurrentMap(
      contents,
      6, // Concurrency level
      async (item) => {
        const itemPath = item.path.toLowerCase();
        
        // Update structure
        if (!analysis.structure[depth]) analysis.structure[depth] = [];
        analysis.structure[depth].push({
          name: item.name,
          type: item.type,
          path: item.path,
          size: item.size
        });

        // Check for DORA indicators
        checkDORAIndicators(item, analysis.doraIndicators);

        // Process files
        if (item.type === 'file') {
          const extension = item.name.split('.').pop();
          analysis.fileStats[extension] = (analysis.fileStats[extension] || 0) + 1;
          
          if (isCriticalDORAFile(item.path)) {
            console.log("Fetching file");
            analysis.criticalFiles.push({
              path: item.path,
              owner,
              repo,
              octokit
            });
            console.log("Fetched file");
          }
        }

        // Process directories recursively
        if (item.type === 'dir' && shouldAnalyzeDirectory(item.name)) {
          await analyzeDirectory(octokit, owner, repo, item.path, analysis, depth + 1, maxDepth);
        }
      }
    );
  } catch (error) {
    console.warn(`Could not analyze directory ${path}: ${error.message}`);
  }
}

async function fetchCriticalFilesConcurrently(criticalFiles) {
  const CONCURRENCY_LIMIT = 6;
  console.log(`Fetching ${criticalFiles.length} critical files concurrently...`);
  
  return concurrentMap(
    criticalFiles,
    CONCURRENCY_LIMIT,
    async ({ path, owner, repo, octokit }) => {
      try {
        const content = await getFileContent(octokit, owner, repo, path);
        return {
          path,
          snippet: content.substring(0, 500) + (content.length > 500 ? "..." : "")
        };
      } catch (error) {
        console.error(`Error fetching ${path}: ${error.message}`);
        return null;
      }
    }
  );
}

// NEW: Fetch file content helper
async function getFileContent(octokit, owner, repo, path) {
  try {
    const { data } = await octokit.rest.repos.getContent({ owner, repo, path });
    return Buffer.from(data.content, 'base64').toString();
  } catch (error) {
    console.error(`Error fetching ${path}: ${error.message}`);
    return "";
  }
}

// NEW: Strict critical file filter
function isCriticalDORAFile(path) {
  const pathLower = path.toLowerCase();
  return Object.values(DORA_ANALYSIS_PATTERNS).some(metric =>
    metric.indicators.some(pattern => pathLower.includes(pattern))
  );
}

function checkDORAIndicators(item, indicators) {
  const path = item.path.toLowerCase();
  const name = item.name.toLowerCase();

  Object.keys(DORA_ANALYSIS_PATTERNS).forEach(metric => {
    const patterns = DORA_ANALYSIS_PATTERNS[metric].indicators;
    
    patterns.forEach(pattern => {
      if (path.includes(pattern) || name.includes(pattern)) {
        indicators[metric].push({
          file: item.path,
          pattern: pattern,
          type: item.type,
          size: item.size,
          weight: DORA_ANALYSIS_PATTERNS[metric].weight
        });
      }
    });
  });
}

function shouldAnalyzeDirectory(dirName) {
  const skipDirs = ['node_modules', '.git', 'dist', 'build', 'coverage', 'vendor'];
  return !skipDirs.includes(dirName.toLowerCase());
}

function analyzeCommitPatterns(commits) {
  const patterns = {
    totalCommits: commits.length,
    averageCommitsPerDay: 0,
    commitTypes: {},
    authors: new Set(),
    recentActivity: []
  };

  commits.forEach(commit => {
    patterns.authors.add(commit.author?.login || 'unknown');
    
    const message = commit.commit.message.toLowerCase();
    
    // Categorize commit types
    if (message.includes('fix') || message.includes('bug')) {
      patterns.commitTypes.fixes = (patterns.commitTypes.fixes || 0) + 1;
    } else if (message.includes('feat') || message.includes('add')) {
      patterns.commitTypes.features = (patterns.commitTypes.features || 0) + 1;
    } else if (message.includes('deploy') || message.includes('release')) {
      patterns.commitTypes.deployments = (patterns.commitTypes.deployments || 0) + 1;
    } else if (message.includes('test')) {
      patterns.commitTypes.tests = (patterns.commitTypes.tests || 0) + 1;
    }

    patterns.recentActivity.push({
      date: commit.commit.author.date,
      message: commit.commit.message.substring(0, 100),
      author: commit.author?.login
    });
  });

  patterns.uniqueAuthors = patterns.authors.size;
  console.log("Analyzed commit patterns");
  return patterns;
}

function analyzePullRequestPatterns(pullRequests) {
  const patterns = {
    totalPRs: pullRequests.length,
    merged: pullRequests.filter(pr => pr.merged_at).length,
    open: pullRequests.filter(pr => pr.state === 'open').length,
    closed: pullRequests.filter(pr => pr.state === 'closed' && !pr.merged_at).length,
    averageTimeToMerge: 0,
    reviewPatterns: {}
  };

  const mergedPRs = pullRequests.filter(pr => pr.merged_at);
  if (mergedPRs.length > 0) {
    const totalTime = mergedPRs.reduce((sum, pr) => {
      const created = new Date(pr.created_at);
      const merged = new Date(pr.merged_at);
      return sum + (merged - created);
    }, 0);
    
    patterns.averageTimeToMerge = Math.round(totalTime / mergedPRs.length / (1000 * 60 * 60 * 24)); // days
  }

  console.log("Analyzed Pull Request patterns");

  return patterns;
}

function analyzeReleasePatterns(releases) {
  const patterns = {
    totalReleases: releases.length,
    recentReleases: releases.slice(0, 5),
    releaseFrequency: 'unknown',
    versioningPattern: 'unknown'
  };

  if (releases.length >= 2) {
    const latest = new Date(releases[0].created_at);
    const previous = new Date(releases[1].created_at);
    const daysBetween = (latest - previous) / (1000 * 60 * 60 * 24);
    
    if (daysBetween <= 7) patterns.releaseFrequency = 'weekly';
    else if (daysBetween <= 30) patterns.releaseFrequency = 'monthly';
    else if (daysBetween <= 90) patterns.releaseFrequency = 'quarterly';
    else patterns.releaseFrequency = 'infrequent';
  }

  console.log("Analyzed Release Patterns");

  return patterns;
}

// Generate DORA-focused insights using repository analysis
async function generateDORAInsights(repositoryAnalysis, metrics) {
const prompt = `
You are a senior DevOps engineer analyzing ${repositoryAnalysis.repository.name}. 
Provide SPECIFIC recommendations based on ACTUAL patterns found in the repository.
Focus on connecting process patterns to DORA metrics improvement opportunities.

REPOSITORY OVERVIEW:
- Primary language: ${repositoryAnalysis.repository.language}
- Last updated: ${new Date(repositoryAnalysis.repository.lastUpdated).toLocaleDateString()}
- Key indicators found: ${Object.keys(repositoryAnalysis.doraIndicators)
    .filter(k => repositoryAnalysis.doraIndicators[k].length > 0)
    .join(', ')}

CRITICAL FINDINGS:
${Object.entries(repositoryAnalysis.doraIndicators)
  .map(([metric, items]) => 
    items.length > 0 
      ? `• ${metric.replace('_', ' ').toUpperCase()}: ${items.slice(0,3).map(i => i.file).join(', ')}${items.length > 3 ? ` +${items.length-3} more` : ''}`
      : `• ${metric.replace('_', ' ').toUpperCase()}: NO SIGNIFICANT INDICATORS FOUND`
  ).join('\n')}

ANALYSIS CONTEXT:
${['deployment_frequency', 'lead_time', 'mttr', 'change_failure_rate']
  .map(metric => {
    const value = metrics[metric] 
      ? JSON.stringify(metrics[metric]) 
      : 'No data';
    return `- ${metric.replace('_', ' ').toUpperCase()}: ${value}`
  }).join('\n')}

PROCESS PATTERNS (DORA Relevance):
COMMIT PATTERNS:
- Total Commits: ${repositoryAnalysis.patterns.commits.totalCommits} 
  (Indicates activity level → Deployment Frequency)
- Fix vs Feature Ratio: ${repositoryAnalysis.patterns.commits.commitTypes.fixes || 0} fixes vs ${repositoryAnalysis.patterns.commits.commitTypes.features || 0} features 
  (High fix ratio → Change Failure Rate)
- Deployment Commits: ${repositoryAnalysis.patterns.commits.commitTypes.deployments || 0} 
  (Directly impacts Deployment Frequency)

PULL REQUEST PATTERNS:
- Avg Merge Time: ${repositoryAnalysis.patterns.pullRequests.averageTimeToMerge} days 
  (Major factor in Lead Time)
- Merge Rate: ${repositoryAnalysis.patterns.pullRequests.merged}/${repositoryAnalysis.patterns.pullRequests.totalPRs} (${Math.round((repositoryAnalysis.patterns.pullRequests.merged/repositoryAnalysis.patterns.pullRequests.totalPRs)*100)}%) 
  (Low rate → Change Failure Rate)

RELEASE PATTERNS:
- Release Frequency: ${repositoryAnalysis.patterns.releases.releaseFrequency} 
  (Directly measures Deployment Frequency)
- Total Releases: ${repositoryAnalysis.patterns.releases.totalReleases} 
  (Historical trend for Deployment Frequency)

METRIC INTERPRETATION GUIDANCE:

- **Deployment Frequency**: If workflow files or release indicators are limited, assess deployment frequency using release cadence and deployment-related commits (e.g., messages containing "deploy", "release", or CI/CD configs).

- **Lead Time for Changes**: Even if few test or review-related files are found, use pull request duration (created-to-merged) and merge rates to infer lead time challenges.

- **Mean Time to Recovery (MTTR)**: If monitoring/logging/error files are limited, check whether the repository has error handling commits or rollback/revert patterns. Even a lack of logs or health checks may suggest MTTR improvement opportunities.

- **Change Failure Rate (CFR)**: Even if security/auth/validation files are sparse, use the ratio of fix commits to feature commits and low PR merge rates as signals for possible quality or CFR issues.

ACTION REQUIRED:
For each DORA metric (Deployment Frequency, Lead Time for Changes, Mean Time to Recovery, and Change Failure Rate):

1. Identify the MOST SIGNIFICANT opportunity based on:
   - Specific files or structural indicators found
   - Commit and pull request patterns
   - Numerical values (e.g. number of deployments, frequency per day, average lead time in days, merge percentage, fix-to-feature ratio)

2. Provide a CONCRETE and ACTIONABLE recommendation (technical and/or process-based).

3. ALWAYS include the actual values found from the analysis (e.g., "average lead time was **11.22 days**", "only **6%** of PRs were merged", "**7 of 100** commits were deployment-related", etc.).

4. Reference SPECIFIC files that contributed to the metric score.

5. Suggest ADDITIONAL changes (e.g., tests, monitoring, CI/CD steps).

6. Explain the EXPECTED IMPACT on the respective DORA metric.

Structure your response like this:

## [METRIC NAME]
**Opportunity:** [Brief description with REAL values: e.g., "The average lead time of **11.22 days** and merge rate of **6%**..."]
**Action:** [Clear step the team can take]
**Relevant Files:** [file1, file2]
**Additional Needs:** [Missing processes/files]
**Impact:** [Expected metric improvement from this action]
`;

  try {
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: prompt,
      temperature: 0.3,
      max_output_tokens: 1500
    });

    console.log("Generated Dora Insights");
    console.log("Insight: ", response.output_text);
    return response.output_text;
  } catch (error) {
    throw new Error(`DORA analysis failed: ${error.message}`);
  }
}

// Updated main analysis function
export async function performDORAAnalysis(owner, repo, metrics, userId = null) {
  console.log(`Starting DORA analysis for ${owner}/${repo}...`);
  const startTime = Date.now();

  try {
    // Analyze repository structure (much faster than file content analysis)
    console.log('Step 1: Analyzing repository structure');
    console.log('Analyzing repo with:', { owner, repo });
    const repositoryAnalysis = await analyzeRepositoryStructure(owner, repo, userId);
    console.log(`Repository structure analyzed in ${Date.now() - startTime}ms`);

    // Generate DORA insights
    console.log('Step 2: Generating DORA insights');
    console.log('Metrics provided:', metrics);
    const selectedMetrics =
      metrics?.["30d"] ||
      metrics?.["7d"] ||
      metrics?.["90d"] ||
      metrics;

    console.log(
      "Selected DORA metrics time window:",
      metrics?.["30d"]
        ? "30d"
        : metrics?.["7d"]
        ? "7d"
        : metrics?.["90d"]
        ? "90d"
        : "none"
    );

    const insights = await generateDORAInsights(repositoryAnalysis, selectedMetrics);
    console.log(`DORA insights generated in ${Date.now() - startTime}ms`);

    return {
      insights,
      repositoryAnalysis,
      performance: {
        totalTimeMs: Date.now() - startTime,
        filesAnalyzed: Object.values(repositoryAnalysis.fileStats).reduce((a, b) => a + b, 0),
        doraIndicatorsFound: Object.values(repositoryAnalysis.doraIndicators).flat().length
      },
      analyzedFiles: repositoryAnalysis.allFiles || []
    };

  } catch (error) {
    console.error(`DORA analysis failed: ${error.message}`);
    throw error;
  }
}

export {
  analyzeRepositoryStructure,
  generateDORAInsights,
  DORA_ANALYSIS_PATTERNS
};