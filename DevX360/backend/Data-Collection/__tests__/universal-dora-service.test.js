
import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

const mockListReleases = jest.fn();
const mockListTags = jest.fn();
const mockListCommits = jest.fn();
const mockListPulls = jest.fn();
const mockListIssues = jest.fn();

jest.unstable_mockModule('../../services/tokenManager.js', () => ({
  getNextOctokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        listReleases: mockListReleases,
        listTags: mockListTags,
        listCommits: mockListCommits,
      },
      pulls: {
        list: mockListPulls,
      },
      issues: {
        listForRepo: mockListIssues,
      },
    },
  })),
}));

const { getDORAMetrics, parseGitHubUrl } = await import('../universal-dora-service.js');

// Helper to generate recent dates for testing
const getRecentDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

describe('UniversalDoraService', () => {

  beforeEach(() => {
    mockListReleases.mockClear();
    mockListTags.mockClear();
    mockListCommits.mockClear();
    mockListPulls.mockClear();
    mockListIssues.mockClear();
    // Suppress console output during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console output
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('parseGitHubUrl', () => {
    test('should parse a valid GitHub URL', () => {
      const url = 'https://github.com/owner/repo';
      const { owner, repo } = parseGitHubUrl(url);
      expect(owner).toBe('owner');
      expect(repo).toBe('repo');
    });

    test('should handle URLs with .git extension', () => {
      const url = 'https://github.com/owner/repo.git';
      const { owner, repo } = parseGitHubUrl(url);
      expect(owner).toBe('owner');
      expect(repo).toBe('repo');
    });

    test('should throw an error for invalid hostnames', () => {
      const url = 'https://gitlab.com/owner/repo';
      expect(() => parseGitHubUrl(url)).toThrow('Invalid GitHub URL: hostname must be github.com');
    });
  });

  describe('getDORAMetrics', () => {
    test('should fetch and calculate DORA metrics with no data', async () => {
      // Arrange: Mock API responses with empty data
      mockListReleases.mockResolvedValue({ data: [] });
      mockListTags.mockResolvedValue({ data: [] });
      mockListCommits.mockResolvedValue({ data: [] });
      mockListPulls.mockResolvedValue({ data: [] });
      mockListIssues.mockResolvedValue({ data: [] });

      // Act
      const result = await getDORAMetrics('https://github.com/owner/repo');

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveProperty('7d');
      expect(result).toHaveProperty('30d');
      expect(result).toHaveProperty('90d');
      expect(result['7d'].repository.name).toBe('repo');
      expect(result['7d'].deployment_frequency.total_deployments).toBe(0);
    });

    test('should handle API errors gracefully', async () => {
      // Arrange: Mock API error
      mockListReleases.mockRejectedValue(new Error('API Error'));

      // Act
      const result = await getDORAMetrics('https://github.com/owner/repo');

      // Assert - function returns null values for failed periods
      expect(result).toBeDefined();
      expect(result['7d']).toBeNull();
      expect(result['30d']).toBeNull();
      expect(result['90d']).toBeNull();
    });

    test('should calculate deployment frequency correctly', async () => {
      const releases = [
        { created_at: getRecentDate(5), draft: false, prerelease: false, tag_name: 'v1.0', name: 'Version 1.0' },
        { created_at: getRecentDate(15), draft: false, prerelease: false, tag_name: 'v1.1', name: 'Version 1.1' },
      ];
      mockListReleases.mockResolvedValue({ data: releases });
      mockListTags.mockResolvedValue({ data: [] });
      mockListCommits.mockResolvedValue({ data: [] });
      mockListPulls.mockResolvedValue({ data: [] });
      mockListIssues.mockResolvedValue({ data: [] });

      const result = await getDORAMetrics('https://github.com/owner/repo');

      expect(result['7d'].deployment_frequency.total_deployments).toBe(1); // Only 1 in 7 days
      expect(result['30d'].deployment_frequency.total_deployments).toBe(2); // Both in 30 days
    });

    test('should calculate lead time correctly', async () => {
      const pullRequests = [
        { created_at: getRecentDate(2), merged_at: getRecentDate(1) }, // 1 day lead time
        { created_at: getRecentDate(6), merged_at: getRecentDate(3) }, // 3 days lead time
      ];
      mockListReleases.mockResolvedValue({ data: [] });
      mockListTags.mockResolvedValue({ data: [] });
      mockListCommits.mockResolvedValue({ data: [] });
      mockListPulls.mockResolvedValue({ data: pullRequests });
      mockListIssues.mockResolvedValue({ data: [] });

      const result = await getDORAMetrics('https://github.com/owner/repo');

      expect(result['7d'].lead_time.average_days).toBe('2.00');
    });

    test('should calculate MTTR correctly', async () => {
      const issues = [
        { created_at: getRecentDate(3), closed_at: getRecentDate(1) }, // 2 days resolution
        { created_at: getRecentDate(7), closed_at: getRecentDate(5) }, // 2 days resolution
      ];
      mockListReleases.mockResolvedValue({ data: [] });
      mockListTags.mockResolvedValue({ data: [] });
      mockListCommits.mockResolvedValue({ data: [] });
      mockListPulls.mockResolvedValue({ data: [] });
      mockListIssues.mockResolvedValue({ data: issues });

      const result = await getDORAMetrics('https://github.com/owner/repo');

      expect(result['7d'].mttr.average_days).toBe('2.00');
    });

    test('should calculate change failure rate correctly', async () => {
      const releases = [{ created_at: getRecentDate(5), draft: false, prerelease: false, tag_name: 'v1.2', name: 'Version 1.2' }];
      const issues = [
        { created_at: getRecentDate(4), title: 'Bug in deployment', body: 'Fix this now', labels: [{ name: 'bug' }], comments: 0 },
      ];
      const commits = [
        { sha: 'abc1234', commit: { message: 'deploy to production', author: { date: getRecentDate(5) } } }
      ];
      mockListReleases.mockResolvedValue({ data: releases });
      mockListTags.mockResolvedValue({ data: [] });
      mockListCommits.mockResolvedValue({ data: commits });
      mockListPulls.mockResolvedValue({ data: [] });
      mockListIssues.mockResolvedValue({ data: issues });

      const result = await getDORAMetrics('https://github.com/owner/repo');

      expect(result['7d'].change_failure_rate.deployment_failures).toBeGreaterThan(0);
    });
  });
});
