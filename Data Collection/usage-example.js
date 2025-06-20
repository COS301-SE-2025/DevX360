const { getRepositoryInfo } = require('./repository-info-service');

/**
 * Usage Example: Repository Information Service Integration
 * 
 * This file demonstrates how to integrate the repository information service
 * into your backend application, including error handling and response formatting.
 */

// Example 1: Basic usage in an Express.js route
async function exampleExpressRoute(req, res) {
  try {
    const { repositoryUrl } = req.body;
    
    if (!repositoryUrl) {
      return res.status(400).json({
        error: 'Repository URL is required',
        example: 'https://github.com/owner/repo'
      });
    }
    
    const repoInfo = await getRepositoryInfo(repositoryUrl);
    
    res.json({
      success: true,
      data: repoInfo,
      message: 'Repository information retrieved successfully'
    });
    
  } catch (error) {
    console.error('Repository info error:', error.message);
    
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Example 2: Batch processing multiple repositories
async function processMultipleRepositories(repositoryUrls) {
  const results = [];
  const errors = [];
  
  for (const url of repositoryUrls) {
    try {
      console.log(`Processing: ${url}`);
      const repoInfo = await getRepositoryInfo(url);
      results.push({
        url,
        success: true,
        data: repoInfo
      });
    } catch (error) {
      errors.push({
        url,
        success: false,
        error: error.message
      });
    }
  }
  
  return {
    total: repositoryUrls.length,
    successful: results.length,
    failed: errors.length,
    results,
    errors
  };
}

// Example 3: Service integration with caching
class RepositoryService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }
  
  async getRepositoryInfoWithCache(repositoryUrl) {
    const cacheKey = repositoryUrl;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`Returning cached data for: ${repositoryUrl}`);
      return cached.data;
    }
    
    console.log(`Fetching fresh data for: ${repositoryUrl}`);
    const repoInfo = await getRepositoryInfo(repositoryUrl);
    
    this.cache.set(cacheKey, {
      data: repoInfo,
      timestamp: Date.now()
    });
    
    return repoInfo;
  }
  
  clearCache() {
    this.cache.clear();
    console.log('Repository cache cleared');
  }
}

// Example 4: Data transformation for frontend consumption
function transformForFrontend(repoInfo) {
  return {
    // Basic info for display
    display: {
      name: repoInfo.name,
      description: repoInfo.description || 'No description available',
      stars: repoInfo.stars,
      forks: repoInfo.forks,
      language: repoInfo.primary_language || 'Unknown',
      lastUpdated: new Date(repoInfo.updated_at).toLocaleDateString()
    },
    
    // Contributor summary
    contributors: {
      total: repoInfo.total_contributors,
      topContributors: repoInfo.contributors.slice(0, 5).map(c => ({
        name: c.username,
        contributions: c.contributions,
        avatar: c.avatar_url
      }))
    },
    
    // Language breakdown
    languages: Object.entries(repoInfo.languages || {}).map(([lang, bytes]) => ({
      name: lang,
      percentage: ((bytes / Object.values(repoInfo.languages).reduce((a, b) => a + b, 0)) * 100).toFixed(1)
    })),
    
    // Repository status
    status: {
      isPrivate: repoInfo.is_private,
      isArchived: repoInfo.is_archived,
      isFork: repoInfo.is_fork,
      openIssues: repoInfo.open_issues
    }
  };
}

// Example 5: Error handling with retry logic
async function getRepositoryInfoWithRetry(repositoryUrl, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await getRepositoryInfo(repositoryUrl);
    } catch (error) {
      console.log(`Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Export examples for use in other modules
module.exports = {
  exampleExpressRoute,
  processMultipleRepositories,
  RepositoryService,
  transformForFrontend,
  getRepositoryInfoWithRetry
};

// Demo usage (uncomment to test)
/*
async function demo() {
  console.log('🚀 Repository Service Integration Demo\n');
  
  // Test basic functionality
  try {
    const repoInfo = await getRepositoryInfo('https://github.com/octocat/Hello-World');
    console.log('✅ Basic retrieval successful');
    
    // Test frontend transformation
    const frontendData = transformForFrontend(repoInfo);
    console.log('✅ Frontend transformation successful');
    console.log('Display data:', frontendData.display);
    
    // Test service with caching
    const service = new RepositoryService();
    const cachedInfo = await service.getRepositoryInfoWithCache('https://github.com/octocat/Hello-World');
    console.log('✅ Cached retrieval successful');
    
  } catch (error) {
    console.log(`❌ Demo failed: ${error.message}`);
  }
}

// Uncomment to run demo
// demo();
*/ 