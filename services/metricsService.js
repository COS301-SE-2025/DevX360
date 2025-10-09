import { getDORAMetrics } from "../Data-Collection/universal-dora-service.js";
import { getRepositoryInfo } from "../Data-Collection/repository-info-service.js";

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

export { analyzeRepository };
