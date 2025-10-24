import { getDORAMetrics, getDORAMetricsWithToken } from "../Data-Collection/universal-dora-service.js";
import { getRepositoryInfo, getRepositoryInfoWithToken } from "../Data-Collection/repository-info-service.js";

async function analyzeRepository(url, userId = null) {
  try {
    const metadata = await getRepositoryInfo(url, userId);
    const metrics = await getDORAMetrics(url, userId);
    
    return { 
      metadata,
      metrics 
    };
  } catch (error) {
    console.error(`Repository analysis failed for ${url}:`, error);

    let errorMessage = error.message;
    if (error.message.includes('rate limit')) {
      errorMessage = "GitHub API rate limit exceeded. Please try again later.";
    } else if (error.message.includes('Not Found')) {
      errorMessage = "Repository not found or inaccessible";
    } else if (error.message.includes('Invalid URL')) {
      errorMessage = "Invalid GitHub repository URL";
    }
    
    throw new Error(errorMessage);
  }
}

async function analyzeRepositoryWithToken(url, githubToken) {
  try {
    // Use the token-based functions directly
    const metadata = await getRepositoryInfoWithToken(url, githubToken);
    const metrics = await getDORAMetricsWithToken(url, githubToken);
    
    return { 
      metadata,
      metrics 
    };
  } catch (error) {
    console.error(`Repository analysis with user token failed for ${url}:`, error);

    let errorMessage = error.message;
    if (error.message.includes('rate limit')) {
      errorMessage = "GitHub API rate limit exceeded. Please try again later.";
    } else if (error.message.includes('Not Found')) {
      errorMessage = "Repository not found or you don't have access to it";
    } else if (error.message.includes('Invalid URL')) {
      errorMessage = "Invalid GitHub repository URL";
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      errorMessage = "Invalid or expired GitHub token";
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      errorMessage = "GitHub token doesn't have access to this repository";
    }
    
    throw new Error(errorMessage);
  }
}

export { analyzeRepository, analyzeRepositoryWithToken };
