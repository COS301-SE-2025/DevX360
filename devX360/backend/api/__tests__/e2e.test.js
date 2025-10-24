/**
 * End-to-End Test for Backend API
 * Tests: Complete user workflows, team management, MCP integration
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import User from '../models/User.js';
import Team from '../models/Team.js';
import RepoMetrics from '../models/RepoMetrics.js';

// Mock external services with realistic responses
jest.mock('../../Data-Collection/repository-info-service.js', () => ({
  getRepositoryInfo: jest.fn()
}));

jest.mock('../../Data-Collection/universal-dora-service.js', () => ({
  getDORAMetrics: jest.fn()
}));

jest.mock('../../services/metricsService.js', () => ({
  analyzeRepository: jest.fn()
}));

jest.mock('../../services/analysisService.js', () => ({
  runAIAnalysis: jest.fn()
}));

import { getRepositoryInfo } from '../../Data-Collection/repository-info-service.js';
import { getDORAMetrics } from '../../Data-Collection/universal-dora-service.js';
import { analyzeRepository } from '../../services/metricsService.js';
import { runAIAnalysis } from '../../services/analysisService.js';

describe('Backend End-to-End Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/devx360_e2e_test');
    }
  });

  beforeEach(async () => {
    // Clear all collections
    await User.deleteMany({});
    await Team.deleteMany({});
    await RepoMetrics.deleteMany({});

    // Setup realistic mock data
    const mockRepoInfo = {
      name: 'react',
      full_name: 'facebook/react',
      description: 'The library for web and native user interfaces.',
      stars: 239237,
      forks: 49408,
      watchers: 6715,
      open_issues: 807,
      open_pull_requests: 234,
      size: 1151337,
      languages: {
        'JavaScript': 5259931,
        'TypeScript': 2286666,
        'HTML': 115354,
        'CSS': 81670
      },
      primary_language: 'JavaScript',
      created_at: '2013-05-24T16:15:54Z',
      updated_at: '2025-09-25T17:22:09Z',
      pushed_at: '2025-09-25T17:16:48Z',
      default_branch: 'main',
      is_private: false,
      is_fork: false,
      is_archived: false,
      is_disabled: false,
      contributors: [
        {
          username: 'sebmarkbage',
          contributions: 1835,
          avatar_url: 'https://avatars.githubusercontent.com/u/63648?v=4',
          profile_url: 'https://github.com/sebmarkbage',
          account_type: 'User',
          site_admin: false
        }
      ],
      total_contributors: 30,
      license: {
        name: 'MIT License',
        key: 'mit',
        url: 'https://api.github.com/licenses/mit'
      },
      topics: ['declarative', 'frontend', 'javascript', 'library', 'react', 'ui']
    };

    const mockMetrics = {
      '7d': {
        repository: {
          name: 'react',
          owner: 'facebook',
          full_name: 'facebook/react',
          url: 'https://github.com/facebook/react'
        },
        analysis_period: {
          days_back: 7,
          start_date: '2025-09-18T17:24:00.435Z',
          end_date: '2025-09-25T17:24:02.671Z'
        },
        deployment_frequency: {
          total_deployments: 4,
          analysis_period_days: 7,
          perDay: [1, 0, 1, 0, 1, 0, 0],
          perWeek: [3],
          perMonth: [4],
          months: ['2025-09'],
          status: 'Multiple deployments in analysis period',
          frequency_per_day: '0.571',
          frequency_per_week: '4.000',
          frequency_per_month: '4.000'
        },
        lead_time: {
          average_days: '1.20',
          min_days: '0.01',
          max_days: '3.91',
          total_prs_analyzed: 24,
          status: 'Valid lead times calculated'
        },
        mttr: {
          average_days: '0.89',
          min_days: '0.00',
          max_days: '3.91',
          total_incidents_analyzed: 42,
          status: 'Valid MTTR calculated'
        },
        change_failure_rate: {
          total_deployments: 4,
          deployment_failures: 7,
          general_issues: 1,
          critical_failures: 26,
          failure_rate: '25.00%',
          deployment_failure_rate: '175.00%',
          critical_failure_rate: '650.00%',
          confidence_score: 100,
          status: 'Universal CFR calculated successfully'
        }
      },
      '30d': {
        repository: {
          name: 'react',
          owner: 'facebook',
          full_name: 'facebook/react',
          url: 'https://github.com/facebook/react'
        },
        deployment_frequency: {
          total_deployments: 15,
          analysis_period_days: 30,
          frequency_per_day: '0.500',
          frequency_per_week: '3.000',
          frequency_per_month: '7.500'
        },
        lead_time: {
          average_days: '1.47',
          min_days: '0.00',
          max_days: '8.32',
          total_prs_analyzed: 69,
          status: 'Valid lead times calculated'
        },
        mttr: {
          average_days: '1.22',
          min_days: '0.00',
          max_days: '8.32',
          total_incidents_analyzed: 100,
          status: 'Valid MTTR calculated'
        },
        change_failure_rate: {
          total_deployments: 15,
          deployment_failures: 10,
          general_issues: 0,
          critical_failures: 64,
          failure_rate: '0.00%',
          deployment_failure_rate: '66.67%',
          critical_failure_rate: '426.67%',
          confidence_score: 100,
          status: 'Universal CFR calculated successfully'
        }
      },
      '90d': {
        repository: {
          name: 'react',
          owner: 'facebook',
          full_name: 'facebook/react',
          url: 'https://github.com/facebook/react'
        },
        deployment_frequency: {
          total_deployments: 16,
          analysis_period_days: 90,
          frequency_per_day: '0.178',
          frequency_per_week: '1.244',
          frequency_per_month: '5.333'
        },
        lead_time: {
          average_days: '1.89',
          min_days: '0.00',
          max_days: '15.23',
          total_prs_analyzed: 200,
          status: 'Valid lead times calculated'
        },
        mttr: {
          average_days: '1.45',
          min_days: '0.00',
          max_days: '15.23',
          total_incidents_analyzed: 300,
          status: 'Valid MTTR calculated'
        },
        change_failure_rate: {
          total_deployments: 16,
          deployment_failures: 25,
          general_issues: 5,
          critical_failures: 150,
          failure_rate: '31.25%',
          deployment_failure_rate: '156.25%',
          critical_failure_rate: '937.50%',
          confidence_score: 100,
          status: 'Universal CFR calculated successfully'
        }
      }
    };

    const mockAnalysis = {
      metadata: {
        name: 'react',
        url: 'https://github.com/facebook/react',
        description: 'The library for web and native user interfaces.',
        stars: 239237,
        forks: 49408,
        primary_language: 'JavaScript',
        license: 'MIT License',
        created_at: '2013-05-24T16:15:54Z',
        updated_at: '2025-09-25T17:22:09Z'
      },
      metrics: mockMetrics,
      insights: [
        'Excellent deployment frequency with 4 deployments in the last 7 days',
        'Good lead time performance with average 1.20 days',
        'Strong MTTR with average 0.89 days for incident resolution',
        'Moderate change failure rate at 25% - room for improvement',
        'Consistent performance across 7-day, 30-day, and 90-day periods',
        'Large contributor base with 30 active contributors',
        'Strong community engagement with 239K stars and 49K forks'
      ],
      recommendations: [
        'Consider implementing automated testing to reduce change failure rate',
        'Monitor deployment frequency trends to maintain current performance',
        'Continue current incident response practices for MTTR',
        'Review change management processes to improve failure rates'
      ]
    };

    getRepositoryInfo.mockResolvedValue(mockRepoInfo);
    getDORAMetrics.mockResolvedValue(mockMetrics);
    analyzeRepository.mockResolvedValue(mockAnalysis);
    runAIAnalysis.mockResolvedValue();
  });

  afterAll(async () => {
    // Clean up
    await User.deleteMany({});
    await Team.deleteMany({});
    await RepoMetrics.deleteMany({});
  });

  describe('Complete User Journey', () => {
    test('should complete full user journey: register → login → create team → view metrics', async () => {
      // Step 1: User Registration
      const userData = {
        name: 'E2E Test User',
        email: 'e2e@example.com',
        password: 'password123',
        role: 'developer'
      };

      // Mock bcrypt
      const bcrypt = require('bcrypt');
      bcrypt.hash.mockResolvedValue('hashed_password');
      bcrypt.compare.mockResolvedValue(true);

      const registerResponse = await request(app)
        .post('/api/register')
        .send(userData);

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body.user.email).toBe('e2e@example.com');

      // Step 2: User Login
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: 'e2e@example.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.user.email).toBe('e2e@example.com');

      // Step 3: Create Team
      const teamData = {
        name: 'E2E Test Team',
        password: 'team123',
        repoUrl: 'https://github.com/facebook/react'
      };

      // Mock JWT verification
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
        callback(null, { userId: registerResponse.body.user._id, email: 'e2e@example.com', role: 'developer' });
      });

      const teamResponse = await request(app)
        .post('/api/teams')
        .set('Cookie', 'token=valid_jwt_token')
        .send(teamData);

      expect(teamResponse.status).toBe(201);
      expect(teamResponse.body.team.name).toBe('E2E Test Team');

      // Step 4: View Team Details
      const teamDetailsResponse = await request(app)
        .get('/api/teams/E2E%20Test%20Team')
        .set('Cookie', 'token=valid_jwt_token');

      expect(teamDetailsResponse.status).toBe(200);
      expect(teamDetailsResponse.body.team.name).toBe('E2E Test Team');
      expect(teamDetailsResponse.body.doraMetrics).toBeDefined();
      expect(teamDetailsResponse.body.repositoryInfo).toBeDefined();

      // Step 5: View User Profile
      const profileResponse = await request(app)
        .get('/api/profile')
        .set('Cookie', 'token=valid_jwt_token');

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.user.teams).toHaveLength(1);
      expect(profileResponse.body.user.teams[0].name).toBe('E2E Test Team');
    });
  });

  describe('MCP Integration Workflow', () => {
    test('should complete MCP tool workflow: repo info → metrics → analysis', async () => {
      // Setup MCP authentication
      process.env.MCP_API_TOKEN = 'test-mcp-token';

      // Step 1: Get Repository Information
      const repoResponse = await request(app)
        .get('/api/mcp/repo?url=https://github.com/facebook/react')
        .set('x-mcp-token', 'test-mcp-token');

      expect(repoResponse.status).toBe(200);
      expect(repoResponse.body.name).toBe('react');
      expect(repoResponse.body.full_name).toBe('facebook/react');
      expect(repoResponse.body.stars).toBe(239237);

      // Step 2: Get DORA Metrics
      const metricsResponse = await request(app)
        .get('/api/mcp/metrics?repositoryUrl=https://github.com/facebook/react')
        .set('x-mcp-token', 'test-mcp-token');

      expect(metricsResponse.status).toBe(200);
      expect(metricsResponse.body['7d']).toBeDefined();
      expect(metricsResponse.body['30d']).toBeDefined();
      expect(metricsResponse.body['90d']).toBeDefined();
      expect(metricsResponse.body['7d'].deployment_frequency.total_deployments).toBe(4);

      // Step 3: Get Repository Analysis
      const analysisResponse = await request(app)
        .get('/api/mcp/analyze?url=https://github.com/facebook/react')
        .set('x-mcp-token', 'test-mcp-token');

      expect(analysisResponse.status).toBe(200);
      expect(analysisResponse.body.metadata.name).toBe('react');
      expect(analysisResponse.body.insights).toHaveLength(7);
      expect(analysisResponse.body.recommendations).toHaveLength(4);

      // Cleanup
      delete process.env.MCP_API_TOKEN;
    });
  });

  describe('Team Collaboration Workflow', () => {
    test('should complete team collaboration: create team → join team → view shared metrics', async () => {
      // Setup users
      const bcrypt = require('bcrypt');
      bcrypt.hash.mockResolvedValue('hashed_password');
      bcrypt.compare.mockResolvedValue(true);

      const user1 = new User({
        name: 'Team Creator',
        email: 'creator@example.com',
        password: 'hashed_password',
        role: 'developer'
      });
      await user1.save();

      const user2 = new User({
        name: 'Team Member',
        email: 'member@example.com',
        password: 'hashed_password',
        role: 'developer'
      });
      await user2.save();

      // Step 1: User 1 creates team
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
        callback(null, { userId: user1._id.toString(), email: 'creator@example.com', role: 'developer' });
      });

      const teamData = {
        name: 'Collaboration Team',
        password: 'team123',
        repoUrl: 'https://github.com/facebook/react'
      };

      const createResponse = await request(app)
        .post('/api/teams')
        .set('Cookie', 'token=valid_jwt_token')
        .send(teamData);

      expect(createResponse.status).toBe(201);

      // Step 2: User 2 joins team
      jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
        callback(null, { userId: user2._id.toString(), email: 'member@example.com', role: 'developer' });
      });

      const joinResponse = await request(app)
        .post('/api/teams/join')
        .set('Cookie', 'token=valid_jwt_token')
        .send({
          name: 'Collaboration Team',
          password: 'team123'
        });

      expect(joinResponse.status).toBe(200);

      // Step 3: Both users can view team details
      const teamDetailsResponse = await request(app)
        .get('/api/teams/Collaboration%20Team')
        .set('Cookie', 'token=valid_jwt_token');

      expect(teamDetailsResponse.status).toBe(200);
      expect(teamDetailsResponse.body.team.members).toHaveLength(2);

      // Step 4: Verify team membership in user profiles
      const profileResponse = await request(app)
        .get('/api/profile')
        .set('Cookie', 'token=valid_jwt_token');

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.user.teams).toHaveLength(1);
      expect(profileResponse.body.user.teams[0].name).toBe('Collaboration Team');
    });
  });

  describe('Error Recovery Workflow', () => {
    test('should handle and recover from various error scenarios', async () => {
      // Test 1: Invalid registration data
      const invalidRegisterResponse = await request(app)
        .post('/api/register')
        .send({
          name: 'Test',
          email: 'invalid-email',
          password: '123' // Too short
        });

      expect(invalidRegisterResponse.status).toBe(400);

      // Test 2: Login with non-existent user
      const invalidLoginResponse = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(invalidLoginResponse.status).toBe(401);

      // Test 3: Create team with invalid repository
      const bcrypt = require('bcrypt');
      bcrypt.hash.mockResolvedValue('hashed_password');

      const user = new User({
        name: 'Error Test User',
        email: 'error@example.com',
        password: 'hashed_password',
        role: 'developer'
      });
      await user.save();

      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
        callback(null, { userId: user._id.toString(), email: 'error@example.com', role: 'developer' });
      });

      analyzeRepository.mockRejectedValue(new Error('Repository not found'));

      const invalidTeamResponse = await request(app)
        .post('/api/teams')
        .set('Cookie', 'token=valid_jwt_token')
        .send({
          name: 'Error Team',
          password: 'team123',
          repoUrl: 'https://github.com/invalid/repo'
        });

      expect(invalidTeamResponse.status).toBe(500);

      // Test 4: MCP authentication failure
      const mcpResponse = await request(app)
        .get('/api/mcp/repo?url=https://github.com/facebook/react')
        .set('x-mcp-token', 'invalid-token');

      expect(mcpResponse.status).toBe(403);
    });
  });

  describe('Performance and Scalability', () => {
    test('should handle multiple concurrent requests', async () => {
      // Setup
      const bcrypt = require('bcrypt');
      bcrypt.hash.mockResolvedValue('hashed_password');
      bcrypt.compare.mockResolvedValue(true);

      const users = [];
      for (let i = 0; i < 5; i++) {
        const user = new User({
          name: `Concurrent User ${i}`,
          email: `concurrent${i}@example.com`,
          password: 'hashed_password',
          role: 'developer'
        });
        await user.save();
        users.push(user);
      }

      // Mock JWT for all users
      const jwt = require('jsonwebtoken');
      jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
        callback(null, { userId: users[0]._id.toString(), email: 'concurrent0@example.com', role: 'developer' });
      });

      // Test concurrent team creation
      const teamPromises = [];
      for (let i = 0; i < 3; i++) {
        teamPromises.push(
          request(app)
            .post('/api/teams')
            .set('Cookie', 'token=valid_jwt_token')
            .send({
              name: `Concurrent Team ${i}`,
              password: 'team123',
              repoUrl: 'https://github.com/facebook/react'
            })
        );
      }

      const responses = await Promise.all(teamPromises);

      // Assert all teams created successfully
      responses.forEach(response => {
        expect(response.status).toBe(201);
      });

      // Verify all teams exist in database
      const teams = await Team.find({});
      expect(teams).toHaveLength(3);

      // Verify all repo metrics exist
      const repoMetrics = await RepoMetrics.find({});
      expect(repoMetrics).toHaveLength(3);
    });
  });
});