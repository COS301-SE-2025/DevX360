import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

// Mock console methods globally
const mockConsoleLog = jest.fn();
const mockConsoleError = jest.fn();
const mockConsoleWarn = jest.fn();

// Mock process.exit
const mockProcessExit = jest.fn();

// Mock mongoose
const mockMongooseConnect = jest.fn();

// Set up global mocks before any imports
global.console = {
  log: mockConsoleLog,
  error: mockConsoleError,
  warn: mockConsoleWarn,
  info: jest.fn(),
  debug: jest.fn()
};

Object.defineProperty(process, 'exit', {
  value: mockProcessExit,
  writable: true
});

// Mock mongoose module
jest.unstable_mockModule('mongoose', () => ({
  default: {
    connect: mockMongooseConnect
  }
}));

// Mock dotenv/config
jest.unstable_mockModule('dotenv/config', () => ({}));

describe('Database Module Unit Tests', () => {
  let dbInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    
    // Clear the singleton instance by clearing the module cache
    jest.resetModules();
    
    // Set default environment
    process.env.NODE_ENV = 'test';
    delete process.env.MONGODB_URI;
    
    // Import the module fresh
    const dbModule = await import('../db.js');
    dbInstance = dbModule.default;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Database Instance', () => {
    test('should export a Database instance', () => {
      expect(dbInstance).toBeDefined();
      expect(typeof dbInstance).toBe('object');
    });

    test('should have _connect method', () => {
      expect(typeof dbInstance._connect).toBe('function');
    });
  });

  describe('_connect Method - Environment Variable Scenarios', () => {
    test('should warn and skip connection when MONGODB_URI is not set in test environment', async () => {
      // Arrange
      jest.resetModules();
      process.env.NODE_ENV = 'test';
      delete process.env.MONGODB_URI;
      
      // Import fresh module with new environment
      const dbModule = await import('../db.js');
      const testDbInstance = dbModule.default;
      
      // Act - call _connect directly
      testDbInstance._connect();
      
      // Assert
      expect(mockConsoleWarn).toHaveBeenCalledWith('MONGODB_URI not set — skipping DB connection in test mode.');
      expect(mockMongooseConnect).not.toHaveBeenCalled();
    });

    test('should exit with error when MONGODB_URI is not set in production environment', async () => {
      // Arrange
      jest.resetModules();
      process.env.NODE_ENV = 'production';
      delete process.env.MONGODB_URI;
      mockMongooseConnect.mockResolvedValue(); // Ensure it returns a promise
      
      // Import fresh module with new environment
      const dbModule = await import('../db.js');
      const testDbInstance = dbModule.default;
      
      // Act - call _connect directly
      testDbInstance._connect();
      
      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith('MONGODB_URI is not set.');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
      expect(mockMongooseConnect).not.toHaveBeenCalled();
    });

    test('should exit with error when MONGODB_URI is not set in development environment', async () => {
      // Arrange
      jest.resetModules();
      process.env.NODE_ENV = 'development';
      delete process.env.MONGODB_URI;
      mockMongooseConnect.mockResolvedValue(); // Ensure it returns a promise
      
      // Import fresh module with new environment
      const dbModule = await import('../db.js');
      const testDbInstance = dbModule.default;
      
      // Act - call _connect directly
      testDbInstance._connect();
      
      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith('MONGODB_URI is not set.');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
      expect(mockMongooseConnect).not.toHaveBeenCalled();
    });

    test('should exit with error when MONGODB_URI is not set and NODE_ENV is undefined', async () => {
      // Arrange
      jest.resetModules();
      delete process.env.NODE_ENV;
      delete process.env.MONGODB_URI;
      mockMongooseConnect.mockResolvedValue(); // Ensure it returns a promise
      
      // Import fresh module with new environment
      const dbModule = await import('../db.js');
      const testDbInstance = dbModule.default;
      
      // Act - call _connect directly
      testDbInstance._connect();
      
      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith('MONGODB_URI is not set.');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
      expect(mockMongooseConnect).not.toHaveBeenCalled();
    });
  });

  describe('_connect Method - Database Connection Scenarios', () => {
    test('should connect to MongoDB successfully when MONGODB_URI is set', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      mockMongooseConnect.mockResolvedValue();
      
      // Act - call _connect directly
      dbInstance._connect();
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Assert
      expect(mockMongooseConnect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/testdb',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
    });

    test('should log success message when connection is successful', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      mockMongooseConnect.mockResolvedValue();
      
      // Act - call _connect directly
      dbInstance._connect();
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Assert
      expect(mockConsoleLog).toHaveBeenCalledWith('MongoDB connected successfully');
    });

    test('should handle connection error and exit process', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      const connectionError = new Error('Connection failed');
      mockMongooseConnect.mockRejectedValue(connectionError);
      
      // Act - call _connect directly
      dbInstance._connect();
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith('MongoDB connection error:', connectionError);
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    test('should use correct connection options', async () => {
      // Arrange
      process.env.MONGODB_URI = 'mongodb://localhost:27017/testdb';
      mockMongooseConnect.mockResolvedValue();
      
      // Act - call _connect directly
      dbInstance._connect();
      
      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Assert
      expect(mockMongooseConnect).toHaveBeenCalledWith(
        'mongodb://localhost:27017/testdb',
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
    });
  });

  describe('_connect Method - Edge Cases', () => {
    test('should handle empty MONGODB_URI string', async () => {
      // Arrange
      jest.resetModules();
      process.env.MONGODB_URI = '';
      mockMongooseConnect.mockResolvedValue(); // Ensure it returns a promise
      
      // Import fresh module with new environment
      const dbModule = await import('../db.js');
      const testDbInstance = dbModule.default;
      
      // Act - call _connect directly
      testDbInstance._connect();
      
      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith('MONGODB_URI is not set.');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    test('should handle whitespace-only MONGODB_URI string', async () => {
      // Arrange
      jest.resetModules();
      process.env.MONGODB_URI = '   ';
      mockMongooseConnect.mockResolvedValue(); // Ensure it returns a promise
      
      // Import fresh module with new environment
      const dbModule = await import('../db.js');
      const testDbInstance = dbModule.default;
      
      // Act - call _connect directly
      testDbInstance._connect();
      
      // Assert
      expect(mockConsoleError).toHaveBeenCalledWith('MONGODB_URI is not set.');
      expect(mockProcessExit).toHaveBeenCalledWith(1);
    });

    test('should handle different MONGODB_URI formats', async () => {
      // Arrange
      const testUris = [
        'mongodb://localhost:27017/testdb',
        'mongodb+srv://user:pass@cluster.mongodb.net/testdb',
        'mongodb://user:pass@localhost:27017/testdb'
      ];
      
      mockMongooseConnect.mockResolvedValue();
      
      for (const uri of testUris) {
        jest.clearAllMocks();
        process.env.MONGODB_URI = uri;
        
        // Act - call _connect directly
        dbInstance._connect();
        
        // Wait for async operations
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Assert
        expect(mockMongooseConnect).toHaveBeenCalledWith(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
      }
    });
  });

  describe('Singleton Pattern', () => {
    test('should maintain singleton instance across imports', async () => {
      // Arrange
      jest.resetModules();
      
      // Act - import the module twice
      const dbModule1 = await import('../db.js');
      const dbModule2 = await import('../db.js');
      
      // Assert
      expect(dbModule1.default).toBe(dbModule2.default);
    });
  });
});
