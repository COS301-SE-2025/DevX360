export default {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/api/__tests__/db.test.js',
    '/api/__tests__/comprehensive.test.js',
    '/api/__tests__/app.test.js'
  ],
  transform: {},
  verbose: true
};
