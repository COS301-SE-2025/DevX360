import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

const mockGetNextOctokit = jest.fn();
jest.unstable_mockModule('../tokenManager.js', () => ({
  getNextOctokit: mockGetNextOctokit,
}));

const mockConcurrentMap = jest.fn();
jest.unstable_mockModule('../../api/utils/concurrentMap.js', () => ({
  concurrentMap: mockConcurrentMap,
}));

// Mock OpenAI SDK used by codeInterpretor
const mockOpenAIResponsesCreate = jest.fn();
jest.unstable_mockModule('openai', () => ({
  default: jest.fn().mockImplementation(() => ({
    responses: {
      create: mockOpenAIResponsesCreate,
    },
  })),
}));

global.fetch = jest.fn();

const { performDORAAnalysis, analyzeRepositoryStructure, generateDORAInsights } = await import('../codeInterpretor.js');

describe('CodeInterpretor', () => {
  let mockOctokit;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOctokit = {
      rest: {
        repos: {
          get: jest.fn().mockResolvedValue({ data: { full_name: 'owner/repo', language: 'JavaScript', stargazers_count: 10, forks_count: 5, updated_at: new Date().toISOString() } }),
          listCommits: jest.fn().mockResolvedValue({ data: [] }),
          listReleases: jest.fn().mockResolvedValue({ data: [] }),
          getContent: jest.fn().mockResolvedValue({ data: [] }),
        },
        pulls: {
          list: jest.fn().mockResolvedValue({ data: [] }),
        },
      },
    };
    mockGetNextOctokit.mockReturnValue(mockOctokit);
    mockConcurrentMap.mockImplementation(async (items, _, task) => {
      for (const item of items) {
        await task(item);
      }
    });
    // Default OpenAI mock response
    mockOpenAIResponsesCreate.mockResolvedValue({ output_text: 'Test insights' });
  });

  describe('analyzeRepositoryStructure', () => {
    test('should analyze repository structure and return analysis', async () => {
      // Arrange
      const owner = 'owner';
      const repo = 'repo';

      // Act
      const result = await analyzeRepositoryStructure(owner, repo);

      // Assert
      expect(result.repository.name).toBe('owner/repo');
      expect(mockOctokit.rest.repos.get).toHaveBeenCalledWith({ owner, repo });
    });

    test('should handle errors during repository analysis', async () => {
      // Arrange
      mockOctokit.rest.repos.get.mockRejectedValue(new Error('API Error'));

      // Act & Assert
      await expect(analyzeRepositoryStructure('owner', 'repo')).rejects.toThrow('Repository analysis failed: API Error');
    });
  });

  describe('generateDORAInsights', () => {
    test('should generate DORA insights from repository analysis', async () => {
      // Arrange
      const repositoryAnalysis = {
        repository: { name: 'owner/repo', language: 'JavaScript', lastUpdated: new Date().toISOString() },
        doraIndicators: {
          deployment_frequency: [],
          lead_time: [],
          mttr: [],
          change_failure_rate: []
        },
        patterns: {
          commits: { totalCommits: 10, commitTypes: { fixes: 1, features: 2, deployments: 3 } },
          pullRequests: { averageTimeToMerge: 5, merged: 8, totalPRs: 10 },
          releases: { releaseFrequency: 'monthly', totalReleases: 2 },
        },
      };
      const metrics = {};

      // Act
      const result = await generateDORAInsights(repositoryAnalysis, metrics);

      // Assert
      expect(result).toBe('Test insights');
      expect(mockOpenAIResponsesCreate).toHaveBeenCalledWith(expect.objectContaining({
        model: expect.any(String),
        input: expect.any(String),
      }));
    });

    test('should handle errors during insight generation', async () => {
      // Arrange
      const repositoryAnalysis = {
        repository: { name: 'owner/repo', language: 'JavaScript', lastUpdated: new Date().toISOString() },
        doraIndicators: { deployment_frequency: [] },
        patterns: {
          commits: { totalCommits: 0, commitTypes: { fixes: 0, features: 0, deployments: 0 } },
          pullRequests: { averageTimeToMerge: 0, merged: 0, open: 0, closed: 0, totalPRs: 0 },
          releases: { totalReleases: 0, recentReleases: [], releaseFrequency: 'unknown', versioningPattern: 'unknown' },
        },
      };
      mockOpenAIResponsesCreate.mockRejectedValue(new Error('Fetch Error'));

      // Act & Assert
      await expect(generateDORAInsights(repositoryAnalysis, {})).rejects.toThrow('DORA analysis failed: Fetch Error');
    });
  });

  describe('performDORAAnalysis', () => {
    test('should perform a full DORA analysis', async () => {
      // Arrange
      const owner = 'owner';
      const repo = 'repo';
      const metrics = {};
      fetch.mockResolvedValueOnce({ json: () => Promise.resolve({ response: 'Test insights' }) });

      // Act
      const result = await performDORAAnalysis(owner, repo, metrics);

      // Assert
      expect(result.insights).toBe('Test insights');
      expect(result.repositoryAnalysis.repository.name).toBe('owner/repo');
    });

    test('should handle errors during the full analysis', async () => {
      // Arrange
      mockOctokit.rest.repos.get.mockRejectedValue(new Error('API Error'));

      // Act & Assert
      await expect(performDORAAnalysis('owner', 'repo', {})).rejects.toThrow('Repository analysis failed: API Error');
    });
  });
});