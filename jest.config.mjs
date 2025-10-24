export default {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/*.test.js'
  ],
  collectCoverageFrom: [
    'api/**/*.js',
    'services/**/*.js',
    'Data-Collection/**/*.js',
    'mcp/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__tests__/**',
    '!**/.aws-sam/**',
    '!**/DevX360/**',
    '!**/Data Collection/**',
    '!**/frontend/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testTimeout: 10000,
  verbose: true
};
