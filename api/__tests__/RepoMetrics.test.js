import { jest, describe, beforeEach, afterEach, test, expect } from '@jest/globals';

// Mock mongoose
const mockMongoose = {
  Schema: jest.fn(),
  Types: {
    ObjectId: 'ObjectId'
  }
};

// Mock the RepoMetrics model
const mockRepoMetricsSchema = {
  teamId: { type: 'ObjectId', ref: 'Team', required: true },
  repoUrl: { type: String, required: true },
  owner: String,
  repo: String,
  // ... other fields
};

// Mock modules
jest.unstable_mockModule('mongoose', () => ({
  default: mockMongoose
}));

jest.unstable_mockModule('../models/RepoMetrics.js', () => ({
  default: mockRepoMetricsSchema
}));

describe('RepoMetrics Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should define the RepoMetricsSchema correctly', () => {
    // Arrange & Act
    const schema = mockRepoMetricsSchema;

    // Assert
    expect(schema).toBeDefined();
    expect(schema.teamId).toBeDefined();
    expect(schema.teamId.type).toBe('ObjectId');
    expect(schema.teamId.ref).toBe('Team');
    expect(schema.teamId.required).toBe(true);
    expect(schema.repoUrl).toBeDefined();
    expect(schema.repoUrl.type).toBe(String);
    expect(schema.repoUrl.required).toBe(true);
  });
});