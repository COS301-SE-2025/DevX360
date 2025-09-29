import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

const mockOctokit = jest.fn();

jest.unstable_mockModule('octokit', () => ({
  Octokit: mockOctokit,
}));

describe('TokenManager', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Mock environment variables
    process.env = {
      ...originalEnv,
      GITHUB_TOKEN_1: 'token1',
      GITHUB_TOKEN_2: 'token2',
    };
    // Reset the module to clear the token index
    jest.resetModules();
  });

  afterEach(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  test('should cycle through available GitHub tokens', async () => {
    // Arrange
    const { getNextOctokit } = await import('../tokenManager.js');

    // Act & Assert
    // First call should use the first token
    getNextOctokit();
    expect(mockOctokit).toHaveBeenCalledWith(expect.objectContaining({ auth: 'token1' }));

    // Second call should use the second token
    getNextOctokit();
    expect(mockOctokit).toHaveBeenCalledWith(expect.objectContaining({ auth: 'token2' }));

    // Third call should cycle back to the first token
    getNextOctokit();
    expect(mockOctokit).toHaveBeenCalledWith(expect.objectContaining({ auth: 'token1' }));
  });

  test('should handle a single token correctly', async () => {
    // Arrange
    process.env = { ...originalEnv, GITHUB_TOKEN_1: 'single_token', GITHUB_TOKEN_2: undefined };
    const { getNextOctokit } = await import('../tokenManager.js');

    // Act & Assert
    getNextOctokit();
    expect(mockOctokit).toHaveBeenCalledWith(expect.objectContaining({ auth: 'single_token' }));

    getNextOctokit();
    expect(mockOctokit).toHaveBeenCalledWith(expect.objectContaining({ auth: 'single_token' }));
  });
});