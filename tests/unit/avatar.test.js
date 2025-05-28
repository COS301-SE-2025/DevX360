// tests/unit/avatar.test.js

const request = require('supertest');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Mock User so app.js import won’t crash
jest.mock('../../models/User', () => ({}));

const app = require('../../app');

describe('POST /api/avatar', () => {
  const SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
  let validToken;

  beforeAll(() => {
    // sign a valid token
    validToken = jwt.sign(
      { userId: 'abc', email: 'a@b.com', role: 'user' },
      SECRET,
      { expiresIn: '1h' }
    );
  });

  it('returns 401 if no token is provided', async () => {
    const res = await request(app).post('/api/avatar');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/access token required/i);
  });

  it('returns 401 if token is invalid', async () => {
    const badToken = jwt.sign({ userId: 'x' }, 'wrong-secret');
    const res = await request(app)
      .post('/api/avatar')
      .set('Authorization', `Bearer ${badToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.message).toMatch(/invalid or expired token/i);
  });

  it('returns 400 if no file is uploaded', async () => {
    const res = await request(app)
      .post('/api/avatar')
      .set('Authorization', `Bearer ${validToken}`);
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('No file uploaded');
  });

  it('uploads file and returns filename & path', async () => {
    const buffer = Buffer.from('dummy image content');
    const res = await request(app)
      .post('/api/avatar')
      .set('Authorization', `Bearer ${validToken}`)
      .attach('avatar', buffer, 'avatar.png');

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'Avatar uploaded successfully');
    expect(typeof res.body.filename).toBe('string');
    expect(typeof res.body.path).toBe('string');
    // ensure the file actually exists on disk
    const uploadedPath = path.resolve(res.body.path);
    expect(fs.existsSync(uploadedPath)).toBe(true);

    // Clean up the uploaded file
    fs.unlinkSync(uploadedPath);
  });
});
