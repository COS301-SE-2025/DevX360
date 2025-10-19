import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// Mock Octokit BEFORE importing the module under test
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

// Import the module under test after mocking
const {
  getRepositoryInfo,
  parseGitHubUrl,
  fetchTopContributors,
  validateRepositoryInfo,
  createMockRepositoryResponse,
} = await import('../repository-info-service.js');

describe('RepositoryInfoService', () => {
  beforeEach(() => {
    mockGet.mockClear();
    mockListLanguages.mockClear();
    mockListCommits.mockClear().mockResolvedValue({ data: [] });
    mockListContributors.mockClear();
    mockListForRepo.mockClear();
    mockPullsList.mockClear();
  });

  describe('parseGitHubUrl', () => {
    test('should parse a valid GitHub URL', () => {
      const { owner, repo } = parseGitHubUrl('https://github.com/owner/repo');
      expect(owner).toBe('owner');
      expect(repo).toBe('repo');
    });
    test('should handle URLs with .git extension', () => {
      const { owner, repo } = parseGitHubUrl('https://github.com/owner/repo.git');
      expect(owner).toBe('owner');
      expect(repo).toBe('repo');
    });
  });

  describe('fetchTopContributors', () => {
    test('fetches contributors', async () => {
      const contributorsData = [{ login: 'user1', contributions: 100 }];
      mockListContributors.mockResolvedValue({ data: contributorsData });

      const result = await fetchTopContributors('owner', 'repo', 1);
      expect(result.contributors[0].username).toBe('user1');
      expect(result.contributors[0].contributions).toBe(100);
    });
  });

  describe('getRepositoryInfo', () => {
    test('fetches repository info', async () => {
      const repoData = { name: 'repo', full_name: 'owner/repo', stargazers_count: 10, forks_count: 5, watchers_count: 10, open_issues_count: 2, size: 1024, license: { name: 'MIT' }, html_url: '', clone_url: '', created_at: '', updated_at: '', pushed_at: '', default_branch: 'main', private: false, fork: false, archived: false, disabled: false, topics: [] };
      const languagesData = { JavaScript: 1000 };
      const contributorsData = [{ login: 'user1', contributions: 100 }];
      const issuesData = [{ id: 1, pull_request: null }];
      const pullsData = [{ id: 1 }];

      mockGet.mockResolvedValue({ data: repoData });
      mockListLanguages.mockResolvedValue({ data: languagesData });
      mockListContributors.mockResolvedValue({ data: contributorsData });
      mockListForRepo.mockResolvedValue({ data: issuesData });
      mockPullsList.mockResolvedValue({ data: pullsData });

      const result = await getRepositoryInfo('https://github.com/owner/repo');
      expect(result.name).toBe('repo');
      expect(result.primary_language).toBe('JavaScript');
    });
  });

  describe('validateRepositoryInfo', () => {
    test('returns true for valid info', () => {
      expect(validateRepositoryInfo({ name: 'repo', full_name: 'owner/repo', contributors: [], total_contributors: 0 })).toBe(true);
    });
    test('returns false for invalid info', () => {
      expect(validateRepositoryInfo({ name: 'repo' })).toBe(false);
    });
  });

  describe('createMockRepositoryResponse', () => {
    test('returns mock response', () => {
      const mockResponse = createMockRepositoryResponse();
      expect(mockResponse.name).toBe('test-repository');
      expect(mockResponse.total_contributors).toBe(3);
    });
  });
});
