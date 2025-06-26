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
const TEST_DB_URI = process.env.TEST_DB_URI || 'mongodb://localhost:27017/devx360_test_teams';

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

describe('Team Management Tests - Simplified', () => {
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

  describe('POST /api/teams', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await User.create({ ...testUser, password: hashedPassword });
    });

    it('should reject team creation with missing fields', async () => {
      const response = await request(app)
        .post('/api/teams')
        .send({ name: 'Test Team' })
        .expect(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject team creation with existing name', async () => {
      const hashedPassword = await bcrypt.hash(testTeam.password, 12);
      await Team.create({
        name: testTeam.name,
        password: hashedPassword,
        repoUrl: testTeam.repoUrl
      });
      const response = await request(app)
        .post('/api/teams')
        .send(testTeam)
        .expect(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/teams/join', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await User.create({ ...testUser, password: hashedPassword });
    });

    it('should reject joining non-existent team', async () => {
      const response = await request(app)
        .post('/api/teams/join')
        .send({ name: 'NonExistentTeam', password: 'password' })
        .expect(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/teams/:id', () => {
    it('should return 401 for non-existent team', async () => {
      const fakeTeamId = new mongoose.Types.ObjectId();
      const response = await request(app)
        .get(`/api/teams/${fakeTeamId}`)
        .expect(401);
      expect(response.body).toHaveProperty('message');
    });
  });
}); 