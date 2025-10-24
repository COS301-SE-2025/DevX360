export default {
  testEnvironment: 'node',
  testMatch: ['**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/', '/frontend/'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.new.js'],
  testTimeout: 10000,
  verbose: true
};
