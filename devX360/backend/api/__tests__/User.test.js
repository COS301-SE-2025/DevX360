import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

// Mock mongoose
const mockSchema = {
  path: jest.fn(),
  methods: {},
};
const mockMongoose = {
  Schema: jest.fn(() => mockSchema),
  model: jest.fn(),
  Types: {
    ObjectId: jest.fn(),
  },
};

jest.unstable_mockModule('mongoose', () => ({
  default: mockMongoose,
}));

// Mock bcryptjs
const mockBcrypt = {
  compare: jest.fn(),
};
jest.unstable_mockModule('bcryptjs', () => ({
  default: mockBcrypt,
}));

describe('User Model', () => {
  let User;

  beforeEach(async () => {
    jest.clearAllMocks();
    // Dynamically import the User model after mocks are set up
    ({ default: User } = await import('../models/User.js'));
  });

  test('should define the UserSchema correctly', () => {
    // Verify that mongoose.Schema was called with the correct structure
    expect(mockMongoose.Schema).toHaveBeenCalledTimes(1);
    const schemaDefinition = mockMongoose.Schema.mock.calls[0][0];

    expect(schemaDefinition.name).toEqual({
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    });
    expect(schemaDefinition.email).toEqual({
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    });
    expect(schemaDefinition.password).toEqual({ type: String, required: true, minlength: 6 });
    expect(schemaDefinition.role).toEqual({ type: String, required: true, trim: true });
    expect(schemaDefinition.isEmailVerified).toEqual({ type: Boolean, default: false });
    expect(schemaDefinition.inviteCode).toEqual({ type: String, default: null });
    expect(schemaDefinition.createdAt).toEqual({ type: Date, default: Date.now });
    expect(schemaDefinition.lastLogin).toEqual({ type: Date, default: null });
    expect(schemaDefinition.avatar).toEqual({ type: String, default: null });

    // Verify that mongoose.model was called with the correct name and schema
    expect(mockMongoose.model).toHaveBeenCalledWith('User', mockSchema);
  });

  describe('comparePassword method', () => {
    test('should call bcrypt.compare with correct arguments', async () => {
      const userInstance = { password: 'hashedPassword' };
      mockBcrypt.compare.mockResolvedValue(true);

      // Manually call the method as it would be defined on the schema
      const result = await mockSchema.methods.comparePassword.call(userInstance, 'plainPassword');

      expect(mockBcrypt.compare).toHaveBeenCalledWith('plainPassword', 'hashedPassword');
      expect(result).toBe(true);
    });
  });
});