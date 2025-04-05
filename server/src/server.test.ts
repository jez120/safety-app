import request from 'supertest';
import app from './server'; // Import the Express app instance

// Mock the pool query to prevent actual DB connection during basic tests
// More complex tests might need a test database or more sophisticated mocking
jest.mock('./db', () => ({
  query: jest.fn().mockResolvedValue({ rows: [{ now: new Date().toISOString() }] }), // Mock the 'SELECT NOW()' call
  on: jest.fn(), // Mock the event listener attachment
}));


describe('GET /', () => {
  it('should respond with 200 and welcome message', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Safety App Backend is Running!');
  });
});

// Add more describe blocks for other endpoints later (e.g., /api/auth/login)
