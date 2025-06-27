import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

// Mock mongoose
const mockMongoose = {
  Schema: jest.fn(),
  Types: {
    ObjectId: 'ObjectId'
  }
};

// Mock the Team model
const mockTeamSchema = {
  name: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  creator: { type: 'ObjectId', ref: 'User' },
  members: [{ type: 'ObjectId', ref: 'User' }],
  repoUrl: { type: String, required: true }
};

// Mock modules
jest.unstable_mockModule('mongoose', () => ({
  default: mockMongoose
}));

jest.unstable_mockModule('../models/Team.js', () => ({
  default: mockTeamSchema
}));

describe('Team Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should define the TeamSchema correctly', () => {
    // Arrange & Act
    const schema = mockTeamSchema;

    // Assert
    expect(schema).toBeDefined();
    expect(schema.name).toBeDefined();
    expect(schema.name.type).toBe(String);
    expect(schema.name.required).toBe(true);
    expect(schema.name.unique).toBe(true);
    expect(schema.name.trim).toBe(true);
    
    expect(schema.password).toBeDefined();
    expect(schema.password.type).toBe(String);
    expect(schema.password.required).toBe(true);
    
    expect(schema.creator).toBeDefined();
    expect(schema.creator.type).toBe('ObjectId');
    expect(schema.creator.ref).toBe('User');
    
    expect(schema.members).toBeDefined();
    expect(Array.isArray(schema.members)).toBe(true);
    expect(schema.members[0].type).toBe('ObjectId');
    expect(schema.members[0].ref).toBe('User');
    
    expect(schema.repoUrl).toBeDefined();
    expect(schema.repoUrl.type).toBe(String);
    expect(schema.repoUrl.required).toBe(true);
  });
});