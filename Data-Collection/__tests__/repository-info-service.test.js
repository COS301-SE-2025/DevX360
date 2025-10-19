// repository-info-service.test.js

/**
 * Jest Test Suite for repository-info-service.js
 * ----------------------------------------------
 * This file mocks all external dependencies (Octokit + tokenManager)
 * to ensure the tests run in isolation and do not require real GitHub tokens.
 */

import { jest } from '@jest/globals'

// ✅ Mock the token manager to avoid real token usage
jest.unstable_mockModule('../services/tokenManager.js', () => ({
  getOctokit: jest.fn(() => ({
    rest: {
      repos: {
        get: jest.fn().mockResolvedValue({ data: {} }),
        listLanguages: jest.fn().mockResolvedValue({ data: {} }),
        listCommits: jest.fn().mockResolvedValue({ data: [] }),
        listContributors: jest.fn().mockResolvedValue({ data: [] }),
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

// ✅ Mock the Octokit dependency to isolate from real GitHub API
jest.unstable_mockModule('octokit', () => ({
  Octokit: jest.fn(() => ({
    rest: {
      repos: {
        get: jest.fn().mockResolvedValue({ data: {} }),
        listLanguages: jest.fn().mockResolvedValue({ data: {} }),
        listCommits: jest.fn().mockResolvedValue({ data: [] }),
        listContributors: jest.fn().mockResolvedValue({ data: [] }),
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

// ✅ Import the module under test *after* mocks are applied
const {
  getRepositoryInfo,
  parseGitHubUrl,
  fetchTopContributors,
  validateRepositoryInfo,
  createMockRepositoryResponse,
} = await import('../repository-info-service.js');

// ---------------------------------------------------------------------------
// TEST SUITE
// ---------------------------------------------------------------------------

describe('Repository Info Service', () => {

  // -----------------------------------------------------------------------
  // URL Parsing
  // -----------------------------------------------------------------------
  test('parseGitHubUrl correctly parses valid GitHub URLs', () => {
    const url = 'https://github.com/user/repo';
    const result = parseGitHubUrl(url);
    expect(result).toEqual({ owner: 'user', repo: 'repo' });
  });

  test('parseGitHubUrl returns null for invalid URLs', () => {
    const badUrl = 'https://example.com/not-github';
    expect(parseGitHubUrl(badUrl)).toBeNull();
  });

  // -----------------------------------------------------------------------
  // Repository Info Retrieval
  // -----------------------------------------------------------------------
  test('getRepositoryInfo fetches and validates data successfully', async () => {
    const url = 'https://github.com/example/repo';
    const data = await getRepositoryInfo(url);

    expect(data).toBeDefined();
    expect(typeof data).toBe('object');
  });

  // -----------------------------------------------------------------------
  // Top Contributors
  // -----------------------------------------------------------------------
  test('fetchTopContributors returns expected format', async () => {
    const contributors = await fetchTopContributors('example', 'repo');
    expect(contributors).toBeInstanceOf(Array);
  });

  // -----------------------------------------------------------------------
  // Validation
  // -----------------------------------------------------------------------
  test('validateRepositoryInfo returns true for valid repository data', () => {
    const mockRepo = { name: 'repo', owner: 'example', stargazers_count: 10 };
    expect(validateRepositoryInfo(mockRepo)).toBe(true);
  });

  test('validateRepositoryInfo returns false for invalid data', () => {
    const mockRepo = { name: '', owner: null };
    expect(validateRepositoryInfo(mockRepo)).toBe(false);
  });

  // -----------------------------------------------------------------------
  // Mock Data Creation
  // -----------------------------------------------------------------------
  test('createMockRepositoryResponse generates valid structure', () => {
    const mock = createMockRepositoryResponse();
    expect(mock).toHaveProperty('owner');
    expect(mock).toHaveProperty('repo');
  });
});
