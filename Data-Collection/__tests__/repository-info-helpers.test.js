import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// Mock tokenManager BEFORE importing the module under test
const mockGetOctokit = jest.fn(() => ({
  rest: {
    repos: {
      get: jest.fn().mockResolvedValue({ data: {} }),
      listCommits: jest.fn().mockResolvedValue({ data: [] }),
      listContributors: jest.fn().mockResolvedValue({ data: [] }),
      listLanguages: jest.fn().mockResolvedValue({ data: {} }),
    },
    issues: {
      listForRepo: jest.fn().mockResolvedValue({ data: [] }),
    },
    pulls: {
      list: jest.fn().mockResolvedValue({ data: [] }),
    },
  },
}));

jest.unstable_mockModule('../services/tokenManager.js', () => ({
  getOctokit: mockGetOctokit,
}));

// Import the module under test after mocking
const {
  collectMemberActivity,
  extractOwnerAndRepo,
} = await import('../repository-info-service.js');

describe('Repository Info Helpers', () => {
  beforeEach(() => {
    mockGetOctokit.mockClear();
  });

  describe('extractOwnerAndRepo', () => {
    test('parses standard URL', () => {
      const [owner, repo] = extractOwnerAndRepo('https://github.com/owner/repo');
      expect(owner).toBe('owner');
      expect(repo).toBe('repo');
    });

    test('removes .git suffix', () => {
      const [owner, repo] = extractOwnerAndRepo('https://github.com/owner/repo.git');
      expect(owner).toBe('owner');
      expect(repo).toBe('repo');
    });
  });

  describe('collectMemberActivity', () => {
    test('returns aggregated activity stats', async () => {
      const stats = await collectMemberActivity('owner', 'repo', 'jane');
      expect(stats).toHaveProperty('commits');
      expect(stats).toHaveProperty('pullRequests');
      expect(stats).toHaveProperty('issues');
      expect(stats).toHaveProperty('activityScore');
    });

    test('handles errors gracefully', async () => {
      // Make getOctokit throw
      mockGetOctokit.mockImplementationOnce(() => {
        throw new Error('boom');
      });
      const stats = await collectMemberActivity('owner', 'repo', 'jane');
      expect(stats).toHaveProperty('error', 'boom');
    });
  });
});
