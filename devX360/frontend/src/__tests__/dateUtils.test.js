import { formatDate } from '../utils/dateUtils';

describe('formatDate', () => {
  test('returns N/A for falsy input', () => {
    expect(formatDate('')).toBe('N/A');
    expect(formatDate(null)).toBe('N/A');
    expect(formatDate(undefined)).toBe('N/A');
  });

  test('returns N/A for invalid date', () => {
    expect(formatDate('not-a-date')).toBe('N/A');
  });

  test('formats valid ISO date', () => {
    // Use a fixed iso to avoid TZ issues; just assert not N/A
    const out = formatDate('2025-08-15T12:00:00Z');
    expect(out).not.toBe('N/A');
    expect(typeof out).toBe('string');
  });
});


