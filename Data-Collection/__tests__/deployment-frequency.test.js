/* @jest-environment node */
import { jest } from '@jest/globals';
import fs from 'fs';
import path from 'path';

// Helper: dynamically extract and import specific functions from source as ESM
async function importModifiedModule(filePath, namesToExport) {
  let src = fs.readFileSync(filePath, 'utf8');
  // Strip the getNextOctokit import to avoid resolution
  src = src.replace(/import\s+\{\s*getNextOctokit\s*\}[^;]+;?/g, '');
  // Strip github-utils import (parseGitHubUrl) since not needed for these unit tests
  src = src.replace(/import\s+\{[^}]*\}\s+from\s+['"]\.\/github-utils\.js['"];?/g, '');
  // If the module re-exports parseGitHubUrl, drop it from the export list to avoid undefined export
  src = src.replace(/export\s*\{([\s\S]*?)\};/g, (m, inner) => {
    const cleaned = inner
      .split(',')
      .map(s => s.trim())
      .filter(name => name !== 'parseGitHubUrl')
      .join(', ');
    return `export { ${cleaned} };`;
  });
  for (const name of namesToExport) {
    src = src.replace(new RegExp(`\\bfunction\\s+${name}\\s*\\(`), `export function ${name}(`);
  }
  const dataUrl = `data:text/javascript;base64,${Buffer.from(src, 'utf8').toString('base64')}`;
  return import(dataUrl);
}

const FILE = path.resolve(process.cwd(), 'Data-Collection/universal-dora-service.js');

beforeAll(() => {
  jest.useFakeTimers();
  // Freeze time to a fixed point for determinism
  jest.setSystemTime(new Date('2025-08-30T00:00:00Z'));
});

afterAll(() => {
  jest.useRealTimers();
});

function makeRelease(ts) {
  return { draft: false, prerelease: false, created_at: ts, tag_name: 'v1.0.0', name: 'release' };
}

function makeCommit(ts, message='deploy: something') {
  return { sha: 'abc123', commit: { author: { date: ts }, message } };
}

describe('calculateDeploymentFrequency()', () => {
  let calculateDeploymentFrequency;
  beforeAll(async () => {
    const mod = await importModifiedModule(FILE, ['detectDeployments','calculateDeploymentFrequency']);
    calculateDeploymentFrequency = mod.calculateDeploymentFrequency;
  });

  test('a) no deployments → arrays and zero frequencies', () => {
    const daysBack = 30;
    const res = calculateDeploymentFrequency([], [], daysBack, []);
    expect(res.analysis_period_days).toBe(daysBack);
    expect(res.perDay).toHaveLength(daysBack);
    expect(res.perWeek).toHaveLength(Math.ceil(daysBack/7));
    // months between 2025-08-01 and 2025-08-30 is 1 month (Aug)
    expect(res.perMonth.length).toBe(res.months.length);
    expect(res.total_deployments).toBe(0);
    expect(res.frequency_per_day).toBe('0.000');
    expect(res.frequency_per_week).toBe('0.000');
    expect(res.frequency_per_month).toBe('0.000');
  });

  test('b) single deployment (daysBack=30) → series and scalar frequencies', () => {
    const daysBack = 30;
    // Put a deploy at 2025-08-15Z
    const commitTs = '2025-08-15T12:00:00Z';
    const res = calculateDeploymentFrequency([], [], daysBack, [makeCommit(commitTs)]);
    expect(res.total_deployments).toBe(1);
    // Verify perDay has exactly one 1
    const ones = res.perDay.filter(v => v === 1).length;
    expect(ones).toBe(1);
    expect(res.perDay.reduce((a,b)=>a+b,0)).toBe(1);
    // perWeek sums should equal total
    expect(res.perWeek.reduce((a,b)=>a+b,0)).toBe(1);
    // perMonth sums should equal total
    expect(res.perMonth.reduce((a,b)=>a+b,0)).toBe(1);
    // Scalars
    expect(res.frequency_per_day).toBe((1/daysBack).toFixed(3));
    expect(res.frequency_per_week).toBe((1/Math.ceil(daysBack/7)).toFixed(3));
    expect(res.frequency_per_month).toBe((1/res.perMonth.length).toFixed(3));
  });

  test('c) multiple deployments across weeks & months', () => {
    // Freeze time is Aug 30, 2025; 30-day window covers Aug only
    const daysBack = 30;
    const commits = [
      makeCommit('2025-08-02T00:00:00Z'),
      makeCommit('2025-08-10T00:00:00Z'),
      makeCommit('2025-08-21T00:00:00Z')
    ];
    const res = calculateDeploymentFrequency([], [], daysBack, commits);
    expect(res.total_deployments).toBe(3);
    expect(res.perDay.reduce((a,b)=>a+b,0)).toBe(3);
    expect(res.perWeek.reduce((a,b)=>a+b,0)).toBe(3);
    expect(res.perMonth.reduce((a,b)=>a+b,0)).toBe(3);
    expect(res.frequency_per_day).toBe((3/daysBack).toFixed(3));
    expect(res.frequency_per_week).toBe((3/Math.ceil(daysBack/7)).toFixed(3));
    expect(res.frequency_per_month).toBe((3/res.perMonth.length).toFixed(3));
  });

  test('d) edge daysBack (1, 7, 30) and guard against division by 0', () => {
    for (const daysBack of [1,7,30]) {
      const res = calculateDeploymentFrequency([], [], daysBack, []);
      expect(res.perDay).toHaveLength(daysBack);
      expect(res.perWeek).toHaveLength(Math.ceil(daysBack/7));
      expect(Number(res.frequency_per_day)).toBeCloseTo(0);
      expect(Number(res.frequency_per_week)).toBeCloseTo(0);
      expect(Number(res.frequency_per_month)).toBeCloseTo(0);
    }
  });
});
