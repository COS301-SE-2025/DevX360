// Data-Collection/__tests__/get-dora-metrics.integration.test.js
import { getDORAMetrics } from '../universal-dora-service.js';
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

describe('Integration: getDORAMetrics', () => {
  test('returns all DORA metrics', async () => {
    const metrics = await getDORAMetrics('owner', 'repo');
    expect(metrics).toHaveProperty('deploymentFrequency');
    expect(metrics).toHaveProperty('leadTimeForChanges');
    expect(metrics).toHaveProperty('changeFailureRate');
    expect(metrics).toHaveProperty('meanTimeToRecovery');
  });
});
