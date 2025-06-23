import { getNextOctokit } from '../services/tokenManager.js';

/**
 * Universal DORA Metrics Service
 * 
 * This service calculates DORA metrics (Deployment Frequency, Lead Time for Changes,
 * Mean Time to Recovery, and Change Failure Rate) for any GitHub repository.
 * 
 * @author DevX360 Team
 * @version 2.0.0
 */

// Helper function to add delay between requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extracts owner and repository name from a GitHub URL
 * 
 * @param {string} repositoryUrl - The GitHub repository URL (e.g., 'https://github.com/owner/repo')
 * @returns {Object} Object containing owner and repo name
 * @throws {Error} If the URL is invalid or malformed
 */
function parseGitHubUrl(repositoryUrl) {
  try {
    const url = new URL(repositoryUrl);
    
    if (url.hostname !== 'github.com') {
      throw new Error('Invalid GitHub URL: hostname must be github.com');
    }
    
    const pathParts = url.pathname.split('/').filter(part => part.length > 0);
    
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub URL: must contain owner and repository name');
    }
    
    const owner = pathParts[0];
    const repo = pathParts[1];
    
    // Remove .git extension if present
    const cleanRepo = repo.replace(/\.git$/, '');
    
    return { owner, repo: cleanRepo };
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Invalid URL format');
    }
    throw error;
  }
}

/**
 * Fetches DORA metrics for a single repository
 * 
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @returns {Promise<Object>} DORA metrics object
 */
async function fetchRepositoryMetrics(owner, repo) {
  const octokit = getNextOctokit();

  try {
    console.log(`Fetching DORA metrics for ${owner}/${repo}...`);

    const [releasesRes, tagsRes, commitsRes, pullsRes, issuesRes] = await Promise.all([
      octokit.rest.repos.listReleases({ owner, repo, per_page: 100 }),
      octokit.rest.repos.listTags({ owner, repo, per_page: 100 }),
      octokit.rest.repos.listCommits({ owner, repo, per_page: 100 }),
      octokit.rest.pulls.list({ owner, repo, state: 'closed', per_page: 100 }),
      octokit.rest.issues.listForRepo({ owner, repo, state: 'closed', per_page: 100, labels: 'bug,incident' })
    ]);

    const releases = releasesRes.data;
    const tags = tagsRes.data;
    const commits = commitsRes.data;
    const pullRequests = pullsRes.data;
    const issues = issuesRes.data;

    const metrics = {
      repository: {
        name: repo,
        owner: owner,
        full_name: `${owner}/${repo}`,
        url: `https://github.com/${owner}/${repo}`
      },
      deployment_frequency: calculateDeploymentFrequency(releases, tags),
      lead_time: calculateLeadTime(pullRequests, commits),
      mttr: calculateMTTR(issues),
      change_failure_rate: calculateChangeFailureRate(releases, issues),
      data_summary: {
        releases_count: releases.length,
        tags_count: tags.length,
        commits_count: commits.length,
        pull_requests_count: pullRequests.length,
        issues_count: issues.length,
        fetched_at: new Date().toISOString()
      }
    };

    console.log(`Successfully processed DORA metrics for ${owner}/${repo}`);
    return metrics;

  } catch (error) {
    if (error.status === 403) {
      console.error(`Rate limit exceeded for ${owner}/${repo}. Waiting 60 seconds...`);
      await delay(60000);
      return fetchRepositoryMetrics(owner, repo); // retry
    }

    const errorMessage = error.status === 404
      ? `Repository not found: ${owner}/${repo}`
      : error.status === 401
        ? 'Invalid GitHub token or insufficient permissions'
        : error.message;

    console.error(`Error fetching metrics for ${owner}/${repo}: ${errorMessage}`);
    return null;
  }
}

/**
 * Fetches DORA metrics for a single repository using a GitHub URL
 * 
 * @param {string} repositoryUrl - The GitHub repository URL
 * @returns {Promise<Object>} DORA metrics object
 * @throws {Error} For invalid URLs, network issues, or GitHub API errors
 */
