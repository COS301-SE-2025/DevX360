// tests/unit/logout.test.js

const request = require('supertest');
const jwt = require('jsonwebtoken');

// We mock the User model so requiring it in app.js won't crash
jest.mock('../../models/User', () => ({}));

const app = require('../../app');

describe('POST /api/logout', () => {
  const SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

  it('returns 401 if no token is provided', async () => {
    const res = await request(app).post('/api/logout');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/access token required/i);
  });

  it('returns 401 if token is invalid', async () => {
    // Sign with wrong secret
    const badToken = jwt.sign({ userId: '123', email: 'x@x.com', role: 'user' }, 'wrong-secret');
    const res = await request(app)
      .post('/api/logout')
      .set('Authorization', `Bearer ${badToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/invalid or expired token/i);
  });

  it('logs out successfully with valid token', async () => {
    const validToken = jwt.sign(
      { userId: '123', email: 'x@x.com', role: 'user' },
      SECRET,
      { expiresIn: '1h' }
    );
    const res = await request(app)
      .post('/api/logout')
      .set('Authorization', `Bearer ${validToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Logout successful');
  });
});
