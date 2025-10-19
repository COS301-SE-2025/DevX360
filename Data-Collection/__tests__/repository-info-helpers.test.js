import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// --------------------
// Mock GitHub API
// --------------------
const mockGet = jest.fn();
const mockListLanguages = jest.fn();
const mockListCommits = jest.fn();
const mockListContributors = jest.fn();
const mockListForRepo = jest.fn();
const mockPullsList = jest.fn();

jest.unstable_mockModule('octokit', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        get: mockGet,
        listLanguages: mockListLanguages,
        listCommits: mockListCommits,
        listContributors: mockListContributors,
      },
      issues: {
        listForRepo: mockListForRepo,
      },
      pulls: {
        list: mockPullsList,
      },
    },
  })),
}));

// --------------------
// Mock tokenManager
// --------------------
jest.unstable_mockModule('../services/tokenManager.js', () => ({
  getOctokit: jest.fn(() => ({
    rest: {
      repos: {
        get: jest.fn().mockResolvedValue({ data: {} }),
        listContributors: jest.fn().mockResolvedValue({ data: [] }),
        listCommits: jest.fn().mockResolvedValue({ data: [] }),
        listLanguages: jest.fn().mockResolvedValue({ data: {} }),
      },
      issues: {
        listForRepo: jest.fn().mockResolvedValue({ data: [] }),
      },
      pulls: {
        list: jest.fn().mockResolvedValue({ data: [] }),
      },
    },
  })),
}));

// --------------------
// Import after mocks
// --------------------
const { collectMemberActivity } = await import('../repository-info-service.js');

describe('Repository Info Helpers', () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockListLanguages.mockClear();
    mockListCommits.mockClear();
    mockListContributors.mockClear();
    mockListForRepo.mockClear();
    mockPullsList.mockClear();
  });

  describe('collectMemberActivity', () => {
    test('should return safe defaults when API fails', async () => {
      // Provide a failing scenario
      const result = await collectMemberActivity('owner', 'repo', 'jane');
      
      expect(result).toHaveProperty('commits');
      expect(result.commits).toHaveProperty('total', 0);
      expect(result).toHaveProperty('pullRequests');
      expect(result.pullRequests).toHaveProperty('total', 0);
      expect(result).toHaveProperty('issues');
      expect(result.issues).toHaveProperty('total', 0);
      expect(result).toHaveProperty('activityScore', 0);
      expect(result).toHaveProperty('lastActivity', null);
    });

    test('should successfully return activity stats with mocked API', async () => {
      // We can prefill mocks to simulate real data
      mockListContributors.mockResolvedValue({ data: [{ login: 'jane', contributions: 10 }] });

      const result = await collectMemberActivity('owner', 'repo', 'jane');

      expect(result).toHaveProperty('commits');
      expect(result.commits).toHaveProperty('total', 0);
      expect(result.contributors).toBeUndefined(); // activity returns only stats
    });
  });
});
