import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

// Mock bcryptjs
const mockBcrypt = {
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
};
jest.unstable_mockModule('bcryptjs', () => ({
  default: mockBcrypt,
}));

// Mock jsonwebtoken
const mockJwt = {
  sign: jest.fn(),
};
jest.unstable_mockModule('jsonwebtoken', () => ({
  default: mockJwt,
}));

describe('Auth Utilities', () => {
  const originalEnv = process.env;
  let hashPassword, comparePassword, generateToken;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Set process.env.JWT_SECRET before importing the module
    process.env = { ...originalEnv, JWT_SECRET: 'test_secret' };
    // Dynamically import the module after setting process.env
    ({ hashPassword, comparePassword, generateToken } = await import('../utils/auth.js'));
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('hashPassword', () => {
    test('should hash a password using bcrypt', async () => {
      mockBcrypt.genSalt.mockResolvedValue('mockSalt');
      mockBcrypt.hash.mockResolvedValue('hashedPassword123');

      const hashedPassword = await hashPassword('plainPassword');

      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(12);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('plainPassword', 'mockSalt');
      expect(hashedPassword).toBe('hashedPassword123');
    });
  });

  describe('comparePassword', () => {
    test('should compare a plain password with a hashed password', async () => {
      mockBcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword('plainPassword', 'hashedPassword');

      expect(mockBcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
      expect(result).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      mockBcrypt.compare.mockResolvedValue(false);

      const result = await comparePassword('wrongPassword', 'hashedPassword');

      expect(result).toBe(false);
    });
  });

  describe('generateToken', () => {
    test('should generate a JWT token with default options', () => {
      const payload = { userId: '123' };
      mockJwt.sign.mockReturnValue('mockToken');

      const token = generateToken(payload);

      expect(mockJwt.sign).toHaveBeenCalledWith(payload, 'test_secret', { expiresIn: '7d' });
      expect(token).toBe('mockToken');
    });

    test('should generate a JWT token with custom secret and options', () => {
      const payload = { userId: '123' };
      const customSecret = 'custom_secret';
      const customOptions = { expiresIn: '1h' };
      mockJwt.sign.mockReturnValue('customMockToken');

      const token = generateToken(payload, customSecret, customOptions);

      expect(mockJwt.sign).toHaveBeenCalledWith(payload, customSecret, customOptions);
      expect(token).toBe('customMockToken');
    });
  });
});
