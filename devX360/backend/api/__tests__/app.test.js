import { jest } from '@jest/globals';

global.fetch = jest.fn();

jest.unstable_mockModule('mongoose', () => ({
  default: {
    connection: { readyState: 1 }
  }
}));

jest.unstable_mockModule('bcryptjs', () => ({
  default: {
    hash: jest.fn(),
    compare: jest.fn()
  }
}));

jest.unstable_mockModule('jsonwebtoken', () => ({
  default: {
    sign: jest.fn(),
    verify: jest.fn()
  }
}));

jest.unstable_mockModule('fs', () => ({
  default: {
    existsSync: jest.fn(),
    unlinkSync: jest.fn()
  }
}));

jest.unstable_mockModule('multer', () => ({
  default: jest.fn(() => ({
    single: jest.fn(() => (req, res, next) => {
      req.file = { filename: 'test-avatar.jpg' };
      next();
    })
  }))
}));

jest.unstable_mockModule('cookie-parser', () => ({
  default: jest.fn(() => (req, res, next) => {
    const cookieHeader = req.headers?.cookie;
    if (cookieHeader) {
      req.cookies = Object.fromEntries(
        cookieHeader.split(';').map(cookie => {
          const [name, ...rest] = cookie.trim().split('=');
          return [name, decodeURIComponent(rest.join('='))];
        })
      );
    } else {
      req.cookies = {};
    }
    next();
  })
}));

jest.unstable_mockModule('cors', () => ({
  default: jest.fn(() => (req, res, next) => next())
}));

jest.unstable_mockModule('express-rate-limit', () => ({
  default: jest.fn(() => (req, res, next) => next())
}));

jest.unstable_mockModule('dotenv/config', () => ({}));

// Mock repository and services
jest.unstable_mockModule('../../Data Collection/repository-info-service.js', () => ({
  getRepositoryInfo: jest.fn()
}));

jest.unstable_mockModule('../../services/metricsService.js', () => ({
  analyzeRepository: jest.fn()
}));

jest.unstable_mockModule('../../services/analysisService.js', () => ({
  runAIAnalysis: jest.fn()
}));

// Mock models
jest.unstable_mockModule('../models/RepoMetrics.js', () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

jest.unstable_mockModule('../models/User.js', () => ({
  default: jest.fn().mockImplementation(function(userData) {
    this._id = 'user123';
    this.name = userData.name;
    this.email = userData.email;
    this.role = userData.role;
    this.password = userData.password;
    this.save = jest.fn().mockResolvedValue(this);
    this.toObject = jest.fn(() => ({
      _id: this._id,
      name: this.name,
      email: this.email,
      role: this.role
    }));
    return this;
  }),
  findOne: jest.fn(),
  findById: jest.fn(),
  find: jest.fn(),
  findByIdAndUpdate: jest.fn()
}));

jest.unstable_mockModule('../models/Team.js', () => ({
  default: jest.fn().mockImplementation(function(teamData) {
    this._id = 'team123';
    this.name = teamData.name;
    this.password = teamData.password;
    this.creator = teamData.creator;
    this.members = teamData.members;
    this.save = jest.fn().mockResolvedValue(this);
    return this;
  }),
  findOne: jest.fn(),
  find: jest.fn()
}));

jest.unstable_mockModule('../utils/auth.js', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  generateToken: jest.fn()
}));

// Set up environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';

const { default: request } = await import('supertest');
const { default: jwt } = await import('jsonwebtoken');
const { default: bcrypt } = await import('bcryptjs');
const { default: fs } = await import('fs');

// Import services and models
const { getRepositoryInfo } = await import('../../Data Collection/repository-info-service.js');
const { analyzeRepository } = await import('../../services/metricsService.js');
const { runAIAnalysis } = await import('../../services/analysisService.js');
const { default: RepoMetrics } = await import('../models/RepoMetrics.js');
const { default: User } = await import('../models/User.js');
const { default: Team } = await import('../models/Team.js');
const { hashPassword, comparePassword, generateToken } = await import('../utils/auth.js');

const { default: app } = await import('../app.js');

// Test data
const mockUser = {
  _id: 'user123',
  name: 'Test User',
  email: 'test@example.com',
  role: 'developer',
  password: 'hashedpassword',
  avatar: null,
  lastLogin: new Date(),
  save: jest.fn(),
  toObject: jest.fn(() => ({
    _id: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'developer',
  })),
};

const mockTeam = {
  _id: 'team123',
  name: 'Test Team',
  password: 'hashedpassword',
  creator: 'user123',
  members: [{ name: 'Bob', email: 'bob@example.com' }],
  save: jest.fn(),
};

const mockMetrics = {
  teamId: 'team123',
  metrics: {
    deploymentFrequency: 5,
    leadTime: 2.5,
    changeFailureRate: 0.1,
    recoveryTime: 1.2,
  },
  repositoryInfo: {
    url: 'https://github.com/test/repo',
    name: 'test-repo',
  },
  lastUpdated: new Date(),
  analysisStatus: 'completed',
  aiAnalysis: {
    insights: 'Great performance!',
    metadata: { version: '1.0' },
    lastAnalyzed: new Date(),
  },
};

const validToken = 'valid.jwt.token';
const mockJwtPayload = {
  userId: 'user123',
  email: 'test@example.com',
  role: 'developer',
};

