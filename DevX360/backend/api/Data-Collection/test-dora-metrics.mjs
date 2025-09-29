
import { getDORAMetrics } from './universal-dora-service.js';

const testUrl = 'https://github.com/facebook/react';

async function runTest() {
  try {
    const doraMetrics = await getDORAMetrics(testUrl);
    console.log(JSON.stringify(doraMetrics, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTest();
