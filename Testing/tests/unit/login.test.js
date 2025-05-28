// tests/unit/login.test.js

const request = require('supertest');
const app = require('../../app');
const User = require('../../models/User.js');
const authUtils = require('../../utils/auth.js');

jest.mock('../../models/User.js');
jest.mock('../../utils/auth.js');

describe('POST /api/login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // default token
    authUtils.generateToken.mockReturnValue('jwt-token');
  });

  it('returns 400 if missing fields', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({}); // no email/password

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toMatch(/Email and password are required/);
  });

  it('returns 401 if user not found', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'nouser@example.com', password: 'whatever' });

    expect(User.findOne).toHaveBeenCalledWith({ email: 'nouser@example.com' });
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('returns 401 if password is invalid', async () => {
    // simulate existing user
    const fakeUser = { 
      _id: 'uid', 
      email: 'user@example.com', 
      password: 'hashed', 
      role: 'user',
      save: jest.fn().mockResolvedValue()
    };
    User.findOne.mockResolvedValue(fakeUser);
    // wrong password
    authUtils.comparePassword.mockResolvedValue(false);

    const res = await request(app)
      .post('/api/login')
      .send({ email: 'user@example.com', password: 'wrongpass' });

    expect(authUtils.comparePassword).toHaveBeenCalledWith('wrongpass', 'hashed');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid email or password');
  });

  it('logs in successfully, updates lastLogin, and returns token', async () => {
    // existing user with save stub
    const fakeUser = { 
      _id: 'uid-123', 
      name: 'Test User',
      email: 'user@test.com', 
      password: 'hashedPwd', 
      role: 'user',
      lastLogin: null,
      save: jest.fn().mockResolvedValue()
    };
    User.findOne.mockResolvedValue(fakeUser);
    authUtils.comparePassword.mockResolvedValue(true);

    const before = Date.now();
    const res = await request(app)
      .post('/api/login')
      .send({ email: 'user@test.com', password: 'rightpass' });
    const after = Date.now();

    // verify comparePassword called correctly
    expect(authUtils.comparePassword).toHaveBeenCalledWith('rightpass', 'hashedPwd');
    // verify lastLogin was set to a recent date
    expect(fakeUser.lastLogin).toBeInstanceOf(Date);
    expect(fakeUser.lastLogin.getTime()).toBeGreaterThanOrEqual(before);
    expect(fakeUser.lastLogin.getTime()).toBeLessThanOrEqual(after);

    // verify save called
    expect(fakeUser.save).toHaveBeenCalled();

    // verify response
    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      message: 'Login successful',
      token: 'jwt-token',
      userId: 'uid-123',
      role: 'user',
      user: {
        id: 'uid-123',
        name: 'Test User',
        email: 'user@test.com',
        role: 'user'
      }
    });
  });
});
