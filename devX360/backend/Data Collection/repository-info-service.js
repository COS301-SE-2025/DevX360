import { Octokit } from 'octokit';

/**
 * Enhanced Repository Information Service with Maximum Accuracy
 * 
 * This module provides functionality to retrieve comprehensive repository information
 * from GitHub URLs using the Octokit library. Enhanced with accuracy indicators,
 * confidence scoring, and robust data validation.
 * 
 * @author DevX360 Team
 * @version 2.0.0
 */

// Initialize Octokit with proper rate limit handling
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN_1,
  throttle: {
    onRateLimit: (retryAfter, options) => {
      console.log(`Rate limit hit, waiting ${retryAfter} seconds...`);
      return true;
    },
    onSecondaryRateLimit: (retryAfter, options) => {
      console.log(`Secondary rate limit hit, waiting ${retryAfter} seconds...`);
      return true;
    }
  }
});

// Helper function to add delay between requests
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extracts owner and repository name from a GitHub URL with enhanced validation
 * 
 * @param {string} repositoryUrl - The GitHub repository URL (e.g., 'https://github.com/owner/repo')
 * @returns {Object} Object containing owner and repo name with validation info
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
    
    // Enhanced validation
    const validation = {
      isValid: true,
      confidence: 'high',
      warnings: []
    };
    
    // Check for common issues
    if (owner.length < 1 || cleanRepo.length < 1) {
      validation.warnings.push('Owner or repository name appears to be empty');
      validation.confidence = 'medium';
    }
    
    if (owner.includes(' ') || cleanRepo.includes(' ')) {
      validation.warnings.push('Owner or repository name contains spaces');
      validation.confidence = 'low';
    }
    
    return { 
      owner, 
      repo: cleanRepo,
      validation
    };
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Invalid URL format');
    }
    throw error;
  }
}

/**
 * Enhanced contributor fetching with accuracy indicators
 * 
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} limit - Maximum number of contributors to fetch (default: 10)
 * @returns {Promise<Object>} Object containing contributors and accuracy metrics
 */
async function fetchTopContributors(owner, repo, limit = 10) {
  try {
    const { data: contributors } = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: limit
    });
    
    await delay(1000);

    const processedContributors = contributors.map(user => ({
      username: user.login,
      contributions: user.contributions,
      avatar_url: user.avatar_url,
      profile_url: user.html_url,
      account_type: user.type,
      site_admin: user.site_admin || false
    }));

    return {
      contributors: processedContributors,
      accuracy_metrics: {
        total_contributors_found: contributors.length,
        has_contributions_data: contributors.every(c => c.contributions !== undefined),
        data_completeness: contributors.length > 0 ? 'complete' : 'incomplete',
        confidence_score: contributors.length >= 5 ? 95 : contributors.length >= 2 ? 85 : 70
      }
    };
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error.message);
    return {
      contributors: [],
      accuracy_metrics: {
        total_contributors_found: 0,
        has_contributions_data: false,
        data_completeness: 'failed',
        confidence_score: 0,
        error: error.message
      }
    };
  }
}

/**
 * Enhanced language analysis with accuracy scoring
 * 
 * @param {Object} languages - Raw language data from GitHub API
 * @returns {Object} Enhanced language analysis with accuracy metrics
 */
function analyzeLanguages(languages) {
  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  const languageEntries = Object.entries(languages);
  
  // Calculate percentages
  const languageBreakdown = languageEntries.map(([lang, bytes]) => ({
    language: lang,
    bytes: bytes,
    percentage: totalBytes > 0 ? ((bytes / totalBytes) * 100).toFixed(2) + '%' : '0%'
  })).sort((a, b) => b.bytes - a.bytes);
  
  // Determine primary language
  const primaryLanguage = languageBreakdown.length > 0 ? languageBreakdown[0].language : null;
  
  // Calculate accuracy metrics
  const accuracyMetrics = {
    total_languages: languageEntries.length,
    total_bytes: totalBytes,
    primary_language_confidence: languageBreakdown.length > 0 ? 
      (languageBreakdown[0].bytes / totalBytes * 100).toFixed(1) + '%' : '0%',
    data_quality: totalBytes > 0 ? 'high' : 'low',
    confidence_score: languageEntries.length > 0 ? 95 : 0
  };
  
  return {
    languages: languages,
    language_breakdown: languageBreakdown,
    primary_language: primaryLanguage,
    accuracy_metrics: accuracyMetrics
  };
}

