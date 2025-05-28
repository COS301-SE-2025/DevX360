const { hashPassword, comparePassword, generateToken } = require('../../utils/auth');
const jwt = require('jsonwebtoken');

describe('Auth Utils', () => {
  it('hashPassword should hash a password correctly', async () => {
    const password = 'myPassword123!';
    const hashed = await hashPassword(password);
    expect(hashed).not.toEqual(password);
    expect(typeof hashed).toBe('string');
  });

  it('comparePassword should validate the correct password', async () => {
    const password = 'myPassword123!';
    const hashed = await hashPassword(password);
    const isValid = await comparePassword(password, hashed);
    expect(isValid).toBe(true);
  });

  it('comparePassword should reject invalid password', async () => {
    const password = 'myPassword123!';
    const hashed = await hashPassword(password);
    const isValid = await comparePassword('wrongPassword', hashed);
    expect(isValid).toBe(false);
  });

  it('generateToken should return a valid JWT token', () => {
    const payload = { userId: '123', email: 'test@example.com', role: 'user' };
    const token = generateToken(payload);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.email).toBe(payload.email);
    expect(decoded.role).toBe(payload.role);
  });
});
