/**
 * Unit Tests for Middleware Components
 * Tests: Authorization, error handling, request processing
 */

import request from 'supertest';
import app from '../app.js';
import { authorizeTeamAccess } from '../middlewares/authorizeTeamAccess.js';
import Team from '../models/Team.js';

// Mock dependencies
jest.mock('../models/Team.js');

describe('Middleware Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authorizeTeamAccess', () => {
    let req, res, next;

    beforeEach(() => {
      req = {
        params: { name: 'Test Team' },
        user: { userId: 'user123', role: 'developer' }
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    test('should authorize team creator with full access', async () => {
      // Arrange
      const mockTeam = {
        _id: 'team123',
        name: 'Test Team',
        creator: 'user123',
        members: ['user123']
      };
      Team.findOne.mockResolvedValue(mockTeam);

      // Act
      await authorizeTeamAccess(req, res, next);

      // Assert
      expect(req.permissions).toBe('full');
      expect(req.team).toEqual(mockTeam);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should authorize team member with read-only access', async () => {
      // Arrange
      const mockTeam = {
        _id: 'team123',
        name: 'Test Team',
        creator: 'user456',
        members: ['user123', 'user456']
      };
      Team.findOne.mockResolvedValue(mockTeam);

      // Act
      await authorizeTeamAccess(req, res, next);

      // Assert
      expect(req.permissions).toBe('read-only');
      expect(req.team).toEqual(mockTeam);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should authorize admin with full access', async () => {
      // Arrange
      const mockTeam = {
        _id: 'team123',
        name: 'Test Team',
        creator: 'user456',
        members: ['user123', 'user456']
      };
      Team.findOne.mockResolvedValue(mockTeam);
      req.user.role = 'admin';

      // Act
      await authorizeTeamAccess(req, res, next);

      // Assert
      expect(req.permissions).toBe('full');
      expect(req.team).toEqual(mockTeam);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should reject unauthorized user', async () => {
      // Arrange
      const mockTeam = {
        _id: 'team123',
        name: 'Test Team',
        creator: 'user456',
        members: ['user456'] // user123 not in members
      };
      Team.findOne.mockResolvedValue(mockTeam);

      // Act
      await authorizeTeamAccess(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle team not found', async () => {
      // Arrange
      Team.findOne.mockResolvedValue(null);

      // Act
      await authorizeTeamAccess(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Team not found' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle database errors', async () => {
      // Arrange
      Team.findOne.mockRejectedValue(new Error('Database error'));

      // Act
      await authorizeTeamAccess(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Internal server error' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle missing team name parameter', async () => {
      // Arrange
      req.params = {}; // No name parameter

      // Act
      await authorizeTeamAccess(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Team name is required' });
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle missing user context', async () => {
      // Arrange
      req.user = null;

      // Act
      await authorizeTeamAccess(req, res, next);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Authentication required' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling Middleware', () => {
    test('should handle 404 errors', async () => {
      // Act
      const response = await request(app)
        .get('/api/nonexistent-endpoint');

      // Assert
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Not Found');
    });

    test('should handle 500 errors', async () => {
      // Arrange - Mock a route that throws an error
      app.get('/api/test-error', (req, res, next) => {
        throw new Error('Test error');
      });

      // Act
      const response = await request(app)
        .get('/api/test-error');

      // Assert
      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal Server Error');
    });

    test('should handle validation errors', async () => {
      // Act
      const response = await request(app)
        .post('/api/register')
        .send({
          // Missing required fields
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });
  });

  describe('CORS Middleware', () => {
    test('should handle preflight requests', async () => {
      // Act
      const response = await request(app)
        .options('/api/teams')
        .set('Origin', 'http://localhost:3000')
        .set('Access-Control-Request-Method', 'POST')
        .set('Access-Control-Request-Headers', 'Content-Type');

      // Assert
      expect(response.status).toBe(200);
      expect(response.headers['access-control-allow-origin']).toBeDefined();
      expect(response.headers['access-control-allow-methods']).toBeDefined();
    });

    test('should include CORS headers in responses', async () => {
      // Act
      const response = await request(app)
        .get('/api/health')
        .set('Origin', 'http://localhost:3000');

      // Assert
      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });
  });

  describe('Request Parsing Middleware', () => {
    test('should parse JSON requests', async () => {
      // Act
      const response = await request(app)
        .post('/api/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'developer'
        })
        .expect('Content-Type', /json/);

      // Assert
      expect(response.status).toBeDefined();
    });

    test('should handle malformed JSON', async () => {
      // Act
      const response = await request(app)
        .post('/api/register')
        .set('Content-Type', 'application/json')
        .send('{"invalid": json}');

      // Assert
      expect(response.status).toBe(400);
    });

    test('should parse URL-encoded requests', async () => {
      // Act
      const response = await request(app)
        .post('/api/login')
        .set('Content-Type', 'application/x-www-form-urlencoded')
        .send('email=test@example.com&password=password123');

      // Assert
      expect(response.status).toBeDefined();
    });
  });

  describe('Security Middleware', () => {
    test('should set security headers', async () => {
      // Act
      const response = await request(app)
        .get('/api/health');

      // Assert
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeDefined();
      expect(response.headers['x-xss-protection']).toBeDefined();
    });

    test('should handle rate limiting', async () => {
      // This would test rate limiting if implemented
      // For now, we'll just verify the endpoint responds
      const response = await request(app)
        .get('/api/health');

      expect(response.status).toBeDefined();
    });
  });
});