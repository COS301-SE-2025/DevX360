// Data-Collection/__tests__/universal-dora-service.test.js
import { getDORAMetrics, parseGitHubUrl } from '../universal-dora-service.js';
import { getOctokit } from '../services/tokenManager.js';
import { Octokit } from 'octokit';

jest.mock('octokit', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: { get: jest.fn(async () => ({ data: { name: 'mock-repo', owner: { login: 'mock-owner' } } })), listCommits: jest.fn(async () => ({ data: [] })) },
      pulls: { list: jest.fn(async () => ({ data: [] })) },
      users: { getAuthenticated: jest.fn(async () => ({ data: { login: 'mock-user', id: 123 } })) },
    },
  })),
}));

jest.mock('../services/tokenManager.js', () => ({
  getOctokit: jest.fn(async () => ({
    octokit: new (await import('octokit')).Octokit(),
    tokenType: 'system',
    needsReauth: false,
    canAccessPrivate: true,
  })),
}));

describe('parseGitHubUrl()', () => {
  test('valid URL', () => {
    const result = parseGitHubUrl('https://github.com/owner/repo.git');
    expect(result).toEqual({ owner: 'owner', repo: 'repo' });
  });

  test('invalid host', () => {
    const result = parseGitHubUrl('https://gitlab.com/owner/repo.git');
    expect(result).toBeNull();
  });

  test('missing parts', () => {
    const result = parseGitHubUrl('https://github.com/owner');
    expect(result).toBeNull();
  });

  test('.git suffix removed', () => {
    const result = parseGitHubUrl('https://github.com/owner/repo.git');
    expect(result.repo).toBe('repo');
  });
});

describe('getDORAMetrics()', () => {
  test('returns metrics object without crashing', async () => {
    const metrics = await getDORAMetrics('owner', 'repo');
    expect(metrics).toHaveProperty('deploymentFrequency');
    expect(metrics).toHaveProperty('leadTimeForChanges');
    expect(metrics).toHaveProperty('changeFailureRate');
    expect(metrics).toHaveProperty('meanTimeToRecovery');
  });
});
