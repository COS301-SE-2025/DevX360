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
const TEST_DB_URI = process.env.TEST_DB_URI || 'mongodb://localhost:27017/devx360_test_comprehensive';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'user'
};

const testAdmin = {
  name: 'Admin User',
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin'
};

const testTeam = {
  name: 'Test Team',
  password: 'team123',
  repoUrl: 'https://github.com/expressjs/express'
};

describe('Comprehensive Unit Tests for DevX360 App', () => {
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

  describe('Health Check Endpoint', () => {
    it('should return health status when database is connected', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Authentication Endpoints', () => {
    describe('POST /api/register', () => {
      it('should register a new user successfully', async () => {
        const response = await request(app)
          .post('/api/register')
          .send(testUser)
          .expect(201);

        expect(response.body).toHaveProperty('message', 'Registration successful');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('email', testUser.email);
        expect(response.body.user).toHaveProperty('name', testUser.name);
        expect(response.headers['set-cookie']).toBeDefined();
      });

      it('should reject registration with missing fields', async () => {
        const response = await request(app)
          .post('/api/register')
          .send({ name: 'Test', email: 'test@example.com' })
          .expect(400);

        expect(response.body).toHaveProperty('message', 'Name, email, and password are required');
      });
    });

    describe('POST /api/login', () => {
      beforeEach(async () => {
        const hashedPassword = await bcrypt.hash(testUser.password, 10);
        await User.create({ ...testUser, password: hashedPassword });
      });

      it('should login user successfully', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({ email: testUser.email, password: testUser.password })
          .expect(200);

        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('email', testUser.email);
        expect(response.headers['set-cookie']).toBeDefined();
      });

      it('should reject login with missing credentials', async () => {
        const response = await request(app)
          .post('/api/login')
          .send({ email: testUser.email })
          .expect(400);

        expect(response.body).toHaveProperty('message', 'Email and password are required');
      });
    });
  });

  describe('Profile Management', () => {
    let testToken, testUserId;
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await User.create({ ...testUser, password: hashedPassword });
      testUserId = user._id;
      testToken = jwt.sign({ userId: testUserId, email: testUser.email, role: testUser.role }, 'test-secret');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .expect(401);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('User Management', () => {
    let adminToken, testAdminId;
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testAdmin.password, 10);
      const admin = await User.create({ ...testAdmin, password: hashedPassword });
      testAdminId = admin._id;
      adminToken = jwt.sign({ userId: testAdminId, email: testAdmin.email, role: 'admin' }, 'test-secret');
    });

    it('should reject non-admin access to /api/users', async () => {
      const userToken = jwt.sign({ userId: 'testUserId', email: 'test@example.com', role: 'user' }, 'test-secret');
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', `token=${userToken}`)
        .expect(403);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('Team Management', () => {
    let testToken, testUserId;
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      const user = await User.create({ ...testUser, password: hashedPassword });
      testUserId = user._id;
      testToken = jwt.sign({ userId: testUserId, email: testUser.email, role: testUser.role }, 'test-secret');
    });

    it('should reject team creation with missing fields', async () => {
      const response = await request(app)
        .post('/api/teams')
        .set('Cookie', `token=${testToken}`)
        .send({ name: 'Test Team' })
        .expect(403);
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