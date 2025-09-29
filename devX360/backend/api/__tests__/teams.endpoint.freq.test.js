/* @jest-environment node */
import { jest } from '@jest/globals';
import request from 'supertest';

// Mock RepoMetrics and authorize middleware BEFORE importing app
jest.unstable_mockModule('../../api/models/RepoMetrics.js', () => ({
  default: { findOne: jest.fn() }
}));

jest.unstable_mockModule('../../api/middlewares/authorizeTeamAccess.js', () => ({
  authorizeTeamAccess: async (req, res, next) => {
    // Provide a team object with a populate method to satisfy app.js logic
    req.team = {
      _id: 't1',
      name: req.params.name,
      members: [{ _id: 'u1', name: 'User One', email: 'u1@example.com' }],
      creator: 'u1',
      populate: async function () { return this; }
    };
    req.user = { userId: 'u2', role: 'user', teamRole: 'member' };
    next();
  }
}));

const { default: mockedApp } = await import('../../api/app.js');
const { default: RepoMetrics } = await import('../../api/models/RepoMetrics.js');

import jwt from 'jsonwebtoken';
jest.spyOn(jwt, 'verify').mockImplementation((token, secret, cb) => cb(null, { userId: 'u2', role: 'user' }));

describe('GET /api/teams/:name (deployment_frequency frequencies present)', () => {
  beforeEach(() => {
    // Set RepoMetrics.findOne mock
    RepoMetrics.findOne.mockResolvedValue({
      metrics: {
        deployment_frequency: {
          total_deployments: 3,
          analysis_period_days: 30,
          perDay: [0, 1, 0],
          perWeek: [1, 1, 1],
          perMonth: [3],
          months: ['2025-08'],
          frequency_per_day: '0.100',
          frequency_per_week: '1.000',
          frequency_per_month: '3.000'
        }
      },
      repositoryInfo: { url: 'https://github.com/owner/repo' },
      lastUpdated: new Date().toISOString(),
      memberStats: new Map(),
    });
  });

  test('returns deployment_frequency with frequency_per_* and arrays', async () => {
    const res = await request(mockedApp)
      .get('/api/teams/test-team')
      .set('Cookie', 'token=faketoken')
      .expect(200);

    expect(res.body.doraMetrics).toBeTruthy();
    const df = res.body.doraMetrics.deployment_frequency;
    expect(df).toBeTruthy();
    expect(df.frequency_per_day).toBeDefined();
    expect(df.frequency_per_week).toBeDefined();
    expect(df.frequency_per_month).toBeDefined();
    expect(Array.isArray(df.perDay)).toBe(true);
    expect(Array.isArray(df.perWeek)).toBe(true);
    expect(Array.isArray(df.perMonth)).toBe(true);
    expect(Array.isArray(df.months)).toBe(true);
  });

  test('RBAC: unauthorized rejected quickly', async () => {
    // Override jwt verify to fail
    jwt.verify.mockImplementationOnce((t, s, cb) => cb(new Error('bad')));
    await request(mockedApp)
      .get('/api/teams/test-team')
      .set('Cookie', 'token=x')
      .expect(403);
  });
});
