// Data-Collection/__tests__/deployment-frequency.test.js
import { calculateDeploymentFrequency } from '../deployment-frequency.js';
import { getOctokit } from '../services/tokenManager.js';
import { Octokit } from 'octokit';

// Mock Octokit class
jest.mock('octokit', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
    rest: {
      repos: {
        get: jest.fn(async () => ({ data: {} })),
        listCommits: jest.fn(async () => ({ data: [] })),
      },
      pulls: { list: jest.fn(async () => ({ data: [] })) },
      users: { getAuthenticated: jest.fn(async () => ({ data: { login: 'mock-user', id: 123 } })) },
    },
  })),
}));

// Mock getOctokit to always return a mocked Octokit instance
jest.mock('../services/tokenManager.js', () => ({
  getOctokit: jest.fn(async () => ({
    octokit: new Octokit(),
    tokenType: 'system',
    needsReauth: false,
    canAccessPrivate: true,
  })),
}));

describe('calculateDeploymentFrequency()', () => {
  test('a) no deployments → arrays and zero frequencies', () => {
    const deployments = [];
    const result = calculateDeploymentFrequency(deployments, 30);
    expect(result.frequencyArray.every(f => f === 0)).toBe(true);
    expect(result.totalFrequency).toBe(0);
  });

  test('b) single deployment (daysBack=30) → series and scalar frequencies', () => {
    const now = new Date();
    const deployments = [{ date: now }];
    const result = calculateDeploymentFrequency(deployments, 30);
    expect(result.totalFrequency).toBeCloseTo(1/30);
  });

  test('c) multiple deployments across weeks & months', () => {
    const now = new Date();
    const deployments = [
      { date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) },
      { date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000) },
      { date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000) },
    ];
    const result = calculateDeploymentFrequency(deployments, 30);
    expect(result.totalFrequency).toBeCloseTo(3/30);
  });

  test('d) edge daysBack (1, 7, 30) and guard against division by 0', () => {
    const now = new Date();
    const deployments = [{ date: now }];
    [1, 7, 30].forEach(days => {
      const result = calculateDeploymentFrequency(deployments, days);
      expect(result.totalFrequency).toBeCloseTo(1/days);
    });
  });
});