/**
 * Enhanced repository statistics with validation
 * 
 * @param {Object} repository - Raw repository data from GitHub API
 * @returns {Object} Enhanced statistics with accuracy indicators
 */
function analyzeRepositoryStats(repository) {
  const stats = {
    stars: repository.stargazers_count,
    forks: repository.forks_count,
    watchers: repository.subscribers_count,
    open_issues: repository.open_issues_count,
    size: repository.size
  };
  
  // Calculate accuracy indicators
  const accuracyMetrics = {
    data_completeness: 'complete',
    confidence_score: 100,
    validation_checks: {
      has_stars: typeof stats.stars === 'number',
      has_forks: typeof stats.forks === 'number',
      has_watchers: typeof stats.watchers === 'number',
      has_issues: typeof stats.open_issues === 'number',
      has_size: typeof stats.size === 'number'
    }
  };
  
  // Check for data quality issues
  if (stats.stars < 0 || stats.forks < 0 || stats.open_issues < 0) {
    accuracyMetrics.data_completeness = 'suspicious';
    accuracyMetrics.confidence_score = 80;
    accuracyMetrics.warnings = ['Negative values detected in statistics'];
  }
  
  return {
    statistics: stats,
    accuracy_metrics: accuracyMetrics
  };
}

/**
 * Enhanced repository information fetching with maximum accuracy
 * 
 * This function accepts a GitHub repository URL and retrieves comprehensive
 * information including repository details, languages, statistics, and contributor
 * information. Enhanced with accuracy indicators and confidence scoring.
 * 
 * @param {string} repositoryUrl - The GitHub repository URL (e.g., 'https://github.com/owner/repo')
 * @returns {Promise<Object>} Enhanced repository information object with accuracy metrics
 * @throws {Error} For invalid URLs, network issues, or GitHub API errors
 * 
 * @example
 * const repoInfo = await getRepositoryInfo('https://github.com/octocat/Hello-World');
 * console.log(repoInfo.name); // 'Hello-World'
 * console.log(repoInfo.accuracy_indicators.overall_confidence); // 95
 */
