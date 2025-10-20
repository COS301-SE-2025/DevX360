// Data-Collection/__tests__/get-dora-metrics.integration.test.js

// Mock Octokit
jest.unstable_mockModule('octokit', () => ({
  Octokit: class {
    constructor() {}
    rest = {
      repos: {
        get: jest.fn(async () => ({ data: { name: 'mock-repo', owner: { login: 'mock-owner' } } })),
        listCommits: jest.fn(async () => ({ data: [] })),
      },
      pulls: {
        list: jest.fn(async () => ({ data: [] })),
      },
      users: {
        getAuthenticated: jest.fn(async () => ({ data: { login: 'mock-user', id: 123 } })),
      },
    };
  },
}));

// Mock getOctokit
jest.unstable_mockModule('../services/tokenManager.js', () => ({
  getOctokit: jest.fn(async () => ({
    octokit: new (await import('octokit')).Octokit(),
    tokenType: 'system',
    needsReauth: false,
    canAccessPrivate: true,
  })),
}));

const { getDORAMetrics } = await import('../universal-dora-service.js');

describe('Integration: getDORAMetrics', () => {
  test('returns all DORA metrics', async () => {
    const metrics = await getDORAMetrics('owner', 'repo');
    expect(metrics).toHaveProperty('deploymentFrequency');
    expect(metrics).toHaveProperty('leadTimeForChanges');
    expect(metrics).toHaveProperty('changeFailureRate');
    expect(metrics).toHaveProperty('meanTimeToRecovery');
  });
});
