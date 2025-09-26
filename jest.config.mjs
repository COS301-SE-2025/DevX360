export default {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/__tests__/**/*.test.ts'
  ],
  collectCoverageFrom: [
    'api/**/*.js',
    'services/**/*.js',
    'Data Collection/**/*.js',
    'mcp/**/*.js',
    'DevX360/backend/**/*.js',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['js', 'ts', 'json'],
  transform: {
    '^.+\\.(js|ts)$': 'babel-jest'
  },
  testTimeout: 10000
};