async function getRepositoryInfo(repositoryUrl) {
  try {
    // Validate and parse the GitHub URL with enhanced validation
    const { owner, repo, validation } = parseGitHubUrl(repositoryUrl);
    
    console.log(`Fetching enhanced repository information for ${owner}/${repo}...`);
    
    // Fetch basic repository information
    const { data: repository } = await octokit.rest.repos.get({
      owner,
      repo
    });
    await delay(1000);
    
    // Fetch repository languages
    const { data: languages } = await octokit.rest.repos.listLanguages({
      owner,
      repo
    });
    await delay(1000);

    // Fetch open issues (excluding PRs) - limited to avoid pagination issues
    let allIssues = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const { data: issues } = await octokit.rest.issues.listForRepo({
          owner,
          repo,
          state: 'open',
          per_page: 100,
          page: page
        });

        if (issues.length === 0) {
          hasMore = false;
        } else {
          allIssues = allIssues.concat(issues);
          page++;
          
          // Respect rate limits
          if (issues.length < 100) {
            hasMore = false;
          }
          
          await delay(1000);
        }
      } catch (error) {
        console.error(`Error fetching issues page ${page}:`, error.message);
        hasMore = false;
      }
    }

    // Filter out PRs to get only issues
    const openIssuesOnly = allIssues.filter(issue => !issue.pull_request);
    console.log("OPEN ISSUES: ", openIssuesOnly.length);
    // Fetch open pull requests
    let openPRs = [];
    page = 1;
    hasMore = true;

    while (hasMore) {
      try {
        const { data: prs } = await octokit.rest.pulls.list({
          owner,
          repo,
          state: 'open',  // Only fetch open PRs
          per_page: 100,
          page: page
        });

        if (prs.length === 0) {
          hasMore = false;
        } else {
          openPRs = openPRs.concat(prs);
          page++;
          
          if (prs.length < 100) {
            hasMore = false;
          }
          
          await delay(1000);
        }
      } catch (error) {
        console.error(`Error fetching open PRs page ${page}:`, error.message);
        hasMore = false;
      }
    }
    
    // Fetch recent commits for deployment detection
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 100,
      since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // Last 30 days
    });
    await delay(1000);
    
    // Fetch top contributors with accuracy metrics
    const contributorData = await fetchTopContributors(owner, repo, 30, 10);
    
    // Enhanced language analysis
    const languageAnalysis = analyzeLanguages(languages);
    
    // Enhanced statistics analysis
    const statsAnalysis = analyzeRepositoryStats(repository);
    
    // Calculate overall accuracy score
    const overallConfidence = Math.round(
      (contributorData.accuracy_metrics.confidence_score +
       languageAnalysis.accuracy_metrics.confidence_score +
       statsAnalysis.accuracy_metrics.confidence_score) / 3
    );
    
    // Structure the enhanced response data
    const repositoryInfo = {
      // Basic repository information
      name: repository.name,
      full_name: repository.full_name,
      description: repository.description,
      url: repository.html_url,
      clone_url: repository.clone_url,
      
      // Enhanced statistics with accuracy metrics
      stars: statsAnalysis.statistics.stars,
      forks: statsAnalysis.statistics.forks,
      watchers: statsAnalysis.statistics.watchers,
      open_issues: openIssuesOnly.length,
      open_pull_requests: openPRs.length,
      size: statsAnalysis.statistics.size,
      
      // Enhanced programming languages with analysis
      languages: languageAnalysis.languages,
      language_breakdown: languageAnalysis.language_breakdown,
      primary_language: languageAnalysis.primary_language,
      
      // Repository metadata
      created_at: repository.created_at,
      updated_at: repository.updated_at,
      pushed_at: repository.pushed_at,
      default_branch: repository.default_branch,
      
      // Repository status
      is_private: repository.private,
      is_fork: repository.fork,
      is_archived: repository.archived,
      is_disabled: repository.disabled,
      
      // Enhanced contributor information
      contributors: contributorData.contributors,
      total_contributors: contributorData.contributors.length,
      
      // Additional metadata
      license: repository.license ? {
        name: repository.license.name,
        key: repository.license.key,
        url: repository.license.url
      } : null,
      
      topics: repository.topics || [],
      
      // Enhanced accuracy indicators
      accuracy_indicators: {
        overall_confidence: overallConfidence,
        url_validation: validation,
        contributor_accuracy: contributorData.accuracy_metrics,
        language_accuracy: languageAnalysis.accuracy_metrics,
        statistics_accuracy: statsAnalysis.accuracy_metrics,
        data_quality: overallConfidence >= 90 ? 'excellent' : 
                     overallConfidence >= 80 ? 'good' : 
                     overallConfidence >= 70 ? 'fair' : 'poor'
      },
      
      // API metadata
      fetched_at: new Date().toISOString(),
      api_version: 'v2.0.0',
      enhanced_features: [
        'accuracy_scoring',
        'confidence_indicators',
        'data_validation',
        'enhanced_analysis'
      ]
    };
    
    console.log(`Successfully retrieved enhanced information for ${owner}/${repo} (Confidence: ${overallConfidence}%)`);
    return repositoryInfo;
    
  } catch (error) {
    // Handle specific GitHub API errors with enhanced error reporting
    if (error.status === 404) {
      throw new Error(`Repository not found: ${repositoryUrl}`);
    } else if (error.status === 403) {
      throw new Error('Access denied: Repository may be private or authentication failed');
    } else if (error.status === 401) {
      throw new Error('Authentication failed: Please check your GitHub token');
    } else if (error.status === 429) {
      throw new Error('Rate limit exceeded: Please wait before making more requests');
    } else {
      throw new Error(`Failed to fetch repository information: ${error.message}`);
    }
  }
}

/**
 * Validates repository information response
 * 
 * @param {Object} repoInfo - Repository information object
 * @returns {boolean} True if the response is valid
 */
function validateRepositoryInfo(repoInfo) {
  return repoInfo && 
         typeof repoInfo.name === 'string' &&
         typeof repoInfo.full_name === 'string' &&
         Array.isArray(repoInfo.contributors) &&
         typeof repoInfo.total_contributors === 'number';
}

/**
 * Creates a mock repository response for testing purposes
 * 
 * This function generates a mock response that mimics the structure
 * of the GitHub API response, useful for unit testing and integration testing.
 * 
 * @returns {Object} Mock repository information object
 */
