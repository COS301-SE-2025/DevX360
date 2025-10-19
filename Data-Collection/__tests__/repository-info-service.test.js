import { jest, describe, beforeEach, test, expect } from '@jest/globals';

// Mock Octokit and tokenManager
const mockGet = jest.fn();
const mockListLanguages = jest.fn();
const mockListCommits = jest.fn();
const mockListContributors = jest.fn();
const mockListForRepo = jest.fn();
const mockPullsList = jest.fn();
const mockGetOctokit = jest.fn();

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

jest.unstable_mockModule('../services/tokenManager.js', () => ({
  getOctokit: mockGetOctokit,
}));

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
    mockListCommits.mockClear();
    mockListContributors.mockClear();
    mockListForRepo.mockClear();
    mockPullsList.mockClear();
    mockGetOctokit.mockClear();

    // Always return a mock Octokit instance
    mockGetOctokit.mockReturnValue({
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
    });
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
    test('should fetch top contributors', async () => {
      mockListContributors.mockResolvedValue({ data: [{ login: 'user1', contributions: 42 }] });

      const result = await fetchTopContributors('owner', 'repo', 1);
      expect(result.contributors[0].username).toBe('user1');
      expect(result.contributors[0].contributions).toBe(42);
    });

    test('should handle API errors gracefully', async () => {
      mockListContributors.mockRejectedValue(new Error('API Error'));

      const result = await fetchTopContributors('owner', 'repo');
      expect(result.contributors).toEqual([]);
      expect(result.accuracy_metrics.confidence_score).toBe(0);
    });
  });

  describe('getRepositoryInfo', () => {
    test('should fetch repository info', async () => {
      const repoData = {
        name: 'repo',
        full_name: 'owner/repo',
        stargazers_count: 5,
        forks_count: 2,
        watchers_count: 5,
        open_issues_count: 1,
        size: 100,
        license: { name: 'MIT' },
        html_url: 'https://github.com/owner/repo',
        clone_url: 'https://github.com/owner/repo.git',
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2023-01-01T00:00:00Z',
        pushed_at: '2023-01-01T00:00:00Z',
        default_branch: 'main',
        private: false,
        fork: false,
        archived: false,
        disabled: false,
        topics: [],
      };
      mockGet.mockResolvedValue({ data: repoData });
      mockListLanguages.mockResolvedValue({ data: { JavaScript: 1000 } });
      mockListCommits.mockResolvedValue({ data: [] });
      mockListContributors.mockResolvedValue({ data: [{ login: 'user1', contributions: 10 }] });
      mockListForRepo.mockResolvedValue({ data: [{ id: 1, pull_request: null }] });
      mockPullsList.mockResolvedValue({ data: [{ id: 1 }] });

      const result = await getRepositoryInfo('https://github.com/owner/repo');
      expect(result.name).toBe('repo');
      expect(result.primary_language).toBe('JavaScript');
      expect(result.contributors[0].username).toBe('user1');
    });

    test('should handle repository not found', async () => {
      mockGet.mockRejectedValue({ status: 404 });
      await expect(getRepositoryInfo('https://github.com/owner/repo')).rejects.toThrow();
    });
  });

  describe('validateRepositoryInfo', () => {
    test('should validate correct info', () => {
      expect(validateRepositoryInfo({ name: 'repo', full_name: 'owner/repo', contributors: [], total_contributors: 0 })).toBe(true);
      expect(validateRepositoryInfo({ name: 'repo' })).toBe(false);
    });
  });

  describe('createMockRepositoryResponse', () => {
    test('should create mock response', () => {
      const mockResponse = createMockRepositoryResponse();
      expect(mockResponse.name).toBe('test-repository');
      expect(mockResponse.total_contributors).toBe(3);
    });
  });
});
