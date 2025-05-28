// tests/unit/health.test.js

const request = require('supertest');
const app = require('../../app');
const mongoose = require('mongoose');

describe('GET /api/health', () => {
  let originalReadyState;

  beforeAll(() => {
    // Save the real value
    originalReadyState = mongoose.connection.readyState;
  });

  afterAll(() => {
    // Restore it
    mongoose.connection.readyState = originalReadyState;
  });

  it('returns Connected when mongoose.readyState is 1', async () => {
    mongoose.connection.readyState = 1; // simulate connected
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: 'OK',
      database: 'Connected'
    });
    // timestamp is a valid ISO string
    expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
  });

  it('returns Disconnected when mongoose.readyState is not 1', async () => {
    mongoose.connection.readyState = 0; // simulate disconnected
    const res = await request(app).get('/api/health');

    expect(res.statusCode).toBe(200);
    expect(res.body).toMatchObject({
      status: 'OK',
      database: 'Disconnected'
    });
  });
});
