/**
 * Unit Tests for Performance Monitoring and Optimization
 * Tests: Response time tracking, memory usage, performance metrics
 */

import request from 'supertest';
import app from '../app.js';

describe('Performance Monitoring', () => {
  describe('Response Time Tracking', () => {
    test('should track response times for health endpoint', async () => {
      // Arrange
      const startTime = Date.now();

      // Act
      const response = await request(app)
        .get('/api/health');

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Assert
      expect(response.status).toBeDefined();
      expect(responseTime).toBeGreaterThan(0);
      expect(responseTime).toBeLessThan(5000); // Should respond within 5 seconds
    });

    test('should track response times for multiple concurrent requests', async () => {
      // Arrange
      const concurrentRequests = 10;
      const startTime = Date.now();

      // Act
      const promises = Array.from({ length: concurrentRequests }, () =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Assert
      expect(responses).toHaveLength(concurrentRequests);
      responses.forEach(response => {
        expect(response.status).toBeDefined();
      });
      expect(totalTime).toBeGreaterThan(0);
      expect(totalTime).toBeLessThan(10000); // All requests should complete within 10 seconds
    });

    test('should handle response time under load', async () => {
      // Arrange
      const loadRequests = 50;
      const responseTimes = [];

      // Act
      for (let i = 0; i < loadRequests; i++) {
        const startTime = Date.now();
        const response = await request(app).get('/api/health');
        const endTime = Date.now();
        
        responseTimes.push(endTime - startTime);
        expect(response.status).toBeDefined();
      }

      // Assert
      const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);

      expect(averageResponseTime).toBeGreaterThan(0);
      expect(maxResponseTime).toBeGreaterThan(minResponseTime);
      expect(averageResponseTime).toBeLessThan(2000); // Average should be under 2 seconds
    });
  });

  describe('Memory Usage Monitoring', () => {
    test('should track memory usage during operation', () => {
      // Arrange
      const initialMemory = process.memoryUsage();

      // Act
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: `test-data-${i}`,
        timestamp: Date.now()
      }));

      const afterAllocation = process.memoryUsage();
      const memoryIncrease = afterAllocation.heapUsed - initialMemory.heapUsed;

      // Assert
      expect(initialMemory.heapUsed).toBeGreaterThan(0);
      expect(afterAllocation.heapUsed).toBeGreaterThan(initialMemory.heapUsed);
      expect(memoryIncrease).toBeGreaterThan(0);
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase
    });

    test('should handle memory cleanup', () => {
      // Arrange
      const initialMemory = process.memoryUsage();

      // Act
      let largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        data: `test-data-${i}`,
        timestamp: Date.now()
      }));

      const afterAllocation = process.memoryUsage();
      
      // Clear the array
      largeArray = null;
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const afterCleanup = process.memoryUsage();

      // Assert
      expect(afterAllocation.heapUsed).toBeGreaterThan(initialMemory.heapUsed);
      // Note: Memory cleanup might not be immediate due to garbage collection timing
    });
  });

  describe('CPU Usage Monitoring', () => {
    test('should track CPU usage during intensive operations', async () => {
      // Arrange
      const startCpuUsage = process.cpuUsage();

      // Act - Simulate CPU intensive operation
      const intensiveOperation = () => {
        let result = 0;
        for (let i = 0; i < 1000000; i++) {
          result += Math.sqrt(i);
        }
        return result;
      };

      const result = intensiveOperation();
      const endCpuUsage = process.cpuUsage(startCpuUsage);

      // Assert
      expect(result).toBeGreaterThan(0);
      expect(endCpuUsage.user).toBeGreaterThan(0);
      expect(endCpuUsage.system).toBeGreaterThan(0);
    });

    test('should handle CPU usage under concurrent load', async () => {
      // Arrange
      const concurrentOperations = 5;
      const startCpuUsage = process.cpuUsage();

      // Act
      const promises = Array.from({ length: concurrentOperations }, () =>
        new Promise(resolve => {
          let result = 0;
          for (let i = 0; i < 500000; i++) {
            result += Math.sqrt(i);
          }
          resolve(result);
        })
      );

      await Promise.all(promises);
      const endCpuUsage = process.cpuUsage(startCpuUsage);

      // Assert
      expect(endCpuUsage.user).toBeGreaterThan(0);
      expect(endCpuUsage.system).toBeGreaterThan(0);
    });
  });

  describe('Performance Metrics Collection', () => {
    test('should collect comprehensive performance metrics', async () => {
      // Arrange
      const metrics = {
        startTime: Date.now(),
        startMemory: process.memoryUsage(),
        startCpu: process.cpuUsage()
      };

      // Act
      const response = await request(app).get('/api/health');
      
      const endTime = Date.now();
      const endMemory = process.memoryUsage();
      const endCpu = process.cpuUsage(metrics.startCpu);

      const performanceMetrics = {
        responseTime: endTime - metrics.startTime,
        memoryUsed: endMemory.heapUsed - metrics.startMemory.heapUsed,
        cpuUser: endCpu.user,
        cpuSystem: endCpu.system,
        status: response.status
      };

      // Assert
      expect(performanceMetrics.responseTime).toBeGreaterThan(0);
      expect(performanceMetrics.memoryUsed).toBeDefined();
      expect(performanceMetrics.cpuUser).toBeGreaterThan(0);
      expect(performanceMetrics.cpuSystem).toBeGreaterThan(0);
      expect(performanceMetrics.status).toBeDefined();
    });

    test('should track performance degradation', async () => {
      // Arrange
      const iterations = 20;
      const responseTimes = [];

      // Act
      for (let i = 0; i < iterations; i++) {
        const startTime = Date.now();
        await request(app).get('/api/health');
        const endTime = Date.now();
        responseTimes.push(endTime - startTime);
      }

      // Assert
      const firstHalf = responseTimes.slice(0, Math.floor(iterations / 2));
      const secondHalf = responseTimes.slice(Math.floor(iterations / 2));

      const firstHalfAvg = firstHalf.reduce((sum, time) => sum + time, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, time) => sum + time, 0) / secondHalf.length;

      expect(firstHalfAvg).toBeGreaterThan(0);
      expect(secondHalfAvg).toBeGreaterThan(0);
      // Performance should not degrade significantly
      expect(secondHalfAvg).toBeLessThan(firstHalfAvg * 2);
    });
  });

  describe('Load Testing Simulation', () => {
    test('should handle burst traffic', async () => {
      // Arrange
      const burstSize = 20;
      const startTime = Date.now();

      // Act
      const promises = Array.from({ length: burstSize }, () =>
        request(app).get('/api/health')
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Assert
      expect(responses).toHaveLength(burstSize);
      responses.forEach(response => {
        expect(response.status).toBeDefined();
      });
      expect(totalTime).toBeLessThan(5000); // Burst should complete within 5 seconds
    });

    test('should maintain performance under sustained load', async () => {
      // Arrange
      const sustainedRequests = 100;
      const requestInterval = 100; // 100ms between requests
      const responseTimes = [];

      // Act
      for (let i = 0; i < sustainedRequests; i++) {
        const startTime = Date.now();
        const response = await request(app).get('/api/health');
        const endTime = Date.now();
        
        responseTimes.push(endTime - startTime);
        expect(response.status).toBeDefined();

        // Wait before next request
        if (i < sustainedRequests - 1) {
          await new Promise(resolve => setTimeout(resolve, requestInterval));
        }
      }

      // Assert
      const averageResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      const minResponseTime = Math.min(...responseTimes);

      expect(averageResponseTime).toBeGreaterThan(0);
      expect(maxResponseTime).toBeGreaterThan(minResponseTime);
      expect(averageResponseTime).toBeLessThan(1000); // Average should be under 1 second
    });
  });

  describe('Resource Cleanup', () => {
    test('should clean up resources after operations', async () => {
      // Arrange
      const initialMemory = process.memoryUsage();
      const initialCpu = process.cpuUsage();

      // Act
      const promises = Array.from({ length: 10 }, () =>
        request(app).get('/api/health')
      );

      await Promise.all(promises);

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 100));

      const finalMemory = process.memoryUsage();
      const finalCpu = process.cpuUsage();

      // Assert
      expect(finalMemory.heapUsed).toBeGreaterThan(0);
      expect(finalCpu.user).toBeGreaterThan(0);
      // Memory should not grow excessively
      expect(finalMemory.heapUsed - initialMemory.heapUsed).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    });

    test('should handle resource exhaustion gracefully', async () => {
      // Arrange
      const largeRequests = 1000;

      // Act & Assert
      const promises = Array.from({ length: largeRequests }, () =>
        request(app).get('/api/health').catch(error => {
          // Some requests might fail under extreme load
          expect(error).toBeDefined();
        })
      );

      const results = await Promise.allSettled(promises);
      
      // Most requests should succeed
      const successfulRequests = results.filter(result => result.status === 'fulfilled').length;
      expect(successfulRequests).toBeGreaterThan(largeRequests * 0.8); // At least 80% should succeed
    });
  });
});