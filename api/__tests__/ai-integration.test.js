import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Import the app
import app from '../app.js';

// Import models
import User from '../models/User.js';
import Team from '../models/Team.js';
import RepoMetrics from '../models/RepoMetrics.js';

// Test database configuration
const TEST_DB_URI = process.env.TEST_DB_URI || 'mongodb://localhost:27017/devx360_test_ai';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'user'
};

const testTeam = {
  name: 'Test Team',
  password: 'team123',
  repoUrl: 'https://github.com/expressjs/express'
};

describe('AI Integration Tests - Simplified', () => {
  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });
  
  beforeEach(async () => {
    await User.deleteMany({});
    await Team.deleteMany({});
    await RepoMetrics.deleteMany({});
    jest.clearAllMocks();
  });

  describe('GET /api/ai-review', () => {
    beforeEach(async () => {
      // Create test user, team, and metrics
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await User.create({ ...testUser, password: hashedPassword });
      const testUserId = user._id;
      
      const teamHashedPassword = await bcrypt.hash(testTeam.password, 12);
      const team = await Team.create({
        name: testTeam.name,
        password: teamHashedPassword,
        creator: testUserId,
        members: [testUserId],
        repoUrl: testTeam.repoUrl
      });

      await RepoMetrics.create({
        teamId: team._id,
        repoUrl: testTeam.repoUrl,
        owner: 'expressjs',
        repo: 'express',
        metrics: { test: 'data' },
        repositoryInfo: { name: 'express' },
        lastUpdated: new Date()
      });
    });

    it('should reject AI review without teamId', async () => {
      const response = await request(app)
        .get('/api/ai-review')
        .expect(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should handle non-existent team metrics', async () => {
      const fakeTeamId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get('/api/ai-review')
        .query({ teamId: fakeTeamId.toString() })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Route not found');
    });
  });
}); 