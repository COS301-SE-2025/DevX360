import { getNextOctokit, getOctokit } from '../services/tokenManager.js';
import { parseGitHubUrl } from './github-utils.js';

/**
 * Universal DORA Metrics Service
 * 
 * This service calculates DORA metrics (Deployment Frequency, Lead Time for Changes,
 * Mean Time to Recovery, and Change Failure Rate) for any GitHub repository.
 * 
 * @author DevX360 Team
 * @version 2.0.0
 */

// Enhanced DORA Patterns for Universal Accuracy
const UNIVERSAL_DORA_PATTERNS = {
  change_failure_rate: {
    primary_indicators: [
      'bug', 'incident', 'error', 'exception', 'crash', 'failure', 'outage',
      'downtime', 'broken', 'fix', 'hotfix', 'patch', 'rollback', 'revert'
    ],
    secondary_indicators: [
      'auth', 'secure', 'permission', 'access', 'sanitiz', 'validate', 'input',
      'csrf', 'xss', 'injection', 'overflow', 'race', 'deadlock', 'memory leak'
    ],
    deployment_context: [
      'deploy', 'release', 'production', 'rollback', 'hotfix', 'emergency deploy',
      'after deploy', 'in production', 'caused by deploy', 'deployment issue'
    ]
  }
};

// Helper function to add delay between requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extracts owner and repository name from a GitHub URL
 * 
 * @param {string} repositoryUrl - The GitHub repository URL (e.g., 'https://github.com/owner/repo')
 * @returns {Object} Object containing owner and repo name
 * @throws {Error} If the URL is invalid or malformed
 */
// parseGitHubUrl imported from './github-utils.js'

/**
 * Enhanced Issue Content Analysis for Universal Accuracy
 */
function analyzeIssueContent(issue, patterns) {
  const content = `${issue.title} ${issue.body || ''}`.toLowerCase();
  const labels = issue.labels?.map(label => label.name.toLowerCase()) || [];
  
  let score = 0;
  let matchedPatterns = [];
  let confidence = 'low';
  let hasDeploymentContext = false;
  let isExcluded = false;
  
  // Check for exclusion patterns
  const excludePatterns = [
    'documentation', 'docs', 'enhancement', 'feature', 'request', 'question',
    'discussion', 'proposal', 'idea', 'suggestion', 'help wanted', 'good first issue'
  ];
  
  isExcluded = excludePatterns.some(pattern => 
    content.includes(pattern) || labels.some(label => label.includes(pattern))
  );
  
  if (isExcluded) {
    return {
      score: 0,
      confidence: 'excluded',
      matchedPatterns: ['excluded'],
      hasExplicitLabel: false,
      hasDeploymentContext: false,
      isExcluded: true
    };
  }
  
  // Check for deployment context
  hasDeploymentContext = patterns.deployment_context.some(context => 
    content.includes(context)
  );
  
  // Check explicit labels first (highest confidence)
  const hasExplicitLabel = labels.some(label => 
    patterns.primary_indicators.includes(label) || 
    patterns.secondary_indicators.includes(label)
  );
  
  if (hasExplicitLabel) {
    score += 15;
    confidence = 'high';
    matchedPatterns.push('explicit_label');
  }
  
  // Check content for primary indicators
  patterns.primary_indicators.forEach(indicator => {
    if (content.includes(indicator)) {
      score += 8;
      matchedPatterns.push(`primary_${indicator}`);
    }
  });
  
  // Check content for secondary indicators
  patterns.secondary_indicators.forEach(indicator => {
    if (content.includes(indicator)) {
      score += 3;
      matchedPatterns.push(`secondary_${indicator}`);
    }
  });
  
  // Check labels for partial matches
  labels.forEach(label => {
    patterns.primary_indicators.forEach(indicator => {
      if (label.includes(indicator) || indicator.includes(label)) {
        score += 5;
        matchedPatterns.push(`label_match_${label}`);
      }
    });
  });
  
  // Bonus for deployment context
  if (hasDeploymentContext) {
    score += 5;
    matchedPatterns.push('deployment_context');
  }
  
  // Determine confidence level
  if (score >= 15) confidence = 'high';
  else if (score >= 8) confidence = 'medium';
  else if (score >= 3) confidence = 'low';
  else confidence = 'very_low';
  
  return {
    score,
    confidence,
    matchedPatterns,
    hasExplicitLabel,
    hasDeploymentContext,
    isExcluded: false
  };
}

