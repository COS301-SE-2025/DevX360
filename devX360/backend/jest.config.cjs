module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/api/__tests__/db.test.js',
    '/api/__tests__/comprehensive.test.js',
    '/api/__tests__/app.test.js'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'  // Use babel-jest to transform JS files
  },
  verbose: true
};
