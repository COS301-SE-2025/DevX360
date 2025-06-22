const { getDORAMetrics } = require("../Data Collection/universal-dora-service");
const { getRepositoryInfo } = require("../Data Collection/repository-info-service");

async function analyzeRepository(url) {
  try {
    const metadata = await getRepositoryInfo(url);
    const metrics = await getDORAMetrics(url);
    
    return { 
      metadata,
      metrics 
    };
  } catch (error) {
    console.error(`Repository analysis failed for ${url}:`, error);
    throw new Error('Repository analysis failed: ' + error.message);
  }
}

module.exports = { analyzeRepository };
