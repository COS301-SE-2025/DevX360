import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

const mockListCommits = jest.fn();
const mockPullsList = jest.fn();
const mockListForRepo = jest.fn();

// Mock Octokit ESM module before importing the SUT
jest.unstable_mockModule('octokit', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        listCommits: mockListCommits,
      },
      pulls: {
        list: mockPullsList,
      },
      issues: {
        listForRepo: mockListForRepo,
      },
    },
  })),
}));

const { extractOwnerAndRepo, collectMemberActivity } = await import('../repository-info-service.js');

describe('repository-info-service helpers', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-08-30T12:00:00Z'));

    mockListCommits.mockReset();
    mockPullsList.mockReset();
    mockListForRepo.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('extractOwnerAndRepo', () => {
    test('returns [owner, repo] for standard URL', () => {
      const [owner, repo] = extractOwnerAndRepo('https://github.com/owner/repo');
      expect(owner).toBe('owner');
      expect(repo).toBe('repo');
    });

    test('strips .git suffix', () => {
      const [owner, repo] = extractOwnerAndRepo('https://github.com/owner/repo.git');
      expect(owner).toBe('owner');
      expect(repo).toBe('repo');
    });
  });

  describe('collectMemberActivity', () => {
    test('aggregates commits, PRs, and issues with recent window', async () => {
      // Arrange: commits (most recent first as function reads commits[0])
      mockListCommits.mockResolvedValue({
        data: [
          // Inside 30-day window relative to frozen time (Aug 30)
          { commit: { author: { date: '2025-08-25T10:00:00Z' } } },
          // Outside 30-day window
          { commit: { author: { date: '2025-06-01T10:00:00Z' } } },
        ],
      });

      // PRs: 3 total => merged 1, open 1, closed 1
      mockPullsList.mockResolvedValue({
        data: [
          { state: 'closed', merged_at: '2025-08-10T00:00:00Z', user: { login: 'jane' } },
          { state: 'open', merged_at: null, user: { login: 'jane' } },
          { state: 'closed', merged_at: null, user: { login: 'jane' } },
          // A PR by someone else, should be filtered out by author check
          { state: 'open', merged_at: null, user: { login: 'other' } },
        ],
      });

      // Issues: exclude PR-shaped items via pull_request flag
      mockListForRepo.mockResolvedValue({
        data: [
          { id: 1, state: 'open', user: { login: 'jane' } },
          { id: 2, state: 'closed', user: { login: 'jane' } },
          { id: 3, state: 'open', user: { login: 'other' } },
          { id: 4, state: 'closed', user: { login: 'jane' }, pull_request: {} }, // excluded
        ],
      });

      // Act
      const stats = await collectMemberActivity('owner', 'repo', 'jane');

      // Assert commits
      expect(stats.commits.total).toBe(2);
      expect(stats.commits.recent).toBe(1);
      expect(stats.lastActivity).toBe('2025-08-25T10:00:00Z');

      // Assert PRs (only PRs by jane counted)
      expect(stats.pullRequests.total).toBe(3);
      expect(stats.pullRequests.merged).toBe(1);
      expect(stats.pullRequests.open).toBe(1);
      expect(stats.pullRequests.closed).toBe(1);

      // Assert issues (only issues by jane, excluding PRs)
      expect(stats.issues.total).toBe(2);
      expect(stats.issues.open).toBe(1);
      expect(stats.issues.closed).toBe(1);

      // Activity score = commits*1 + prs*3 + issues*2 = 2*1 + 3*3 + 2*2 = 2 + 9 + 4 = 15
      expect(stats.activityScore).toBe(15);

      expect(typeof stats.collectedAt).toBe('string');
    });

    test('handles API error and returns safe defaults', async () => {
      mockListCommits.mockRejectedValue(new Error('boom'));

      const stats = await collectMemberActivity('owner', 'repo', 'jane');

      expect(stats.error).toBeDefined();
      expect(stats.commits.total).toBe(0);
      expect(stats.pullRequests.total).toBe(0);
      expect(stats.issues.total).toBe(0);
      expect(stats.activityScore).toBe(0);
      expect(stats.lastActivity).toBeNull();
    });
  });
});
