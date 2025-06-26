import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Import the app
import app from '../app.js';

// Import models
import User from '../models/User.js';

// Test database configuration
const TEST_DB_URI = process.env.TEST_DB_URI || 'mongodb://localhost:27017/devx360_test_auth';

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
  role: 'user'
};

describe('Authentication Tests - Simplified', () => {
  beforeAll(async () => {
    await mongoose.connect(TEST_DB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    jest.clearAllMocks();
  });

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

    it('should reject registration with short password', async () => {
      const response = await request(app)
        .post('/api/register')
        .send({ ...testUser, password: '123' })
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Password must be at least 6 characters long');
    });

    it('should reject registration with existing email', async () => {
      // Create user first
      await User.create(testUser);

      const response = await request(app)
        .post('/api/register')
        .send(testUser)
        .expect(400);

      expect(response.body).toHaveProperty('message', 'User with this email already exists');
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

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({ email: 'nonexistent@example.com', password: testUser.password })
        .expect(401);

      expect(response.body).toHaveProperty('message', 'Invalid email');
    });
  });
}); 