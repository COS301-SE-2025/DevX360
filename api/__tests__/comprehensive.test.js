// Set up test environment variables BEFORE any imports
process.env.JWT_SECRET = 'test-secret-key-for-jwt-signing';
process.env.MONGODB_URI = 'mongodb://localhost:27017/devx360_test_comprehensive';

import { jest } from '@jest/globals';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock mongoose and database operations
const mockUser = {
  _id: 'mock-user-id',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed-password',
  role: 'user',
  save: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnValue({
    _id: 'mock-user-id',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user'
  })
};

const mockTeam = {
  _id: 'mock-team-id',
  name: 'Test Team',
  description: 'Test Description',
  owner: 'mock-user-id',
  members: [],
  repositories: [],
  save: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnValue({
    _id: 'mock-team-id',
    name: 'Test Team',
    description: 'Test Description',
    owner: 'mock-user-id',
    members: [],
    repositories: []
  })
};

const mockRepoMetrics = {
  _id: 'mock-metrics-id',
  teamId: 'mock-team-id',
  repoUrl: 'https://github.com/test/repo',
  metrics: {},
  repositoryInfo: {},
  save: jest.fn().mockResolvedValue(true),
  toObject: jest.fn().mockReturnValue({
    _id: 'mock-metrics-id',
    teamId: 'mock-team-id',
    repoUrl: 'https://github.com/test/repo',
    metrics: {},
    repositoryInfo: {}
  })
};

// Mock the models
jest.unstable_mockModule('../models/User.js', () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 })
  }
}));

jest.unstable_mockModule('../models/Team.js', () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 })
  }
}));

jest.unstable_mockModule('../models/RepoMetrics.js', () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    find: jest.fn(),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: 0 })
  }
}));

// Mock bcrypt
jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn().mockResolvedValue(true)
  }
}));

// Mock mongoose connection
jest.unstable_mockModule('mongoose', () => ({
  default: {
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      readyState: 1,
      close: jest.fn().mockResolvedValue(true),
      dropDatabase: jest.fn().mockResolvedValue(true)
    }
  }
}));

// Import the app after mocks are set up
const { default: app } = await import('../app.js');
const { default: User } = await import('../models/User.js');
const { default: Team } = await import('../models/Team.js');
const { default: RepoMetrics } = await import('../models/RepoMetrics.js');

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
  description: 'Test Description',
  repoUrl: 'https://github.com/expressjs/express'
};

describe('Comprehensive Unit Tests for DevX360 App', () => {
  beforeEach(() => {
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
        // Mock User.findOne to return null (user doesn't exist)
        User.findOne.mockResolvedValue(null);
        // Mock User.create to return the mock user
        User.create.mockResolvedValue(mockUser);

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
      beforeEach(() => {
        // Mock User.findOne to return the mock user
        User.findOne.mockResolvedValue(mockUser);
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
    let testToken;
    beforeEach(() => {
      testToken = jwt.sign({ userId: 'mock-user-id', email: testUser.email, role: testUser.role }, process.env.JWT_SECRET);
      User.findById.mockResolvedValue(mockUser);
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .expect(401);
      expect(response.body).toHaveProperty('message');
    });

    it('should return profile with valid token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Cookie', `token=${testToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', testUser.email);
    });
  });

  describe('User Management', () => {
    let adminToken;
    beforeEach(() => {
      adminToken = jwt.sign({ userId: 'mock-admin-id', email: testAdmin.email, role: 'admin' }, process.env.JWT_SECRET);
      User.find.mockResolvedValue([mockUser]);
    });

    it('should reject non-admin access to /api/users', async () => {
      const userToken = jwt.sign({ userId: 'testUserId', email: 'test@example.com', role: 'user' }, process.env.JWT_SECRET);
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', `token=${userToken}`)
        .expect(403);
      expect(response.body).toHaveProperty('message');
    });

    it('should allow admin access to /api/users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', `token=${adminToken}`)
        .expect(200);
      
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });
  });

  describe('Team Management', () => {
    let testToken;
    beforeEach(() => {
      testToken = jwt.sign({ userId: 'mock-user-id', email: testUser.email, role: testUser.role }, process.env.JWT_SECRET);
      User.findById.mockResolvedValue(mockUser);
      Team.create.mockResolvedValue(mockTeam);
    });

    it('should create team successfully', async () => {
      const response = await request(app)
        .post('/api/teams')
        .set('Cookie', `token=${testToken}`)
        .send(testTeam)
        .expect(201);
      
      expect(response.body).toHaveProperty('message', 'Team created successfully');
      expect(response.body).toHaveProperty('team');
    });

    it('should reject team creation with missing fields', async () => {
      const response = await request(app)
        .post('/api/teams')
        .set('Cookie', `token=${testToken}`)
        .send({ name: 'Test Team' })
        .expect(400);
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