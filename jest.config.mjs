export default {
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/api/__tests__/**/*.test.js',
    '<rootDir>/services/__tests__/**/*.test.js',
    '<rootDir>/mcp/__tests__/**/*.test.js',
    '<rootDir>/Data-Collection/__tests__/**/*.test.js'
  ],
  collectCoverageFrom: [
    'api/**/*.js',
    'services/**/*.js',
    'mcp/**/*.js',
    'Data-Collection/**/*.js',
    '!**/node_modules/**',
    '!**/__tests__/**',
    '!**/*.test.js',
    '!**/jest.config.*',
    '!**/babel.config.*'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  testTimeout: 30000,
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  },
  verbose: true
};