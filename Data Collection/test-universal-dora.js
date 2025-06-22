const { 
  getDORAMetrics, 
  getDORAMetricsBatch, 
  getOrganizationDORAMetrics,
  parseGitHubUrl, 
  createMockDORAMetrics 
} = require('./universal-dora-service');

/**
 * Test suite for Universal DORA Metrics Service
 * This file demonstrates usage and provides basic validation tests
 */

console.log('🧪 Testing Universal DORA Metrics Service\n');

// Test 1: URL Parsing
console.log('1. Testing URL Parsing:');
try {
  const testUrls = [
    'https://github.com/octocat/Hello-World',
    'https://github.com/microsoft/vscode',
    'https://github.com/facebook/react.git'
  ];
  
  testUrls.forEach(url => {
    const parsed = parseGitHubUrl(url);
    console.log(`✅ ${url} -> Owner: ${parsed.owner}, Repo: ${parsed.repo}`);
  });
} catch (error) {
  console.log(`❌ URL parsing failed: ${error.message}`);
}

// Test 2: Mock DORA Metrics
console.log('\n2. Testing Mock DORA Metrics:');
const mockMetrics = createMockDORAMetrics();
console.log('✅ Mock DORA metrics created successfully');
console.log(`Repository: ${mockMetrics.repository.full_name}`);
console.log(`Deployment Frequency: ${mockMetrics.deployment_frequency.total_deployments} deployments`);
console.log(`Lead Time: ${mockMetrics.lead_time.average_days} days average`);
console.log(`MTTR: ${mockMetrics.mttr.average_days} days average`);
console.log(`Change Failure Rate: ${mockMetrics.change_failure_rate.failure_rate}`);

// Test 3: Error Handling Examples
console.log('\n3. Testing Error Handling:');
const invalidUrls = [
  'https://gitlab.com/user/repo',
  'https://github.com/invalid',
  'not-a-url',
  'https://github.com/'
];

invalidUrls.forEach(url => {
  try {
    parseGitHubUrl(url);
    console.log(`❌ Should have failed: ${url}`);
  } catch (error) {
    console.log(`✅ Correctly rejected: ${url} - ${error.message}`);
  }
});

console.log('\n🎉 Basic tests completed!');
console.log('\nTo test with real GitHub API:');
console.log('1. Set GITHUB_TOKEN environment variable');
console.log('2. Uncomment the real API test below');
console.log('3. Run: node test-universal-dora.js');

/*
// Uncomment this section to test with real GitHub API
console.log('\n4. Testing with Real GitHub API:');
async function testRealAPI() {
  try {
    // Test single repository
    const doraMetrics = await getDORAMetrics('https://github.com/octocat/Hello-World');
    console.log('✅ Single repository DORA metrics successful!');
    console.log(`Repository: ${doraMetrics.repository.full_name}`);
    console.log(`Deployment Frequency: ${doraMetrics.deployment_frequency.total_deployments} deployments`);
    
    // Test batch processing
    const batchResults = await getDORAMetricsBatch([
      'https://github.com/octocat/Hello-World',
      'https://github.com/octocat/test-repo'
    ]);
    console.log('✅ Batch processing successful!');
    console.log(`Processed: ${batchResults.summary.successful}/${batchResults.summary.total} repositories`);
    
  } catch (error) {
    console.log(`❌ Real API test failed: ${error.message}`);
  }
}

// Uncomment the line below to run real API test
// testRealAPI();
*/ 