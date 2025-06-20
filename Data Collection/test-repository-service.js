const { 
  getRepositoryInfo, 
  parseGitHubUrl, 
  validateRepositoryInfo, 
  createMockRepositoryResponse 
} = require('./repository-info-service');

/**
 * Quick test suite for repository information service
 * This file demonstrates usage and provides basic validation tests
 */

console.log('🧪 Testing Repository Information Service\n');

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

// Test 2: Mock Response Validation
console.log('\n2. Testing Mock Response:');
const mockResponse = createMockRepositoryResponse();
const isValid = validateRepositoryInfo(mockResponse);
console.log(`✅ Mock response validation: ${isValid ? 'PASSED' : 'FAILED'}`);

// Test 3: Display Mock Data Structure
console.log('\n3. Mock Repository Data Structure:');
console.log(JSON.stringify(mockResponse, null, 2));

// Test 4: Error Handling Examples
console.log('\n4. Testing Error Handling:');
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
console.log('3. Run: node test-repository-service.js');

/*
// Uncomment this section to test with real GitHub API
console.log('\n5. Testing with Real GitHub API:');
async function testRealAPI() {
  try {
    const repoInfo = await getRepositoryInfo('https://github.com/octocat/Hello-World');
    console.log('✅ Real API test successful!');
    console.log(`Repository: ${repoInfo.name}`);
    console.log(`Contributors: ${repoInfo.total_contributors}`);
    console.log(`Primary Language: ${repoInfo.primary_language}`);
  } catch (error) {
    console.log(`❌ Real API test failed: ${error.message}`);
  }
}

// Uncomment the line below to run real API test
// testRealAPI();
*/ 