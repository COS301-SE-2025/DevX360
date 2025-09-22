export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/api/',
    '/mcp/',
    '/devx360-react/'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'Data Collection/**/*.js',
    'services/**/*.js',
    '!**/__tests__/**',
    '!**/*.test.js'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/api/',
    '/mcp/',
    '/devx360-react/'
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  transform: {},
  verbose: true
};

