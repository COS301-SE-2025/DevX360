
import { getRepositoryInfo } from './repository-info-service.js';

const testUrl = 'https://github.com/facebook/react';

async function runTest() {
  try {
    const repoInfo = await getRepositoryInfo(testUrl);
    console.log(JSON.stringify(repoInfo, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();
