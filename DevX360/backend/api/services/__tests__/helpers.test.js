/* @jest-environment node */
import { jest } from '@jest/globals';
import { calculateTrend, generateInsights } from '../../mcp/helpers.js';

describe('mcp helpers', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-08-30T00:00:00Z'));
  });

  afterAll(() => jest.useRealTimers());

  test('calculateTrend: insufficient', () => {
    expect(calculateTrend([])).toBe('Insufficient data');
    expect(calculateTrend([1])).toBe('Insufficient data');
  });

  test('calculateTrend: increasing/decreasing/stable', () => {
    expect(calculateTrend([1,1,1, 3,3,3])).toMatch(/Increasing|📈/);
    expect(calculateTrend([3,3,3, 1,1,1])).toMatch(/Decreasing|📉/);
    expect(calculateTrend([2,2,2, 2,2,2])).toMatch(/Stable|➡️/);
  });

  test('generateInsights: thresholds', () => {
    const mk = (dfTotal, leadAvg, mttrAvg, failRate='0.10') => ({
      deployment_frequency: { total_deployments: dfTotal },
      lead_time: { average_days: leadAvg, total_prs_analyzed: 10 },
      mttr: { average_days: mttrAvg, total_incidents_analyzed: 5 },
      change_failure_rate: { failure_rate: String(failRate), confidence: 'high', total_deployments: dfTotal, deployment_failures: 0 },
    });
    const repoInfo = {};

    expect(generateInsights(mk(0, 5, 2), repoInfo)).toContain('No deployments');
    expect(generateInsights(mk(3, 5, 2), repoInfo)).toContain('Low deployment frequency');
    expect(generateInsights(mk(6, 5, 2), repoInfo)).toContain('Good deployment frequency');

    expect(generateInsights(mk(6, 8, 2), repoInfo)).toContain('High lead time');
    expect(generateInsights(mk(6, 1.5, 2), repoInfo)).toContain('Excellent lead time');

    expect(generateInsights(mk(6, 5, 5), repoInfo)).toContain('Slow recovery time');
    expect(generateInsights(mk(6, 5, 1), repoInfo)).toContain('Good recovery time');

    expect(generateInsights(mk(6, 5, 1, '0.20'), repoInfo)).toContain('High failure rate');
    expect(generateInsights(mk(6, 5, 1, '0.03'), repoInfo)).toContain('Excellent reliability');
  });
});
