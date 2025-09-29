<<<<<<< HEAD

import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import { concurrentMap } from '../utils/concurrentMap.js';

describe('concurrentMap', () => {
  let mockConsoleError;

  beforeEach(() => {
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });

  test('should process all items and return correct results', async () => {
    const items = [1, 2, 3, 4, 5];
    const concurrency = 2;
    const asyncMapper = jest.fn(async (item) => item * 2);

    const results = await concurrentMap(items, concurrency, asyncMapper);

    expect(asyncMapper).toHaveBeenCalledTimes(items.length);
    expect(results).toEqual([2, 4, 6, 8, 10]);
  });

  test('should respect the concurrency limit', async () => {
    const items = [1, 2, 3, 4, 5];
    const concurrency = 2;
    let activeCalls = 0;
    const maxActiveCalls = jest.fn();

    const asyncMapper = jest.fn(async (item) => {
      activeCalls++;
      maxActiveCalls(activeCalls);
      await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async work
      activeCalls--;
      return item * 2;
    });

    await concurrentMap(items, concurrency, asyncMapper);

    // Check that maxActiveCalls was never greater than concurrency
    maxActiveCalls.mock.calls.forEach(([calls]) => {
      expect(calls).toBeLessThanOrEqual(concurrency);
    });
  });

  test('should handle errors in asyncMapper without stopping other items', async () => {
    const items = [1, 2, 3, 4, 5];
    const concurrency = 2;
    const asyncMapper = jest.fn(async (item) => {
      if (item === 3) {
        throw new Error('Error for item 3');
      }
      return item * 2;
    });

    const results = await concurrentMap(items, concurrency, asyncMapper);

    expect(mockConsoleError).toHaveBeenCalledWith('Error processing item:', expect.any(Error));
    // Expect results for items that did not error, and the erroring item's result to be skipped
    expect(results).toEqual([2, 4, 8, 10]); // Order might vary due to concurrency
    expect(results).not.toContain(6); // Result for item 3 should be skipped
  });

  test('should return an empty array for empty items input', async () => {
    const items = [];
    const concurrency = 2;
    const asyncMapper = jest.fn();

    const results = await concurrentMap(items, concurrency, asyncMapper);

    expect(asyncMapper).not.toHaveBeenCalled();
    expect(results).toEqual([]);
  });

  test('should not include null results from asyncMapper', async () => {
    const items = [1, 2, 3];
    const concurrency = 1;
    const asyncMapper = jest.fn(async (item) => {
      if (item === 2) {
        return null;
      }
      return item * 10;
    });

    const results = await concurrentMap(items, concurrency, asyncMapper);

    expect(results).toEqual([10, 30]);
    expect(results).not.toContain(null);
  });
});
=======

import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';
import { concurrentMap } from '../utils/concurrentMap.js';

describe('concurrentMap', () => {
  let mockConsoleError;

  beforeEach(() => {
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    mockConsoleError.mockRestore();
  });

  test('should process all items and return correct results', async () => {
    const items = [1, 2, 3, 4, 5];
    const concurrency = 2;
    const asyncMapper = jest.fn(async (item) => item * 2);

    const results = await concurrentMap(items, concurrency, asyncMapper);

    expect(asyncMapper).toHaveBeenCalledTimes(items.length);
    expect(results).toEqual([2, 4, 6, 8, 10]);
  });

  test('should respect the concurrency limit', async () => {
    const items = [1, 2, 3, 4, 5];
    const concurrency = 2;
    let activeCalls = 0;
    const maxActiveCalls = jest.fn();

    const asyncMapper = jest.fn(async (item) => {
      activeCalls++;
      maxActiveCalls(activeCalls);
      await new Promise(resolve => setTimeout(resolve, 10)); // Simulate async work
      activeCalls--;
      return item * 2;
    });

    await concurrentMap(items, concurrency, asyncMapper);

    // Check that maxActiveCalls was never greater than concurrency
    maxActiveCalls.mock.calls.forEach(([calls]) => {
      expect(calls).toBeLessThanOrEqual(concurrency);
    });
  });

  test('should handle errors in asyncMapper without stopping other items', async () => {
    const items = [1, 2, 3, 4, 5];
    const concurrency = 2;
    const asyncMapper = jest.fn(async (item) => {
      if (item === 3) {
        throw new Error('Error for item 3');
      }
      return item * 2;
    });

    const results = await concurrentMap(items, concurrency, asyncMapper);

    expect(mockConsoleError).toHaveBeenCalledWith('Error processing item:', expect.any(Error));
    // Expect results for items that did not error, and the erroring item's result to be skipped
    expect(results).toEqual([2, 4, 8, 10]); // Order might vary due to concurrency
    expect(results).not.toContain(6); // Result for item 3 should be skipped
  });

  test('should return an empty array for empty items input', async () => {
    const items = [];
    const concurrency = 2;
    const asyncMapper = jest.fn();

    const results = await concurrentMap(items, concurrency, asyncMapper);

    expect(asyncMapper).not.toHaveBeenCalled();
    expect(results).toEqual([]);
  });

  test('should not include null results from asyncMapper', async () => {
    const items = [1, 2, 3];
    const concurrency = 1;
    const asyncMapper = jest.fn(async (item) => {
      if (item === 2) {
        return null;
      }
      return item * 10;
    });

    const results = await concurrentMap(items, concurrency, asyncMapper);

    expect(results).toEqual([10, 30]);
    expect(results).not.toContain(null);
  });
});
>>>>>>> dev
