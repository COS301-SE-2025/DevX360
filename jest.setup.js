// Jest setup file
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  connection: {
    on: jest.fn(),
    close: jest.fn()
  },
  set: jest.fn(),
  Schema: jest.fn(() => ({
    index: jest.fn(),
    pre: jest.fn(),
    methods: {},
    statics: {}
  })),
  model: jest.fn(() => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    drop: jest.fn()
  })),
  Types: {
    ObjectId: jest.fn(() => 'mock-object-id')
  }
}));

// Mock OpenAI
jest.mock('openai', () => {
  return {
    OpenAI: jest.fn(() => ({
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    }))
  };
});

// Set test timeout
// Note: jest.setTimeout should be called in individual test files, not in setup