/**
 * Unit Tests for MCP API Endpoints
 * Tests: Authentication, repository info, DORA metrics, analysis endpoints
 */

import request from 'supertest';
import app from '../app.js';

// Mock dependencies
jest.mock('../../Data Collection/repository-info-service.js', () => ({
  getRepositoryInfo: jest.fn()
}));

jest.mock('../../Data Collection/universal-dora-service.js', () => ({
  getDORAMetrics: jest.fn()
}));

jest.mock('../../services/metricsService.js', () => ({
  analyzeRepository: jest.fn()
}));

import { getRepositoryInfo } from '../../Data Collection/repository-info-service.js';
import { getDORAMetrics } from '../../Data Collection/universal-dora-service.js';
import { analyzeRepository } from '../../services/metricsService.js';

describe('MCP API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.MCP_API_TOKEN = 'test-mcp-token';
  });

  afterEach(() => {
    delete process.env.MCP_API_TOKEN;
  });

  describe('GET /api/mcp/repo', () => {
    test('should return repository info with valid token', async () => {
      // Arrange
      const mockRepoInfo = {
        name: 'test-repo',
        full_name: 'owner/test-repo',
        description: 'Test repository',
        stars: 100,
        forks: 50
      };
      getRepositoryInfo.mockResolvedValue(mockRepoInfo);

      // Act
      const response = await request(app)
        .get('/api/mcp/repo?url=https://github.com/owner/test-repo')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockRepoInfo);
      expect(getRepositoryInfo).toHaveBeenCalledWith('https://github.com/owner/test-repo');
    });

    test('should reject request without MCP token', async () => {
      // Act
      const response = await request(app)
        .get('/api/mcp/repo?url=https://github.com/owner/test-repo');

      // Assert
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('MCP token required');
    });

    test('should reject request with invalid MCP token', async () => {
      // Act
      const response = await request(app)
        .get('/api/mcp/repo?url=https://github.com/owner/test-repo')
        .set('x-mcp-token', 'invalid-token');

      // Assert
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Invalid MCP token');
    });

    test('should return 400 when url parameter is missing', async () => {
      // Act
      const response = await request(app)
        .get('/api/mcp/repo')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('url is required');
    });

    test('should handle repository info service errors', async () => {
      // Arrange
      getRepositoryInfo.mockRejectedValue(new Error('Repository not found'));

      // Act
      const response = await request(app)
        .get('/api/mcp/repo?url=https://github.com/owner/nonexistent')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
    });
  });

  describe('GET /api/mcp/metrics', () => {
    test('should return DORA metrics with valid token', async () => {
      // Arrange
      const mockMetrics = {
        '7d': {
          repository: { name: 'test-repo', owner: 'owner' },
          deployment_frequency: { total_deployments: 5 },
          lead_time: { average_days: '2.5' },
          mttr: { average_days: '1.2' },
          change_failure_rate: { failure_rate: '10%' }
        },
        '30d': {
          repository: { name: 'test-repo', owner: 'owner' },
          deployment_frequency: { total_deployments: 20 },
          lead_time: { average_days: '3.0' },
          mttr: { average_days: '1.5' },
          change_failure_rate: { failure_rate: '15%' }
        },
        '90d': {
          repository: { name: 'test-repo', owner: 'owner' },
          deployment_frequency: { total_deployments: 60 },
          lead_time: { average_days: '2.8' },
          mttr: { average_days: '1.3' },
          change_failure_rate: { failure_rate: '12%' }
        }
      };
      getDORAMetrics.mockResolvedValue(mockMetrics);

      // Act
      const response = await request(app)
        .get('/api/mcp/metrics?repositoryUrl=https://github.com/owner/test-repo')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMetrics);
      expect(getDORAMetrics).toHaveBeenCalledWith('https://github.com/owner/test-repo');
    });

    test('should return 400 when repositoryUrl parameter is missing', async () => {
      // Act
      const response = await request(app)
        .get('/api/mcp/metrics')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('repositoryUrl is required');
    });

    test('should handle DORA metrics service errors', async () => {
      // Arrange
      getDORAMetrics.mockRejectedValue(new Error('Failed to fetch metrics'));

      // Act
      const response = await request(app)
        .get('/api/mcp/metrics?repositoryUrl=https://github.com/owner/test-repo')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
    });
  });

  describe('GET /api/mcp/analyze', () => {
    test('should return repository analysis with valid token', async () => {
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

      // Act
      const response = await request(app)
        .get('/api/mcp/analyze?url=https://github.com/owner/test-repo')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAnalysis);
      expect(analyzeRepository).toHaveBeenCalledWith('https://github.com/owner/test-repo');
    });

    test('should return 400 when url parameter is missing', async () => {
      // Act
      const response = await request(app)
        .get('/api/mcp/analyze')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('url is required');
    });

    test('should handle analysis service errors', async () => {
      // Arrange
      analyzeRepository.mockRejectedValue(new Error('Analysis failed'));

      // Act
      const response = await request(app)
        .get('/api/mcp/analyze?url=https://github.com/owner/test-repo')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
    });
  });

  describe('GET /api/mcp/team/:teamName', () => {
    test('should return team data with valid token', async () => {
      // Arrange
      const mockTeamData = {
        team: {
          name: 'test-team',
          creator: { name: 'Creator', email: 'creator@example.com' },
          members: [{ name: 'Member', email: 'member@example.com' }]
        },
        repositoryInfo: { name: 'test-repo', url: 'https://github.com/owner/test-repo' },
        doraMetrics: { deployment_frequency: { total_deployments: 5 } },
        memberStats: { 'member1': { commits: 10, prs: 5 } },
        lastUpdated: '2025-01-01T00:00:00Z'
      };

      // Mock the database models
      const mockTeam = {
        _id: 'team1',
        name: 'test-team',
        creator: 'creator1',
        members: ['member1']
      };
      const mockRepoData = {
        repositoryInfo: { name: 'test-repo', url: 'https://github.com/owner/test-repo' },
        metrics: { deployment_frequency: { total_deployments: 5 } },
        memberStats: new Map([['member1', { commits: 10, prs: 5 }]]),
        lastUpdated: '2025-01-01T00:00:00Z'
      };

      // Mock Team.findOne
      jest.doMock('../../api/models/Team.js', () => ({
        findOne: jest.fn().mockResolvedValue(mockTeam)
      }));

      // Mock RepoMetrics.findOne
      jest.doMock('../../api/models/RepoMetrics.js', () => ({
        findOne: jest.fn().mockResolvedValue(mockRepoData)
      }));

      // Act
      const response = await request(app)
        .get('/api/mcp/team/test-team')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.team.name).toBe('test-team');
    });

    test('should return 404 for non-existent team', async () => {
      // Act
      const response = await request(app)
        .get('/api/mcp/team/nonexistent-team')
        .set('x-mcp-token', 'test-mcp-token');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Team not found');
    });
  });
});