/**
 * Enhanced Deployment Detection for Universal Accuracy
 */
function detectDeployments(releases, commits) {
  const deployments = [];
  
  // Add releases as deployments
  releases.forEach(release => {
    if (!release.draft && !release.prerelease) {
      deployments.push({
        type: 'release',
        date: new Date(release.created_at),
        version: release.tag_name,
        name: release.name
      });
    }
  });
  
  // Detect deployment commits
  const deploymentCommits = commits.filter(commit => {
    const message = commit.commit.message.toLowerCase();
    return message.includes('deploy') || 
           message.includes('release') || 
           message.includes('production') ||
           message.includes('hotfix') ||
           message.includes('emergency');
  });
  
  deploymentCommits.forEach(commit => {
    deployments.push({
      type: 'commit',
      date: new Date(commit.commit.author.date),
      version: commit.sha.substring(0, 7),
      name: commit.commit.message.split('\n')[0]
    });
  });
  
  return deployments.sort((a, b) => a.date - b.date);
}

/**
 * Universal CFR Calculation with Maximum Accuracy
 */
function calculateUniversalChangeFailureRate(releases, issues, commits) {
  const cfrPatterns = UNIVERSAL_DORA_PATTERNS.change_failure_rate;
  
  // Enhanced Issue Analysis with Temporal Correlation
  const failureIssues = issues.map(issue => {
    const analysis = analyzeIssueContent(issue, cfrPatterns);
    
    // Enhanced failure detection with severity weighting
    const severityScore = calculateIssueSeverity(issue, analysis);
    const temporalScore = calculateTemporalCorrelation(issue, releases, commits);
    const contextScore = calculateDeploymentContext(issue, releases);
    
    const totalScore = analysis.score + severityScore + temporalScore + contextScore;
    
    return {
      ...issue,
      failureAnalysis: analysis,
      severityScore,
      temporalScore,
      contextScore,
      totalScore,
      isFailure: totalScore >= 12 && !analysis.isExcluded,
      hasDeploymentContext: contextScore > 0,
      failureType: classifyFailureType(issue, analysis, totalScore),
      confidence: calculateFailureConfidence(totalScore, analysis)
    };
  }).filter(issue => issue.isFailure);
  
  // Advanced Deployment Detection
  const deployments = detectDeployments(releases, commits);
  const totalDeployments = deployments.length;
  
  // Intelligent Failure Classification
  const classifiedFailures = classifyFailures(failureIssues, deployments);
  const deploymentFailures = classifiedFailures.deployment;
  const generalFailures = classifiedFailures.general;
  const criticalFailures = classifiedFailures.critical;
  
  // Multi-Source Validation
  const validationResults = validateFailures(failureIssues, commits, deployments);
  
  // Calculate Universal CFR with Confidence
  const cfrResults = calculateUniversalCFR(
    totalDeployments,
    deploymentFailures,
    generalFailures,
    criticalFailures,
    validationResults
  );
  
  return {
    total_deployments: totalDeployments,
    deployment_failures: deploymentFailures.length,
    general_issues: generalFailures.length,
    critical_failures: criticalFailures.length,
    failure_rate: cfrResults.generalFailureRate,
    deployment_failure_rate: cfrResults.deploymentFailureRate,
    critical_failure_rate: cfrResults.criticalFailureRate,
    confidence_score: cfrResults.confidenceScore,
    accuracy_indicators: cfrResults.accuracyIndicators,
    data_sources: {
      explicit_labels: validationResults.explicitLabels,
      content_analysis: validationResults.contentAnalysis,
      commit_patterns: validationResults.commitPatterns,
      deployment_failures: deploymentFailures.length,
      temporal_correlation: validationResults.temporalCorrelation,
      severity_analysis: validationResults.severityAnalysis,
      total_issues: issues.length
    },
    status: cfrResults.status
  };
}

