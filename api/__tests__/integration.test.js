/**
 * Integration Tests for Backend API
 * Tests: Database integration, API workflows, external service integration
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import RepoMetrics from '../models/RepoMetrics.js';

// Mock external services
jest.mock('../../Data-Collection/repository-info-service.js', () => ({
  getRepositoryInfo: jest.fn()
}));

jest.mock('../../Data-Collection/universal-dora-service.js', () => ({
  getDORAMetrics: jest.fn()
}));

jest.mock('../../services/metricsService.js', () => ({
  analyzeRepository: jest.fn()
}));

import { getRepositoryInfo } from '../../Data-Collection/repository-info-service.js';
import { getDORAMetrics } from '../../Data-Collection/universal-dora-service.js';
import { analyzeRepository } from '../../services/metricsService.js';

describe('Backend Integration Tests', () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Connect to test database if not already connected
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devx360_test');
    }
  });

  beforeEach(async () => {
    // Clear all collections
    await User.deleteMany({});
    await Team.deleteMany({});
    await RepoMetrics.deleteMany({});

    // Create test user
    testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'hashed_password',
      role: 'developer'
    });
    await testUser.save();

    // Mock JWT verification
    const jwt = require('jsonwebtoken');
    jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
      callback(null, { userId: testUser._id.toString(), email: testUser.email, role: testUser.role });
    });
  });

  afterAll(async () => {
    // Clean up
    await User.deleteMany({});
    await Team.deleteMany({});
    await RepoMetrics.deleteMany({});
  });

  describe('User Registration and Authentication Flow', () => {
    test('should complete full user registration and login flow', async () => {
      // Arrange
      const userData = {
        name: 'Integration Test User',
        email: 'integration@example.com',
        password: 'password123',
        role: 'developer'
      };

      // Mock bcrypt
      const bcrypt = require('bcrypt');
      bcrypt.hash.mockResolvedValue('hashed_password');
      bcrypt.compare.mockResolvedValue(true);

      // Act 1: Register user
      const registerResponse = await request(app)
        .post('/api/register')
        .send(userData);

      // Assert 1: Registration successful
      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.message).toBe('Registration successful');
      expect(registerResponse.body.user.email).toBe('integration@example.com');

      // Act 2: Login user
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: 'integration@example.com',
          password: 'password123'
        });

      // Assert 2: Login successful
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.message).toBe('Login successful');
      expect(loginResponse.body.user.email).toBe('integration@example.com');
    });

    test('should handle duplicate email registration', async () => {
      // Arrange
      const userData = {
        name: 'Duplicate User',
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'developer'
      };

      // Create first user
      const firstUser = new User({
        name: 'First User',
        email: 'duplicate@example.com',
        password: 'hashed_password',
        role: 'developer'
      });
      await firstUser.save();

      // Mock bcrypt
      const bcrypt = require('bcrypt');
      bcrypt.hash.mockResolvedValue('hashed_password');

      // Act
      const response = await request(app)
        .post('/api/register')
        .send(userData);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User with this email already exists');
    });
  });

  describe('Team Creation and Management Flow', () => {
    test('should complete team creation workflow', async () => {
      // Arrange
      const teamData = {
        name: 'Integration Test Team',
        password: 'team123',
        repoUrl: 'https://github.com/owner/repo'
      };

      const mockAnalysis = {
        metadata: {
          name: 'repo',
          url: 'https://github.com/owner/repo',
          description: 'Test repository'
        },
        metrics: {
          deployment_frequency: { total_deployments: 5 },
          lead_time: { average_days: '2.5' },
          mttr: { average_days: '1.2' },
          change_failure_rate: { failure_rate: '10%' }
        }
      };

      // Mock dependencies
      analyzeRepository.mockResolvedValue(mockAnalysis);
      const bcrypt = require('bcrypt');
      bcrypt.hash.mockResolvedValue('hashed_password');

      // Act
      const response = await request(app)
        .post('/api/teams')
        .set('Cookie', 'token=valid_jwt_token')
        .send(teamData);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Team created successfully');
      expect(response.body.team.name).toBe('Integration Test Team');

      // Verify database state
      const teams = await Team.find({});
      expect(teams).toHaveLength(1);
      expect(teams[0].name).toBe('Integration Test Team');
      expect(teams[0].creator.toString()).toBe(testUser._id.toString());

      // Verify repo metrics were created
      const repoMetrics = await RepoMetrics.find({});
      expect(repoMetrics).toHaveLength(1);
      expect(repoMetrics[0].repositoryInfo.name).toBe('repo');
    });

    test('should handle team joining workflow', async () => {
      // Arrange
      const teamData = {
        name: 'Join Test Team',
        password: 'team123',
        repoUrl: 'https://github.com/owner/repo'
      };

      const mockAnalysis = {
        metadata: { name: 'repo', url: 'https://github.com/owner/repo' },
        metrics: { deployment_frequency: { total_deployments: 5 } }
      };

      // Create team first
      analyzeRepository.mockResolvedValue(mockAnalysis);
      const bcrypt = require('bcrypt');
      bcrypt.hash.mockResolvedValue('hashed_password');

      const createResponse = await request(app)
        .post('/api/teams')
        .set('Cookie', 'token=valid_jwt_token')
        .send(teamData);

      expect(createResponse.status).toBe(201);

      // Create second user for joining
      const secondUser = new User({
        name: 'Second User',
        email: 'second@example.com',
        password: 'hashed_password',
        role: 'developer'
      });
      await secondUser.save();

      // Mock JWT for second user
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
        callback(null, { userId: secondUser._id.toString(), email: secondUser.email, role: secondUser.role });
      });

      // Act: Join team
      const joinResponse = await request(app)
        .post('/api/teams/join')
        .set('Cookie', 'token=valid_jwt_token')
        .send({
          name: 'Join Test Team',
          password: 'team123'
        });

      // Assert
      expect(joinResponse.status).toBe(200);
      expect(joinResponse.body.message).toBe('Joined team');

      // Verify team has both members
      const team = await Team.findOne({ name: 'Join Test Team' });
      expect(team.members).toHaveLength(2);
      expect(team.members.map(m => m.toString())).toContain(testUser._id.toString());
      expect(team.members.map(m => m.toString())).toContain(secondUser._id.toString());
    });
  });

  describe('MCP API Integration', () => {
    test('should handle MCP repository info request', async () => {
      // Arrange
      const mockRepoInfo = {
        name: 'test-repo',
        full_name: 'owner/test-repo',
        description: 'Test repository',
        stars: 100,
        forks: 50
      };

      getRepositoryInfo.mockResolvedValue(mockRepoInfo);
      process.env.MCP_API_TOKEN = 'test-mcp-token';

      // Act
      const response = await request(app)
        .get('/api/mcp/repo?url=https://github.com/owner/test-repo')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.name).toBe('test-repo');
      expect(response.body.stars).toBe(100);
      expect(getRepositoryInfo).toHaveBeenCalledWith('https://github.com/owner/test-repo');

      delete process.env.MCP_API_TOKEN;
    });

    test('should handle MCP DORA metrics request', async () => {
      // Arrange
      const mockMetrics = {
        '7d': {
          repository: { name: 'test-repo', owner: 'owner' },
          deployment_frequency: { total_deployments: 5 },
          lead_time: { average_days: '2.5' },
          mttr: { average_days: '1.2' },
          change_failure_rate: { failure_rate: '10%' }
        }
      };

      getDORAMetrics.mockResolvedValue(mockMetrics);
      process.env.MCP_API_TOKEN = 'test-mcp-token';

      // Act
      const response = await request(app)
        .get('/api/mcp/metrics?repositoryUrl=https://github.com/owner/test-repo')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body['7d']).toBeDefined();
      expect(response.body['7d'].deployment_frequency.total_deployments).toBe(5);
      expect(getDORAMetrics).toHaveBeenCalledWith('https://github.com/owner/test-repo');

      delete process.env.MCP_API_TOKEN;
    });

    test('should handle MCP repository analysis request', async () => {
      // Arrange
      const mockAnalysis = {
        metadata: {
          name: 'test-repo',
          url: 'https://github.com/owner/test-repo',
          description: 'Test repository'
        },
        metrics: {
          deployment_frequency: { total_deployments: 5 },
          lead_time: { average_days: '2.5' },
          mttr: { average_days: '1.2' },
          change_failure_rate: { failure_rate: '10%' }
        },
        insights: ['Repository shows good deployment frequency']
      };

      analyzeRepository.mockResolvedValue(mockAnalysis);
      process.env.MCP_API_TOKEN = 'test-mcp-token';

      // Act
      const response = await request(app)
        .get('/api/mcp/analyze?url=https://github.com/owner/test-repo')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.metadata.name).toBe('test-repo');
      expect(response.body.insights).toHaveLength(1);
      expect(analyzeRepository).toHaveBeenCalledWith('https://github.com/owner/test-repo');

      delete process.env.MCP_API_TOKEN;
    });
  });

  describe('Database Consistency Tests', () => {
    test('should maintain referential integrity between models', async () => {
      // Arrange
      const teamData = {
        name: 'Consistency Test Team',
        password: 'team123',
        repoUrl: 'https://github.com/owner/repo'
      };

      const mockAnalysis = {
        metadata: { name: 'repo', url: 'https://github.com/owner/repo' },
        metrics: { deployment_frequency: { total_deployments: 5 } }
      };

      analyzeRepository.mockResolvedValue(mockAnalysis);
      const bcrypt = require('bcrypt');
      bcrypt.hash.mockResolvedValue('hashed_password');

      // Act: Create team
      const response = await request(app)
        .post('/api/teams')
        .set('Cookie', 'token=valid_jwt_token')
        .send(teamData);

      expect(response.status).toBe(201);

      // Assert: Verify all related data exists
      const teams = await Team.find({});
      const repoMetrics = await RepoMetrics.find({});
      const users = await User.find({});

      expect(teams).toHaveLength(1);
      expect(repoMetrics).toHaveLength(1);
      expect(users).toHaveLength(1);

      // Verify relationships
      expect(repoMetrics[0].teamId.toString()).toBe(teams[0]._id.toString());
      expect(teams[0].creator.toString()).toBe(users[0]._id.toString());
      expect(teams[0].members[0].toString()).toBe(users[0]._id.toString());
    });

    test('should handle concurrent team operations', async () => {
      // Arrange
      const teamData1 = {
        name: 'Concurrent Team 1',
        password: 'team123',
        repoUrl: 'https://github.com/owner/repo1'
      };

      const teamData2 = {
        name: 'Concurrent Team 2',
        password: 'team123',
        repoUrl: 'https://github.com/owner/repo2'
      };

      const mockAnalysis = {
        metadata: { name: 'repo', url: 'https://github.com/owner/repo' },
        metrics: { deployment_frequency: { total_deployments: 5 } }
      };

      analyzeRepository.mockResolvedValue(mockAnalysis);
      const bcrypt = require('bcrypt');
      bcrypt.hash.mockResolvedValue('hashed_password');

      // Act: Create teams concurrently
      const [response1, response2] = await Promise.all([
        request(app)
          .post('/api/teams')
          .set('Cookie', 'token=valid_jwt_token')
          .send(teamData1),
        request(app)
          .post('/api/teams')
          .set('Cookie', 'token=valid_jwt_token')
          .send(teamData2)
      ]);

      // Assert: Both teams created successfully
      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);

      // Verify both teams exist in database
      const teams = await Team.find({});
      expect(teams).toHaveLength(2);
      expect(teams.map(t => t.name)).toContain('Concurrent Team 1');
      expect(teams.map(t => t.name)).toContain('Concurrent Team 2');

      // Verify both repo metrics exist
      const repoMetrics = await RepoMetrics.find({});
      expect(repoMetrics).toHaveLength(2);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle external service failures gracefully', async () => {
      // Arrange
      const teamData = {
        name: 'Error Test Team',
        password: 'team123',
        repoUrl: 'https://github.com/invalid/repo'
      };

      analyzeRepository.mockRejectedValue(new Error('Repository not found'));
      const bcrypt = require('bcrypt');
      bcrypt.hash.mockResolvedValue('hashed_password');

      // Act
      const response = await request(app)
        .post('/api/teams')
        .set('Cookie', 'token=valid_jwt_token')
        .send(teamData);

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Repository analysis failed');

      // Verify no team was created
      const teams = await Team.find({});
      expect(teams).toHaveLength(0);
    });

    test('should handle database connection issues', async () => {
      // Arrange
      const originalConnection = mongoose.connection;
      mongoose.connection = { readyState: 0 }; // Disconnected

      // Act
      const response = await request(app)
        .get('/api/health');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('Degraded');

      // Restore connection
      mongoose.connection = originalConnection;
    });
  });
});