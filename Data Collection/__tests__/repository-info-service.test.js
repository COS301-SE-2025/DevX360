
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

const mockGet = jest.fn();
const mockListLanguages = jest.fn();
const mockListContributors = jest.fn();

jest.unstable_mockModule('octokit', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        get: mockGet,
        listLanguages: mockListLanguages,
        listContributors: mockListContributors,
      },
    },
  })),
}));

const { getRepositoryInfo, parseGitHubUrl, fetchTopContributors, validateRepositoryInfo, createMockRepositoryResponse } = await import('../repository-info-service.js');

describe('RepositoryInfoService', () => {

  beforeEach(() => {
    mockGet.mockClear();
    mockListLanguages.mockClear();
    mockListContributors.mockClear();
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

    test('should throw an error for malformed URLs', () => {
      const url = 'https://github.com/owner';
      expect(() => parseGitHubUrl(url)).toThrow('Invalid GitHub URL: must contain owner and repository name');
    });
  });

  describe('fetchTopContributors', () => {
    test('should fetch and process top contributors', async () => {
      const contributorsData = [{ login: 'user1', contributions: 100 }];
      mockListContributors.mockResolvedValue({ data: contributorsData });

      const result = await fetchTopContributors('owner', 'repo', 1);

      expect(result.contributors[0].username).toBe('user1');
      expect(result.contributors[0].contributions).toBe(100);
      expect(mockListContributors).toHaveBeenCalledWith({ owner: 'owner', repo: 'repo', per_page: 1 });
    });

    test('should handle API errors gracefully', async () => {
      mockListContributors.mockRejectedValue(new Error('API Error'));

      const result = await fetchTopContributors('owner', 'repo');

      expect(result.contributors).toEqual([]);
      expect(result.accuracy_metrics.confidence_score).toBe(0);
    });
  });

  describe('getRepositoryInfo', () => {
    test('should fetch and process repository information', async () => {
      const repoData = { name: 'repo', stargazers_count: 10, forks_count: 5, watchers_count: 10, open_issues_count: 2, size: 1024, license: { name: 'MIT' } };
      const languagesData = { JavaScript: 1000 };
      const contributorsData = [{ login: 'user1', contributions: 100 }];

      mockGet.mockResolvedValue({ data: repoData });
      mockListLanguages.mockResolvedValue({ data: languagesData });
      mockListContributors.mockResolvedValue({ data: contributorsData });

      const result = await getRepositoryInfo('https://github.com/owner/repo');

      expect(result.name).toBe('repo');
      expect(result.stars).toBe(10);
      expect(result.primary_language).toBe('JavaScript');
      expect(result.contributors[0].username).toBe('user1');
    });

    test('should handle repository not found error', async () => {
      mockGet.mockRejectedValue({ status: 404 });

      await expect(getRepositoryInfo('https://github.com/owner/repo')).rejects.toThrow('Repository not found: https://github.com/owner/repo');
    });
  });

  describe('validateRepositoryInfo', () => {
    test('should return true for valid repository info', () => {
      const repoInfo = {
        name: 'repo',
        full_name: 'owner/repo',
        contributors: [],
        total_contributors: 0,
      };
      expect(validateRepositoryInfo(repoInfo)).toBe(true);
    });

    test('should return false for invalid repository info', () => {
      const repoInfo = { name: 'repo' };
      expect(validateRepositoryInfo(repoInfo)).toBe(false);
    });
  });

  describe('createMockRepositoryResponse', () => {
    test('should return a mock repository response', () => {
      const mockResponse = createMockRepositoryResponse();
      expect(mockResponse.name).toBe('test-repository');
      expect(mockResponse.total_contributors).toBe(3);
    });
  });
});
