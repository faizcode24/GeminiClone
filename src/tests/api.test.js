const request = require('supertest');
const mongoose = require('mongoose');
const redis = require('redis');
const { Queue } = require('bullmq');
const app = require('../app');

describe('GET /', () => {
  beforeAll(async () => {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    // Close MongoDB connection
    await mongoose.connection.close();
    // Close Redis connections and BullMQ queue
    const redisClient = redis.createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
    await redisClient.flushAll();
    await redisClient.quit();
    const queue = new Queue('chat-queue', { connection: { url: process.env.REDIS_URL } });
    await queue.close();
  });

  it('should return Hello World!', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('Hello World!');
  });
});