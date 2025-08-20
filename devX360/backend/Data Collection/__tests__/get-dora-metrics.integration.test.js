/* @jest-environment node */
import { jest } from '@jest/globals';

// Mock tokenManager to provide a fake octokit with deterministic data
jest.unstable_mockModule('../../services/tokenManager.js', () => ({
  getNextOctokit: () => ({
    rest: {
      repos: {
        listReleases: async () => ({ data: [
          { draft:false, prerelease:false, created_at:'2025-08-10T00:00:00Z', tag_name:'v1.0.0', name:'r1' },
        ] }),
        listTags: async () => ({ data: [] }),
        listCommits: async () => ({ data: [
          { sha:'a', commit:{ author:{ date:'2025-08-05T00:00:00Z' }, message:'deploy: init' } },
          { sha:'b', commit:{ author:{ date:'2025-08-20T00:00:00Z' }, message:'deploy: hotfix' } },
        ] }),
        listForOrg: async () => ({ data: [] }),
      },
      pulls: { list: async () => ({ data: [] }) },
      issues: { listForRepo: async () => ({ data: [] }) },
    }
  })
}));

const { getDORAMetrics } = await import('../universal-dora-service.js');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2025-08-30T00:00:00Z'));
});

afterAll(() => jest.useRealTimers());

test('getDORAMetrics includes frequency_per_* scalars', async () => {
  const metrics = await getDORAMetrics('https://github.com/owner/repo');
  expect(metrics).toBeTruthy();
  const df = metrics.deployment_frequency;
  expect(df.frequency_per_day).toBeDefined();
  expect(df.frequency_per_week).toBeDefined();
  expect(df.frequency_per_month).toBeDefined();
  expect(Array.isArray(df.perWeek)).toBe(true);
});