// Helper functions for universal CFR accuracy
function calculateIssueSeverity(issue, analysis) {
  let severityScore = 0;
  
  // Label-based severity
  const severityLabels = ['critical', 'high', 'urgent', 'blocker', 'p0', 'p1'];
  const hasSeverityLabel = issue.labels?.some(label => 
    severityLabels.includes(label.name.toLowerCase())
  );
  if (hasSeverityLabel) severityScore += 8;
  
  // Content-based severity indicators
  const severityKeywords = ['crash', 'outage', 'downtime', 'broken', 'fatal', 'emergency'];
  const content = `${issue.title} ${issue.body || ''}`.toLowerCase();
  severityKeywords.forEach(keyword => {
    if (content.includes(keyword)) severityScore += 3;
  });
  
  // Comment volume (more comments = more severe)
  if (issue.comments > 5) severityScore += 2;
  if (issue.comments > 10) severityScore += 3;
  
  return Math.min(severityScore, 15);
}

function calculateTemporalCorrelation(issue, releases, commits) {
  let temporalScore = 0;
  const issueDate = new Date(issue.created_at);
  
  // Check if issue was created near a deployment
  releases.forEach(release => {
    const releaseDate = new Date(release.created_at);
    const daysDiff = Math.abs((issueDate - releaseDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff <= 1) temporalScore += 10;
    else if (daysDiff <= 3) temporalScore += 6;
    else if (daysDiff <= 7) temporalScore += 3;
  });
  
  // Check commit patterns around issue creation
  const relevantCommits = commits.filter(commit => {
    const commitDate = new Date(commit.commit.author.date);
    const daysDiff = Math.abs((issueDate - commitDate) / (1000 * 60 * 60 * 24));
    return daysDiff <= 7;
  });
  
  if (relevantCommits.length > 0) {
    const fixCommits = relevantCommits.filter(commit => 
      commit.commit.message.toLowerCase().includes('fix') ||
      commit.commit.message.toLowerCase().includes('revert')
    );
    temporalScore += fixCommits.length * 2;
  }
  
  return Math.min(temporalScore, 20);
}

function calculateDeploymentContext(issue, releases) {
  let contextScore = 0;
  const content = `${issue.title} ${issue.body || ''}`.toLowerCase();
  
  // Direct deployment references
  const deploymentKeywords = [
    'deploy', 'release', 'production', 'rollback', 'hotfix', 'emergency deploy',
    'after deploy', 'in production', 'caused by deploy', 'deployment issue',
    'release issue', 'version', 'v', 'tag'
  ];
  
  deploymentKeywords.forEach(keyword => {
    if (content.includes(keyword)) contextScore += 5;
  });
  
  // Version number references
  const versionPattern = /v?\d+\.\d+\.\d+/g;
  const versions = content.match(versionPattern);
  if (versions) contextScore += versions.length * 3;
  
  return Math.min(contextScore, 15);
}

function classifyFailureType(issue, analysis, totalScore) {
  if (analysis.hasDeploymentContext) return 'deployment';
  if (totalScore >= 20) return 'critical';
  if (totalScore >= 15) return 'high';
  if (totalScore >= 12) return 'medium';
  return 'low';
}

function calculateFailureConfidence(totalScore, analysis) {
  let confidence = 'low';
  if (totalScore >= 25) confidence = 'very_high';
  else if (totalScore >= 20) confidence = 'high';
  else if (totalScore >= 15) confidence = 'medium';
  else if (totalScore >= 12) confidence = 'low';
  return confidence;
}

function classifyFailures(failureIssues, deployments) {
  const deploymentFailures = [];
  const generalFailures = [];
  const criticalFailures = [];
  
  failureIssues.forEach(issue => {
    if (issue.failureType === 'deployment') {
      deploymentFailures.push(issue);
    } else if (issue.failureType === 'critical') {
      criticalFailures.push(issue);
    } else {
      generalFailures.push(issue);
    }
  });
  
  return { deployment: deploymentFailures, general: generalFailures, critical: criticalFailures };
}

function validateFailures(failureIssues, commits, deployments) {
  const explicitLabels = failureIssues.filter(i => i.failureAnalysis.hasExplicitLabel).length;
  const contentAnalysis = failureIssues.filter(i => i.failureAnalysis.score >= 8).length;
  const commitPatterns = commits.filter(commit => 
    commit.commit.message.toLowerCase().includes('fix') ||
    commit.commit.message.toLowerCase().includes('bug') ||
    commit.commit.message.toLowerCase().includes('revert')
  ).length;
  
  // Temporal validation
  const temporalCorrelation = failureIssues.filter(i => i.temporalScore > 0).length;
  
  // Severity validation
  const severityAnalysis = failureIssues.filter(i => i.severityScore > 5).length;
  
  return {
    explicitLabels,
    contentAnalysis,
    commitPatterns,
    temporalCorrelation,
    severityAnalysis
  };
}

function calculateUniversalCFR(totalDeployments, deploymentFailures, generalFailures, criticalFailures, validationResults) {
  // Handle edge cases
  if (totalDeployments === 0) {
    const totalIssues = deploymentFailures.length + generalFailures.length + criticalFailures.length;
    const issueFailureRate = totalIssues > 0 ? ((totalIssues / 100) * 100).toFixed(2) + '%' : '0%';
    
    return {
      generalFailureRate: issueFailureRate,
      deploymentFailureRate: 'N/A (no deployments)',
      criticalFailureRate: '0%',
      confidenceScore: Math.min(calculateConfidenceScore(validationResults), 60),
      accuracyIndicators: {
        dataQuality: 'medium',
        sampleSize: 'small',
        temporalCoverage: 'limited',
        patternRecognition: 'good'
      },
      status: 'No deployments found - showing issue failure rate instead'
    };
  }
  
  // Calculate failure rates with confidence weighting
  const deploymentFailureRate = ((deploymentFailures.length / totalDeployments) * 100).toFixed(2) + '%';
  const generalFailureRate = ((generalFailures.length / totalDeployments) * 100).toFixed(2) + '%';
  const criticalFailureRate = ((criticalFailures.length / totalDeployments) * 100).toFixed(2) + '%';
  
  // Enhanced confidence calculation
  const confidenceScore = calculateConfidenceScore(validationResults);
  
  // Accuracy indicators
  const accuracyIndicators = {
    dataQuality: totalDeployments >= 5 ? 'high' : totalDeployments >= 2 ? 'medium' : 'low',
    sampleSize: totalDeployments >= 10 ? 'large' : totalDeployments >= 5 ? 'medium' : 'small',
    temporalCoverage: 'good',
    patternRecognition: validationResults.contentAnalysis > 0 ? 'excellent' : 'good'
  };
  
  return {
    generalFailureRate,
    deploymentFailureRate,
    criticalFailureRate,
    confidenceScore,
    accuracyIndicators,
    status: 'Universal CFR calculated successfully'
  };
}

function calculateConfidenceScore(validationResults) {
  const baseScore = (
    validationResults.explicitLabels * 25 +
    validationResults.contentAnalysis * 20 +
    validationResults.commitPatterns * 15 +
    validationResults.temporalCorrelation * 10 +
    validationResults.severityAnalysis * 10
  );
  
  return Math.min(100, baseScore);
}

/**
 * Fetches DORA metrics for a single repository within a given time window.
 *
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} daysBack - Number of days to look back (e.g. 7, 30, 90)
 * @returns {Promise<Object>} DORA metrics object for the selected period
 */
async function fetchRepositoryMetrics(owner, repo, daysBack = 30, userId = null) {
  const { octokit } = userId
      ? await getOctokit(userId)
      : { octokit: getNextOctokit() };

  try {
    console.error(`Fetching DORA metrics for ${owner}/${repo} (${daysBack}-day analysis)...`);

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    // Fetch repo data in parallel with detailed logging
    console.error(`[${owner}/${repo}] Starting parallel API calls...`);
    const [releasesRes, tagsRes, commitsRes, pullsRes, issuesRes] = await Promise.all([
      octokit.rest.repos.listReleases({ owner, repo, per_page: 100 }).catch(err => {
        console.error(`[${owner}/${repo}] RELEASES API FAILED:`, err.message, err.status);
        throw err;
      }),
      octokit.rest.repos.listTags({ owner, repo, per_page: 100 }).catch(err => {
        console.error(`[${owner}/${repo}] TAGS API FAILED:`, err.message, err.status);
        throw err;
      }),
      octokit.rest.repos.listCommits({ owner, repo, per_page: 100 }).catch(err => {
        console.error(`[${owner}/${repo}] COMMITS API FAILED:`, err.message, err.status);
        throw err;
      }),
      octokit.rest.pulls.list({ owner, repo, state: "closed", per_page: 100 }).catch(err => {
        console.error(`[${owner}/${repo}] PULLS API FAILED:`, err.message, err.status);
        throw err;
      }),
      octokit.rest.issues.listForRepo({ owner, repo, state: "closed", per_page: 100 }).catch(err => {
        console.error(`[${owner}/${repo}] ISSUES API FAILED:`, err.message, err.status);
        throw err;
      })
    ]);

    // Filter by date threshold
    const releases = releasesRes.data.filter(release =>
      release.created_at && new Date(release.created_at) >= dateThreshold
    );

    const tags = tagsRes.data.filter(tag => {
      try {
        return tag.commit?.commit?.author?.date &&
               new Date(tag.commit.commit.author.date) >= dateThreshold;
      } catch (error) {
        console.warn(`Skipping tag with invalid date structure: ${tag.name}`);
        return false;
      }
    });

    const commits = commitsRes.data.filter(commit => {
      try {
        return commit.commit?.author?.date &&
               new Date(commit.commit.author.date) >= dateThreshold;
      } catch (error) {
        console.warn(`Skipping commit with invalid date structure: ${commit.sha?.substring(0, 7) || "unknown"}`);
        return false;
      }
    });

    const pullRequests = pullsRes.data.filter(pr =>
      pr.created_at && new Date(pr.created_at) >= dateThreshold
    );

    const issues = issuesRes.data.filter(issue =>
      issue.created_at && new Date(issue.created_at) >= dateThreshold
    );

    // Return structured metrics
    return {
      repository: {
        name: repo,
        owner: owner,
        full_name: `${owner}/${repo}`,
        url: `https://github.com/${owner}/${repo}`
      },
      analysis_period: {
        days_back: daysBack,
        start_date: dateThreshold.toISOString(),
        end_date: new Date().toISOString()
      },
      deployment_frequency: calculateDeploymentFrequency(releases, tags, daysBack, commits),
      lead_time: calculateLeadTime(pullRequests, commits),
      mttr: calculateMTTR(issues),
      change_failure_rate: calculateUniversalChangeFailureRate(releases, issues, commits),
      data_summary: {
        releases_count: releases.length,
        tags_count: tags.length,
        commits_count: commits.length,
        pull_requests_count: pullRequests.length,
        issues_count: issues.length,
        analysis_period_days: daysBack,
        fetched_at: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error(`Error fetching metrics for ${owner}/${repo}: ${error.message}`);
    return null;
  }
}

/**
 * Fetches DORA metrics for a repository across multiple periods.
 *
 * Currently supports:
 *  - 7 days
 *  - 30 days
 *  - 90 days
 *
 * @param {string} repositoryUrl - The GitHub repository URL
 * @returns {Promise<Object>} Object containing metrics for all periods
 * {
 *   "7d": {...},
 *   "30d": {...},
 *   "90d": {...}
 * }
 */
async function getDORAMetrics(repositoryUrl, userId = null) {
  try {
    const { owner, repo } = parseGitHubUrl(repositoryUrl);
    return {
      "7d": await fetchRepositoryMetrics(owner, repo, 7, userId),
      "30d": await fetchRepositoryMetrics(owner, repo, 30, userId),
      "90d": await fetchRepositoryMetrics(owner, repo, 90, userId)
    };
  } catch (error) {
    throw new Error(`Failed to fetch DORA metrics: ${error.message}`);
  }
}

/**
 * Fetches DORA metrics for multiple repositories
 * 
 * @param {Array<string>} repositoryUrls - Array of GitHub repository URLs
 * @returns {Promise<Object>} Object containing results and summary
 */
async function getDORAMetricsBatch(repositoryUrls) {
  const results = [];
  const errors = [];
  
  console.error(`Processing ${repositoryUrls.length} repositories...`);
  
  for (let i = 0; i < repositoryUrls.length; i++) {
    const url = repositoryUrls[i];
    try {
      console.error(`Processing ${i + 1}/${repositoryUrls.length}: ${url}`);
      const metrics = await getDORAMetrics(url);
      
      if (metrics) {
        results.push({
          url,
          success: true,
          data: metrics
        });
      } else {
        errors.push({
          url,
          success: false,
          error: 'Failed to fetch metrics'
        });
      }
    } catch (error) {
      errors.push({
        url,
        success: false,
        error: error.message
      });
    }
    
    // Add delay between repositories to respect rate limits
    if (i < repositoryUrls.length - 1) {
      await delay(2000);
    }
  }
  
  return {
    summary: {
      total: repositoryUrls.length,
      successful: results.length,
      failed: errors.length,
      success_rate: ((results.length / repositoryUrls.length) * 100).toFixed(2) + '%'
    },
    results,
    errors,
    generated_at: new Date().toISOString()
  };
}

/**
 * Fetches DORA metrics for all repositories in an organization
 * 
 * @param {string} organization - GitHub organization name
 * @param {number} maxRepos - Maximum number of repositories to process (default: 50)
 * @returns {Promise<Object>} Object containing results and summary
 */
async function getOrganizationDORAMetrics(organization, maxRepos = 50) {
  try {
    console.error(`Fetching repositories for organization: ${organization}`);
    
    const octokit = getNextOctokit();
    const { data: repos } = await octokit.rest.repos.listForOrg({
      org: organization,
      per_page: Math.min(maxRepos, 100),
      sort: 'updated',
      direction: 'desc'
    });
    
    console.error(`Found ${repos.length} repositories. Processing DORA metrics...`);
    
    const repositoryUrls = repos.slice(0, maxRepos).map(repo => 
      `https://github.com/${organization}/${repo.name}`
    );
    
    return await getDORAMetricsBatch(repositoryUrls);
    
  } catch (error) {
    throw new Error(`Failed to fetch organization repositories: ${error.message}`);
  }
}

/**
 * Calculates deployment frequency with enhanced accuracy
 */
function calculateDeploymentFrequency(releases, tags, daysBack = 30, commits = []) {
  // Filter out draft and pre-release releases to count only actual deployments
  const deployments = detectDeployments(releases, commits)
    .map(d => new Date(d.date))
    .sort((a, b) => a - b);

  // Helper: get start date
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - daysBack + 1);

  // Per-day time series
  const perDay = Array(daysBack).fill(0);
  deployments.forEach(date => {
    const dayIndex = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
    if (dayIndex >= 0 && dayIndex < daysBack) {
      perDay[dayIndex]++;
    }
  });

  // Per-week time series
  const numWeeks = Math.ceil(daysBack / 7);
  const perWeek = Array(numWeeks).fill(0);
  deployments.forEach(date => {
    const dayIndex = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
    if (dayIndex >= 0 && dayIndex < daysBack) {
      const weekIndex = Math.floor(dayIndex / 7);
      perWeek[weekIndex]++;
    }
  });

  // Per-month time series (by calendar month)
  // Find all months in the period
  const months = [];
  let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const lastMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  while (cursor <= lastMonth) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() });
    cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
  }
  const perMonth = Array(months.length).fill(0);
  deployments.forEach(date => {
    for (let i = 0; i < months.length; i++) {
      if (
        date.getFullYear() === months[i].year &&
        date.getMonth() === months[i].month
      ) {
        perMonth[i]++;
        break;
      }
    }
  });

  const totalDeployments = deployments.length;

  // Scalar frequencies for API consumers
  const frequency_per_day = (totalDeployments / daysBack).toFixed(3);
  const frequency_per_week = perWeek.length ? (totalDeployments / perWeek.length).toFixed(3) : '0.000';
  const frequency_per_month = perMonth.length ? (totalDeployments / perMonth.length).toFixed(3) : '0.000';

  return {
    total_deployments: totalDeployments,
    analysis_period_days: daysBack,
    perDay,
    perWeek,
    perMonth,
    months: months.map(m => `${m.year}-${String(m.month + 1).padStart(2, '0')}`),
    status:
      totalDeployments === 0
        ? 'No deployments found in analysis period'
        : totalDeployments === 1
        ? 'Single deployment in analysis period'
        : 'Multiple deployments in analysis period',
    // New scalar frequency fields (restore/extend old behavior)
    frequency_per_day,
    frequency_per_week,
    frequency_per_month,
  };
}

