import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

const mockGetDORAMetrics = jest.fn();
const mockGetRepositoryInfo = jest.fn();

jest.unstable_mockModule('../../Data-Collection/universal-dora-service.js', () => ({
  getDORAMetrics: mockGetDORAMetrics,
}));

jest.unstable_mockModule('../../Data-Collection/repository-info-service.js', () => ({
  getRepositoryInfo: mockGetRepositoryInfo,
}));

const { analyzeRepository } = await import('../metricsService.js');

describe('analyzeRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error
  });

  afterEach(() => {
    console.error.mockRestore(); // Restore console.error
  });

  test('should successfully analyze a repository and return metadata and metrics', async () => {
    // Arrange
    const mockRepoInfo = { name: 'test-repo', owner: 'test-owner' };
    const mockDoraMetrics = { deployment_frequency: 10 };
    mockGetRepositoryInfo.mockResolvedValue(mockRepoInfo);
    mockGetDORAMetrics.mockResolvedValue(mockDoraMetrics);
    const url = 'https://github.com/test-owner/test-repo';

    // Act
    const result = await analyzeRepository(url);

    // Assert
    expect(mockGetRepositoryInfo).toHaveBeenCalledWith(url);
    expect(mockGetDORAMetrics).toHaveBeenCalledWith(url);
    expect(result).toEqual({
      metadata: mockRepoInfo,
      metrics: mockDoraMetrics,
    });
  });

  test('should throw an error if getRepositoryInfo fails', async () => {
    // Arrange
    const errorMessage = 'Repository not found';
    mockGetRepositoryInfo.mockRejectedValue(new Error(errorMessage));
    const url = 'https://github.com/invalid/repo';

    // Act & Assert
    await expect(analyzeRepository(url)).rejects.toThrow(errorMessage);
    expect(mockGetRepositoryInfo).toHaveBeenCalledWith(url);
    expect(mockGetDORAMetrics).not.toHaveBeenCalled();
  });

  test('should throw an error if getDORAMetrics fails', async () => {
    // Arrange
    const errorMessage = 'DORA metrics fetch failed';
    mockGetRepositoryInfo.mockResolvedValue({}); // getRepositoryInfo succeeds
    mockGetDORAMetrics.mockRejectedValue(new Error(errorMessage));
    const url = 'https://github.com/test-owner/test-repo';

    // Act & Assert
    await expect(analyzeRepository(url)).rejects.toThrow(errorMessage);
    expect(mockGetRepositoryInfo).toHaveBeenCalledWith(url);
    expect(mockGetDORAMetrics).toHaveBeenCalledWith(url);
  });

  test('should return specific error message for rate limit', async () => {
    // Arrange
    const error = new Error('GitHub API rate limit exceeded');
    error.message = 'rate limit'; // Simulate message content
    mockGetRepositoryInfo.mockRejectedValue(error);
    const url = 'https://github.com/test-owner/test-repo';

    // Act & Assert
    await expect(analyzeRepository(url)).rejects.toThrow("GitHub API rate limit exceeded. Please try again later.");
  });

  test('should return specific error message for repository not found', async () => {
    // Arrange
    const error = new Error('Not Found');
    error.message = 'Not Found'; // Simulate message content
    mockGetRepositoryInfo.mockRejectedValue(error);
    const url = 'https://github.com/test-owner/test-repo';

    // Act & Assert
    await expect(analyzeRepository(url)).rejects.toThrow("Repository not found or inaccessible");
  });

  test('should return specific error message for invalid URL', async () => {
    // Arrange
    const error = new Error('Invalid URL');
    error.message = 'Invalid URL'; // Simulate message content
    mockGetRepositoryInfo.mockRejectedValue(error);
    const url = 'invalid-url';

    // Act & Assert
    await expect(analyzeRepository(url)).rejects.toThrow("Invalid GitHub repository URL");
  });
});