describe('Express App Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup JWT verification
    jwt.verify.mockImplementation((token, secret, callback) => {
      if (token === validToken) {
        callback(null, mockJwtPayload);
      } else {
        callback(new Error('Invalid token'));
      }
    });
    
    // Setup auth utilities
    generateToken.mockReturnValue(validToken);
    hashPassword.mockResolvedValue('hashedpassword');
    comparePassword.mockResolvedValue(true);
    
    // Setup User model static methods
    User.findOne = jest.fn().mockResolvedValue(null);
    User.findById = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
    User.find = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue([mockUser])
    });
    User.findByIdAndUpdate = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });
    
    // Setup Team model static methods
    Team.findOne = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockTeam),
      }),
    });

    Team.find = jest.fn().mockReturnValue({
      select: jest.fn().mockResolvedValue([mockTeam])
    });
    
    // Setup RepoMetrics
    RepoMetrics.findOne.mockResolvedValue(mockMetrics);
    RepoMetrics.create.mockResolvedValue(mockMetrics);
    
    // Setup bcrypt
    bcrypt.hash.mockResolvedValue('hashedpassword');
    bcrypt.compare.mockResolvedValue(true);
    
    // Setup services
    analyzeRepository.mockResolvedValue({ metrics: mockMetrics.metrics });
    getRepositoryInfo.mockResolvedValue(mockMetrics.repositoryInfo);
    runAIAnalysis.mockImplementation(() => {});
    
    // Setup fetch
    global.fetch.mockImplementation((url) => {
      if (url.includes('localhost:11434')) {
        return Promise.resolve({ status: 200 });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    
    // Setup fs
    fs.existsSync.mockReturnValue(false);
    fs.unlinkSync.mockImplementation(() => {});
  });

  describe('POST /api/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'developer',
        });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Registration successful');
      expect(response.body.user).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({ name: 'Test User' });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Name, email, and password are required');
    });

    it('should return 400 if user already exists', async () => {
      User.findOne.mockResolvedValue(mockUser);
      
      const response = await request(app)
        .post('/api/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
          role: 'developer',
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User with this email already exists');
    });

    it('should return 400 if password is too short', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123',
          role: 'developer',
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Password must be at least 6 characters long');
    });
  });

  describe('POST /api/login', () => {
    it('should login user successfully', async () => {
      User.findOne.mockResolvedValue(mockUser);
      
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toBeDefined();
    });

    it('should return 400 if email or password missing', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ email: 'test@example.com' });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email and password are required');
    });

    it('should return 401 if user not found', async () => {
      User.findOne.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid email');
    });

    it('should return 401 if password is invalid', async () => {
      User.findOne.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(false);
      
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid password');
    });
  });

  describe('GET /api/profile', () => {
    it('should return user profile with authentication', async () => {
      Team.find.mockReturnValue({
        select: jest.fn().mockResolvedValue([{ name: 'Test Team' }])
      });
      
      const response = await request(app)
        .get('/api/profile')
        .set('Cookie', `token=${validToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app).get('/api/profile');
      
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('POST /api/teams', () => {
    it('should create team successfully', async () => {
      Team.findOne.mockResolvedValue(null);
      
      const response = await request(app)
        .post('/api/teams')
        .set('Cookie', `token=${validToken}`)
        .send({
          name: 'Test Team',
          password: 'teampassword',
          repoUrl: 'https://github.com/test/repo',
        });
      
      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Team created successfully');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/teams')
        .set('Cookie', `token=${validToken}`)
        .send({ name: 'Test Team' });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Missing fields');
    });

    it('should return 400 if team already exists', async () => {
      Team.findOne.mockResolvedValue(mockTeam);
      
      const response = await request(app)
        .post('/api/teams')
        .set('Cookie', `token=${validToken}`)
        .send({
          name: 'Test Team',
          password: 'teampassword',
          repoUrl: 'https://github.com/test/repo',
        });
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Team exists');
    });
  });

  describe('GET /api/teams/:name', () => {
    const mockTeam = {
      _id: 'team123',
      name: 'Test Team',
      password: 'hashedpassword',
      creator: 'user123',
      members: [{ name: 'Bob', email: 'bob@example.com' }],
    };

    afterEach(() => {
      jest.resetAllMocks();
    });

    it('should return team information', async () => {
      const finalResolved = Promise.resolve(mockTeam);

      const secondPopulate = jest.fn().mockReturnValue(finalResolved);
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });

      Team.findOne = jest.fn().mockReturnValue({ populate: firstPopulate });

      const response = await request(app)
        .get('/api/teams/Test%20Team')
        .set('Cookie', `token=${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.team).toBeDefined();
    });

    it('should return 404 if team not found', async () => {
      const finalResolved = Promise.resolve(null);

      const secondPopulate = jest.fn().mockReturnValue(finalResolved);
      const firstPopulate = jest.fn().mockReturnValue({ populate: secondPopulate });

      Team.findOne = jest.fn().mockReturnValue({ populate: firstPopulate });

      const response = await request(app)
        .get('/api/teams/Nonexistent')
        .set('Cookie', `token=${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Team not found');
    });
  });

  describe('GET /api/ai-review', () => {
    it('should return AI analysis when completed', async () => {
      const response = await request(app)
        .get('/api/ai-review?teamId=team123')
        .set('Cookie', `token=${validToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.aiFeedback).toBe('Great performance!');
      expect(response.body.status).toBe('completed');
    });

    it('should return 400 if teamId is missing', async () => {
      const response = await request(app)
        .get('/api/ai-review')
        .set('Cookie', `token=${validToken}`);
      
      expect(response.status).toBe(400);
      expect(response.body.message).toBe('teamId required');
    });

    it('should return 404 if metrics not found', async () => {
      RepoMetrics.findOne.mockResolvedValue(null);
      
      const response = await request(app)
        .get('/api/ai-review?teamId=team123')
        .set('Cookie', `token=${validToken}`);
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Metrics not found');
    });
  });

  describe('Authentication Middleware', () => {
    it('should return 403 for invalid token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Cookie', 'token=invalid.token');
      
      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Invalid or expired token');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-route');
      
      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Route not found');
    });
  });
});