function calculateLeadTime(pullRequests, commits) {
  // Only calculate lead time for merged PRs
  const mergedPRs = pullRequests.filter(pr => pr.merged_at);

  if (mergedPRs.length === 0) {
    return {
      average_days: 0,
      min_days: 0,
      max_days: 0,
      total_prs_analyzed: 0,
      status: 'No merged pull requests found'
    };
  }

  const leadTimes = mergedPRs.map(pr => {
    const created = new Date(pr.created_at);
    const merged = new Date(pr.merged_at);
    return (merged - created) / (1000 * 60 * 60 * 24); // Convert to days
  });

  if (leadTimes.length === 0) {
    return {
      average_days: 0,
      min_days: 0,
      max_days: 0,
      total_prs_analyzed: 0,
      status: 'No valid lead times found'
    };
  }

  return {
    average_days: (leadTimes.reduce((a, b) => a + b, 0) / leadTimes.length).toFixed(2),
    min_days: Math.min(...leadTimes).toFixed(2),
    max_days: Math.max(...leadTimes).toFixed(2),
    total_prs_analyzed: leadTimes.length,
    status: 'Valid lead times calculated'
  };
}

function calculateMTTR(issues) {
  if (!issues || issues.length === 0) {
    return {
      average_days: 0,
      min_days: 0,
      max_days: 0,
      total_incidents_analyzed: 0,
      status: 'No issues found'
    };
  }

  const resolutionTimes = issues
    .filter(issue => issue.closed_at && issue.created_at)
    .map(issue => {
      const created = new Date(issue.created_at);
      const closed = new Date(issue.closed_at);
      return (closed - created) / (1000 * 60 * 60 * 24); // Convert to days
    });

  if (resolutionTimes.length === 0) {
    return {
      average_days: 0,
      min_days: 0,
      max_days: 0,
      total_incidents_analyzed: 0,
      status: 'No valid resolution times found'
    };
  }

  return {
    average_days: (resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length).toFixed(2),
    min_days: Math.min(...resolutionTimes).toFixed(2),
    max_days: Math.max(...resolutionTimes).toFixed(2),
    total_incidents_analyzed: resolutionTimes.length,
    status: 'Valid MTTR calculated'
  };
}

export {
  getDORAMetrics,
  getDORAMetricsBatch,
  getOrganizationDORAMetrics,
  parseGitHubUrl
}; 