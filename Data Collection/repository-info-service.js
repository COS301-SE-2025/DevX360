const { Octokit } = require('octokit');

/**
 * Repository Information Service
 * 
 * This module provides functionality to retrieve comprehensive repository information
 * from GitHub URLs using the Octokit library. It's designed to be modular, testable,
 * and easily integrable into larger backend systems.
 * 
 * @author DevX360 Team
 * @version 1.0.0
 */

// Initialize Octokit with proper rate limit handling
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
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
 * Fetches top contributors for a repository
 * 
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {number} limit - Maximum number of contributors to fetch (default: 10)
 * @returns {Promise<Array>} Array of contributor objects with username and contributions
 */
async function fetchTopContributors(owner, repo, limit = 10) {
  try {
    const { data: contributors } = await octokit.rest.repos.listContributors({
      owner,
      repo,
      per_page: limit
    });
    
    await delay(1000); // Rate limiting
    
    return contributors.map(contributor => ({
      username: contributor.login,
      contributions: contributor.contributions,
      avatar_url: contributor.avatar_url,
      profile_url: contributor.html_url
    }));
  } catch (error) {
    console.error(`Error fetching contributors for ${owner}/${repo}:`, error.message);
    return [];
  }
}

/**
 * Fetches detailed repository information from GitHub
 * 
 * This function accepts a GitHub repository URL and retrieves comprehensive
 * information including repository details, languages, statistics, and contributor
 * information. It's designed for asynchronous execution and includes robust
 * error handling for various failure scenarios.
 * 
 * @param {string} repositoryUrl - The GitHub repository URL (e.g., 'https://github.com/owner/repo')
 * @returns {Promise<Object>} Structured repository information object
 * @throws {Error} For invalid URLs, network issues, or GitHub API errors
 * 
 * @example
 * const repoInfo = await getRepositoryInfo('https://github.com/octocat/Hello-World');
 * console.log(repoInfo.name); // 'Hello-World'
 * console.log(repoInfo.contributors.length); // Number of contributors
 */
async function getRepositoryInfo(repositoryUrl) {
  try {
    // Validate and parse the GitHub URL
    const { owner, repo } = parseGitHubUrl(repositoryUrl);
    
    console.log(`Fetching repository information for ${owner}/${repo}...`);
    
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
    
    // Fetch top contributors
    const contributors = await fetchTopContributors(owner, repo, 10);
    
    // Calculate total number of unique contributors
    const totalContributors = contributors.length;
    
    // Structure the response data
    const repositoryInfo = {
      // Basic repository information
      name: repository.name,
      full_name: repository.full_name,
      description: repository.description,
      url: repository.html_url,
      clone_url: repository.clone_url,
      
      // Repository statistics
      stars: repository.stargazers_count,
      forks: repository.forks_count,
      watchers: repository.watchers_count,
      open_issues: repository.open_issues_count,
      size: repository.size,
      
      // Programming languages
      languages: languages,
      primary_language: repository.language,
      
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
      
      // Contributor information
      contributors: contributors,
      total_contributors: totalContributors,
      
      // Additional metadata
      license: repository.license ? {
        name: repository.license.name,
        key: repository.license.key,
        url: repository.license.url
      } : null,
      
      topics: repository.topics || [],
      
      // API metadata
      fetched_at: new Date().toISOString(),
      api_version: 'v1.0.0'
    };
    
    console.log(`Successfully retrieved information for ${owner}/${repo}`);
    return repositoryInfo;
    
  } catch (error) {
    // Handle specific GitHub API errors
    if (error.status === 404) {
      throw new Error(`Repository not found: ${repositoryUrl}`);
    } else if (error.status === 403) {
      throw new Error('Access denied: Repository may be private or authentication failed');
    } else if (error.status === 401) {
      throw new Error('Authentication failed: Please check your GitHub token');
    } else if (error.status === 422) {
      throw new Error('Invalid repository URL or repository is empty');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Network connectivity issue: Unable to reach GitHub API');
    } else if (error.message.includes('rate limit')) {
      throw new Error('GitHub API rate limit exceeded. Please try again later.');
    }
    
    // Re-throw other errors with context
    throw new Error(`Failed to fetch repository information: ${error.message}`);
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

module.exports = {
  getRepositoryInfo,
  parseGitHubUrl,
  fetchTopContributors,
  validateRepositoryInfo,
  createMockRepositoryResponse
}; 