async function getDORAMetrics(repositoryUrl) {
  try {
    const { owner, repo } = parseGitHubUrl(repositoryUrl);
    return await fetchRepositoryMetrics(owner, repo);
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
  
  console.log(`Processing ${repositoryUrls.length} repositories...`);
  
  for (let i = 0; i < repositoryUrls.length; i++) {
    const url = repositoryUrls[i];
    try {
      console.log(`Processing ${i + 1}/${repositoryUrls.length}: ${url}`);
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
    console.log(`Fetching repositories for organization: ${organization}`);
    
    const { data: repos } = await octokit.rest.repos.listForOrg({
      org: organization,
      per_page: Math.min(maxRepos, 100),
      sort: 'updated',
      direction: 'desc'
    });
    
    console.log(`Found ${repos.length} repositories. Processing DORA metrics...`);
    
    const repositoryUrls = repos.slice(0, maxRepos).map(repo => 
      `https://github.com/${organization}/${repo.name}`
    );
    
    return await getDORAMetricsBatch(repositoryUrls);
    
  } catch (error) {
    throw new Error(`Failed to fetch organization repositories: ${error.message}`);
  }
}

// DORA Metrics Calculation Functions (keeping your existing logic)
function calculateDeploymentFrequency(releases, tags) {
  // Filter out draft and pre-release releases to count only actual deployments
  const deployments = releases
    .filter(r => !r.draft && !r.prerelease)
    .map(r => new Date(r.created_at))
    .sort((a, b) => a - b);

  if (deployments.length === 0) {
    return {
      total_deployments: 0,
      frequency_per_day: 0,
      time_span_days: 0,
      status: 'No deployments found'
    };
  }

  if (deployments.length === 1) {
    return {
      total_deployments: 1,
      time_span_days: 0,
      frequency_per_day: 'N/A (single deployment)',
      status: 'Single deployment'
    };
  }

  const timeSpan = deployments[deployments.length - 1] - deployments[0];
  const days = timeSpan / (1000 * 60 * 60 * 24);

  return {
    total_deployments: deployments.length,
    time_span_days: Math.round(days),
    frequency_per_day: (deployments.length / (days || 1)).toFixed(2),
    status: 'Multiple deployments'
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
      status: 'No bug/incident issues found'
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

function calculateChangeFailureRate(releases, issues) {
  if (!releases || releases.length === 0) {
    return {
      total_deployments: 0,
      bug_or_incident_fixes: 0,
      failure_rate: '0%',
      status: 'No releases found'
    };
  }

  // Only count issues labeled as 'bug' or 'incident'
  const failureIssues = issues.filter(issue =>
    issue.labels &&
    issue.labels.some(label =>
      ['bug', 'incident'].includes(label.name.toLowerCase())
    )
  );

  return {
    total_deployments: releases.length,
    bug_or_incident_fixes: failureIssues.length,
    failure_rate: ((failureIssues.length / releases.length) * 100).toFixed(2) + '%',
    status: 'CFR calculated successfully'
  };
}

/**
 * Creates a mock DORA metrics response for testing purposes
 * 
 * @returns {Object} Mock DORA metrics object
 */
function createMockDORAMetrics() {
  return {
    repository: {
      name: "test-repository",
      owner: "test-owner",
      full_name: "test-owner/test-repository",
      url: "https://github.com/test-owner/test-repository"
    },
    deployment_frequency: {
      total_deployments: 15,
      time_span_days: 90,
      frequency_per_day: "0.17",
      status: "Multiple deployments"
    },
    lead_time: {
      average_days: "3.5",
      min_days: "0.5",
      max_days: "12.0",
      total_prs_analyzed: 25,
      status: "Valid lead times calculated"
    },
    mttr: {
      average_days: "2.1",
      min_days: "0.1",
      max_days: "8.5",
      total_incidents_analyzed: 8,
      status: "Valid MTTR calculated"
    },
    change_failure_rate: {
      total_deployments: 15,
      bug_or_incident_fixes: 2,
      failure_rate: "13.33%",
      status: "CFR calculated successfully"
    },
    data_summary: {
      releases_count: 15,
      tags_count: 20,
      commits_count: 150,
      pull_requests_count: 30,
      issues_count: 12,
      fetched_at: new Date().toISOString()
    }
  };
}

export {
  getDORAMetrics,
  getDORAMetricsBatch,
  getOrganizationDORAMetrics,
  parseGitHubUrl,
  createMockDORAMetrics
}; 