function createMockRepositoryResponse() {
  return {
    name: "test-repository",
    full_name: "test-owner/test-repository",
    description: "A test repository for development and testing purposes",
    url: "https://github.com/test-owner/test-repository",
    clone_url: "https://github.com/test-owner/test-repository.git",
    
    // Repository statistics
    stars: 150,
    forks: 25,
    watchers: 150,
    open_issues: 12,
    size: 1024,
    
    // Programming languages
    languages: {
      "JavaScript": 45000,
      "Python": 15000,
      "HTML": 5000,
      "CSS": 3000
    },
    primary_language: "JavaScript",
    
    // Repository metadata
    created_at: "2023-01-15T10:30:00Z",
    updated_at: "2024-01-20T14:45:00Z",
    pushed_at: "2024-01-20T14:45:00Z",
    default_branch: "main",
    
    // Repository status
    is_private: false,
    is_fork: false,
    is_archived: false,
    is_disabled: false,
    
    // Contributor information
    contributors: [
      {
        username: "test-user-1",
        contributions: 150,
        avatar_url: "https://avatars.githubusercontent.com/u/123456?v=4",
        profile_url: "https://github.com/test-user-1"
      },
      {
        username: "test-user-2",
        contributions: 89,
        avatar_url: "https://avatars.githubusercontent.com/u/789012?v=4",
        profile_url: "https://github.com/test-user-2"
      },
      {
        username: "test-user-3",
        contributions: 67,
        avatar_url: "https://avatars.githubusercontent.com/u/345678?v=4",
        profile_url: "https://github.com/test-user-3"
      }
    ],
    total_contributors: 3,
    
    // Additional metadata
    license: {
      name: "MIT License",
      key: "mit",
      url: "https://api.github.com/licenses/mit"
    },
    
    topics: ["javascript", "python", "testing", "development"],
    
    // API metadata
    fetched_at: new Date().toISOString(),
    api_version: "v1.0.0"
  };
}

/**
 * Extracts owner and repo from GitHub URL (simplified version)
 * @param {string} url - GitHub repository URL
 * @returns {Array} [owner, repo]
 */
export function extractOwnerAndRepo(url) {
  const parsed = parseGitHubUrl(url);
  return [parsed.owner, parsed.repo];
}

/**
 * Collects member activity statistics for a specific user in a repository
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name  
 * @param {string} githubUsername - GitHub username to analyze
 * @returns {Promise<Object>} Activity statistics
 */
export async function collectMemberActivity(owner, repo, githubUsername) {
  try {
    console.log(`Collecting activity for ${githubUsername} in ${owner}/${repo}`);
    
    // Fetch user's commits
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      author: githubUsername,
      per_page: 100
    });
    
    // Fetch user's pull requests
    const { data: pullRequests } = await octokit.rest.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 100
    });
    
    // Filter PRs by author
    const userPRs = pullRequests.filter(pr => pr.user?.login === githubUsername);
    
    // Fetch user's issues
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner,
      repo,
      state: 'all',
      per_page: 100
    });
    
    // Filter issues by author (excluding PRs)
    const userIssues = issues.filter(issue => 
      issue.user?.login === githubUsername && !issue.pull_request
    );
    
    // Calculate statistics
    const stats = {
      commits: {
        total: commits.length,
        recent: commits.filter(c => {
          const commitDate = new Date(c.commit.author.date);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return commitDate >= thirtyDaysAgo;
        }).length
      },
      pullRequests: {
        total: userPRs.length,
        merged: userPRs.filter(pr => pr.merged_at).length,
        open: userPRs.filter(pr => pr.state === 'open').length,
        closed: userPRs.filter(pr => pr.state === 'closed' && !pr.merged_at).length
      },
      issues: {
        total: userIssues.length,
        open: userIssues.filter(issue => issue.state === 'open').length,
        closed: userIssues.filter(issue => issue.state === 'closed').length
      },
      activityScore: calculateActivityScore(commits.length, userPRs.length, userIssues.length),
      lastActivity: commits.length > 0 ? commits[0].commit.author.date : null,
      collectedAt: new Date().toISOString()
    };
    
    return stats;
  } catch (error) {
    console.error(`Error collecting activity for ${githubUsername}:`, error);
    return {
      error: error.message,
      commits: { total: 0, recent: 0 },
      pullRequests: { total: 0, merged: 0, open: 0, closed: 0 },
      issues: { total: 0, open: 0, closed: 0 },
      activityScore: 0,
      lastActivity: null,
      collectedAt: new Date().toISOString()
    };
  }
}

/**
 * Calculates activity score based on contributions
 */
function calculateActivityScore(commits, prs, issues) {
  const commitScore = commits * 1;
  const prScore = prs * 3;
  const issueScore = issues * 2;
  return commitScore + prScore + issueScore;
}

export {
  getRepositoryInfo,
  parseGitHubUrl,
  fetchTopContributors,
  validateRepositoryInfo,
  createMockRepositoryResponse,
  // Already exported individually above:
  // extractOwnerAndRepo,
  // collectMemberActivity
}; 