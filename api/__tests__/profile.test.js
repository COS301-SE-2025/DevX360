import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Import the app
import app from '../app.js';

// Import models
import User from '../models/User.js';
import Team from '../models/Team.js';

// Test database configuration
const TEST_DB_URI = process.env.TEST_DB_URI || 'mongodb://localhost:27017/devx360_test_profile';

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

describe('Profile Management Tests - Simplified', () => {
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
    jest.clearAllMocks();
  });

  describe('GET /api/profile', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/profile')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /api/profile', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .put('/api/profile')
        .send({ name: 'Updated Name' })
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/users', () => {
    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(401);

      expect(response.body).toHaveProperty('message');
    });
  });
}); 