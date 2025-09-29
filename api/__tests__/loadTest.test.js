/**
 * Unit Tests for Load Testing Utilities
 * Tests: Load test configuration, performance metrics, stress testing
 */

import { createLoadTest, runLoadTest, analyzeResults } from '../loadTests/loadTest.js';

// Mock dependencies
jest.mock('supertest');
jest.mock('cluster');
jest.mock('os');

const supertest = require('supertest');
const cluster = require('cluster');
const os = require('os');

describe('Load Testing Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createLoadTest', () => {
    test('should create load test with default configuration', () => {
      // Act
      const loadTest = createLoadTest();

      // Assert
      expect(loadTest).toBeDefined();
      expect(loadTest.config).toBeDefined();
      expect(loadTest.config.concurrentUsers).toBe(10);
      expect(loadTest.config.duration).toBe(60);
      expect(loadTest.config.rampUpTime).toBe(10);
    });

    test('should create load test with custom configuration', () => {
      // Arrange
      const config = {
        concurrentUsers: 50,
        duration: 120,
        rampUpTime: 30,
        endpoints: [
          { method: 'GET', path: '/api/health', weight: 0.5 },
          { method: 'POST', path: '/api/login', weight: 0.3 },
          { method: 'GET', path: '/api/profile', weight: 0.2 }
        ]
      };

      // Act
      const loadTest = createLoadTest(config);

      // Assert
      expect(loadTest.config.concurrentUsers).toBe(50);
      expect(loadTest.config.duration).toBe(120);
      expect(loadTest.config.rampUpTime).toBe(30);
      expect(loadTest.config.endpoints).toHaveLength(3);
    });

    test('should validate configuration parameters', () => {
      // Arrange
      const invalidConfig = {
        concurrentUsers: -1,
        duration: 0,
        rampUpTime: -5
      };

      // Act & Assert
      expect(() => createLoadTest(invalidConfig)).toThrow('Invalid configuration');
    });

    test('should handle missing endpoints configuration', () => {
      // Arrange
      const config = {
        concurrentUsers: 10,
        duration: 60
        // Missing endpoints
      };

      // Act
      const loadTest = createLoadTest(config);

      // Assert
      expect(loadTest.config.endpoints).toBeDefined();
      expect(loadTest.config.endpoints.length).toBeGreaterThan(0);
    });
  });

  describe('runLoadTest', () => {
    test('should run load test successfully', async () => {
      // Arrange
      const mockApp = { get: jest.fn() };
      const mockRequest = {
        get: jest.fn().mockReturnThis(),
        expect: jest.fn().mockReturnThis(),
        end: jest.fn().mockImplementation((callback) => {
          callback(null, { status: 200, body: { status: 'OK' } });
        })
      };
      supertest.mockReturnValue(mockRequest);

      const loadTest = createLoadTest({
        concurrentUsers: 5,
        duration: 10,
        rampUpTime: 2
      });

      // Act
      const results = await runLoadTest(mockApp, loadTest);

      // Assert
      expect(results).toBeDefined();
      expect(results.totalRequests).toBeGreaterThan(0);
      expect(results.successfulRequests).toBeGreaterThan(0);
      expect(results.failedRequests).toBeDefined();
      expect(results.averageResponseTime).toBeGreaterThan(0);
      expect(results.requestsPerSecond).toBeGreaterThan(0);
    });

    test('should handle load test errors gracefully', async () => {
      // Arrange
      const mockApp = { get: jest.fn() };
      const mockRequest = {
        get: jest.fn().mockReturnThis(),
        expect: jest.fn().mockReturnThis(),
        end: jest.fn().mockImplementation((callback) => {
          callback(new Error('Network error'), null);
        })
      };
      supertest.mockReturnValue(mockRequest);

      const loadTest = createLoadTest({
        concurrentUsers: 2,
        duration: 5,
        rampUpTime: 1
      });

      // Act
      const results = await runLoadTest(mockApp, loadTest);

      // Assert
      expect(results).toBeDefined();
      expect(results.failedRequests).toBeGreaterThan(0);
      expect(results.errors).toBeDefined();
    });

    test('should respect concurrent user limits', async () => {
      // Arrange
      const mockApp = { get: jest.fn() };
      const mockRequest = {
        get: jest.fn().mockReturnThis(),
        expect: jest.fn().mockReturnThis(),
        end: jest.fn().mockImplementation((callback) => {
          callback(null, { status: 200, body: { status: 'OK' } });
        })
      };
      supertest.mockReturnValue(mockRequest);

      const loadTest = createLoadTest({
        concurrentUsers: 3,
        duration: 5,
        rampUpTime: 1
      });

      // Act
      const results = await runLoadTest(mockApp, loadTest);

      // Assert
      expect(results.maxConcurrentUsers).toBeLessThanOrEqual(3);
    });

    test('should measure response times accurately', async () => {
      // Arrange
      const mockApp = { get: jest.fn() };
      let requestCount = 0;
      const mockRequest = {
        get: jest.fn().mockReturnThis(),
        expect: jest.fn().mockReturnThis(),
        end: jest.fn().mockImplementation((callback) => {
          const responseTime = 100 + (requestCount * 10); // Simulate varying response times
          requestCount++;
          setTimeout(() => {
            callback(null, { 
              status: 200, 
              body: { status: 'OK' },
              responseTime 
            });
          }, responseTime);
        })
      };
      supertest.mockReturnValue(mockRequest);

      const loadTest = createLoadTest({
        concurrentUsers: 2,
        duration: 3,
        rampUpTime: 1
      });

      // Act
      const results = await runLoadTest(mockApp, loadTest);

      // Assert
      expect(results.averageResponseTime).toBeGreaterThan(0);
      expect(results.minResponseTime).toBeGreaterThan(0);
      expect(results.maxResponseTime).toBeGreaterThan(0);
      expect(results.minResponseTime).toBeLessThanOrEqual(results.averageResponseTime);
      expect(results.averageResponseTime).toBeLessThanOrEqual(results.maxResponseTime);
    });
  });

  describe('analyzeResults', () => {
    test('should analyze load test results correctly', () => {
      // Arrange
      const results = {
        totalRequests: 1000,
        successfulRequests: 950,
        failedRequests: 50,
        averageResponseTime: 150,
        minResponseTime: 50,
        maxResponseTime: 500,
        requestsPerSecond: 16.67,
        duration: 60,
        maxConcurrentUsers: 10
      };

      // Act
      const analysis = analyzeResults(results);

      // Assert
      expect(analysis.successRate).toBe(95);
      expect(analysis.failureRate).toBe(5);
      expect(analysis.performanceGrade).toBeDefined();
      expect(analysis.recommendations).toBeDefined();
      expect(analysis.bottlenecks).toBeDefined();
    });

    test('should identify performance bottlenecks', () => {
      // Arrange
      const results = {
        totalRequests: 1000,
        successfulRequests: 800,
        failedRequests: 200,
        averageResponseTime: 2000, // High response time
        minResponseTime: 100,
        maxResponseTime: 5000,
        requestsPerSecond: 5, // Low throughput
        duration: 60,
        maxConcurrentUsers: 10
      };

      // Act
      const analysis = analyzeResults(results);

      // Assert
      expect(analysis.performanceGrade).toBe('Poor');
      expect(analysis.bottlenecks).toContain('High response times');
      expect(analysis.bottlenecks).toContain('Low throughput');
      expect(analysis.recommendations).toContain('Optimize database queries');
      expect(analysis.recommendations).toContain('Consider caching');
    });

    test('should provide recommendations for improvement', () => {
      // Arrange
      const results = {
        totalRequests: 1000,
        successfulRequests: 900,
        failedRequests: 100,
        averageResponseTime: 800,
        minResponseTime: 200,
        maxResponseTime: 2000,
        requestsPerSecond: 12,
        duration: 60,
        maxConcurrentUsers: 10
      };

      // Act
      const analysis = analyzeResults(results);

      // Assert
      expect(analysis.recommendations).toBeDefined();
      expect(Array.isArray(analysis.recommendations)).toBe(true);
      expect(analysis.recommendations.length).toBeGreaterThan(0);
    });

    test('should handle edge cases in results', () => {
      // Arrange
      const results = {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        minResponseTime: 0,
        maxResponseTime: 0,
        requestsPerSecond: 0,
        duration: 0,
        maxConcurrentUsers: 0
      };

      // Act
      const analysis = analyzeResults(results);

      // Assert
      expect(analysis.successRate).toBe(0);
      expect(analysis.failureRate).toBe(0);
      expect(analysis.performanceGrade).toBe('No Data');
      expect(analysis.recommendations).toContain('No requests were processed');
    });
  });

  describe('Cluster-based Load Testing', () => {
    test('should use cluster for multi-core testing', () => {
      // Arrange
      os.cpus.mockReturnValue([
        { model: 'Intel Core i7', speed: 2400 },
        { model: 'Intel Core i7', speed: 2400 },
        { model: 'Intel Core i7', speed: 2400 },
        { model: 'Intel Core i7', speed: 2400 }
      ]);

      cluster.isMaster = true;
      cluster.fork = jest.fn();
      cluster.on = jest.fn();

      // Act
      const loadTest = createLoadTest({
        concurrentUsers: 100,
        useCluster: true
      });

      // Assert
      expect(loadTest.config.useCluster).toBe(true);
      expect(loadTest.config.workerCount).toBe(4);
    });

    test('should handle cluster worker management', () => {
      // Arrange
      cluster.isMaster = false;
      cluster.worker = { id: 1 };
      process.send = jest.fn();

      // Act
      const loadTest = createLoadTest({
        concurrentUsers: 25,
        useCluster: true
      });

      // Assert
      expect(loadTest.config.workerId).toBe(1);
    });

    test('should aggregate results from multiple workers', () => {
      // Arrange
      const workerResults = [
        { totalRequests: 250, successfulRequests: 240, failedRequests: 10 },
        { totalRequests: 250, successfulRequests: 235, failedRequests: 15 },
        { totalRequests: 250, successfulRequests: 245, failedRequests: 5 },
        { totalRequests: 250, successfulRequests: 230, failedRequests: 20 }
      ];

      // Act
      const aggregatedResults = analyzeResults(workerResults);

      // Assert
      expect(aggregatedResults.totalRequests).toBe(1000);
      expect(aggregatedResults.successfulRequests).toBe(950);
      expect(aggregatedResults.failedRequests).toBe(50);
      expect(aggregatedResults.successRate).toBe(95);
    });
  });

  describe('Performance Thresholds', () => {
    test('should validate performance against thresholds', () => {
      // Arrange
      const results = {
        totalRequests: 1000,
        successfulRequests: 950,
        failedRequests: 50,
        averageResponseTime: 150,
        requestsPerSecond: 16.67
      };

      const thresholds = {
        maxResponseTime: 200,
        minSuccessRate: 95,
        minThroughput: 15
      };

      // Act
      const analysis = analyzeResults(results, thresholds);

      // Assert
      expect(analysis.thresholdsMet).toBe(true);
      expect(analysis.violations).toHaveLength(0);
    });

    test('should identify threshold violations', () => {
      // Arrange
      const results = {
        totalRequests: 1000,
        successfulRequests: 900,
        failedRequests: 100,
        averageResponseTime: 300,
        requestsPerSecond: 10
      };

      const thresholds = {
        maxResponseTime: 200,
        minSuccessRate: 95,
        minThroughput: 15
      };

      // Act
      const analysis = analyzeResults(results, thresholds);

      // Assert
      expect(analysis.thresholdsMet).toBe(false);
      expect(analysis.violations).toContain('Response time exceeds threshold');
      expect(analysis.violations).toContain('Success rate below threshold');
      expect(analysis.violations).toContain('Throughput below threshold');
    });
  });
});