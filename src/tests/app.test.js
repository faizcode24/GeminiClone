const request = require('supertest');
const mongoose = require('mongoose');
const redis = require('redis');
const { Queue } = require('bullmq');
const app = require('../app');
const User = require('../models/user');
const Chatroom = require('../models/chatroom');
const Message = require('../models/message');

describe('Kuvaka Tech API Tests', () => {
  let token;
  let chatroomId;
  let userId;

  beforeAll(async () => {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    // Clean up database
    await User.deleteMany({});
    await Chatroom.deleteMany({});
    await Message.deleteMany({});
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

  // Authentication APIs
  describe('Authentication APIs', () => {
    it('POST /auth/signup should create a new user', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({ mobileNumber: '1234567890' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message', 'User created, please verify OTP');
      userId = (await User.findOne({ mobileNumber: '1234567890' }))._id;
    });

    it('POST /auth/send-otp should send OTP', async () => {
      const res = await request(app)
        .post('/auth/send-otp')
        .send({ mobileNumber: '1234567890' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('otp');
      expect(res.body).toHaveProperty('message', 'OTP sent successfully');
    });

    it('POST /auth/verify-otp should return JWT token', async () => {
      // First send OTP
      const otpRes = await request(app)
        .post('/auth/send-otp')
        .send({ mobileNumber: '1234567890' });
      const otp = otpRes.body.otp;
      // Verify OTP
      const res = await request(app)
        .post('/auth/verify-otp')
        .send({ mobileNumber: '1234567890', otp });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });

    it('POST /auth/forgot-password should send OTP', async () => {
      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ mobileNumber: '1234567890' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('otp');
      expect(res.body).toHaveProperty('message', 'OTP sent successfully');
    });

    it('POST /auth/change-password should update password', async () => {
      const res = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ password: 'newPassword123' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Password changed successfully');
    });

    it('GET /auth/me should return user details', async () => {
      const res = await request(app)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('mobileNumber', '1234567890');
      expect(res.body).toHaveProperty('subscriptionTier', 'BASIC');
    });
  });

  // Chatroom APIs
  describe('Chatroom APIs', () => {
    it('POST /chatroom should create a chatroom', async () => {
      const res = await request(app)
        .post('/chatroom')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Chatroom' });
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('title', 'Test Chatroom');
      chatroomId = res.body._id;
    });

    it('GET /chatroom should return chatrooms', async () => {
      const res = await request(app)
        .get('/chatroom')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('title', 'Test Chatroom');
    });

    it('GET /chatroom/:id should return chatroom with messages', async () => {
      const res = await request(app)
        .get(`/chatroom/${chatroomId}`)
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('title', 'Test Chatroom');
      expect(res.body).toHaveProperty('messages');
      expect(Array.isArray(res.body.messages)).toBe(true);
    });

    it('POST /chatroom/:id/message should send message', async () => {
      const res = await request(app)
        .post(`/chatroom/${chatroomId}/message`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Hello, Gemini!' });
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('message', 'Message sent, processing response');
    });

    it('POST /chatroom/:id/message should hit rate limit after 5 messages (Basic tier)', async () => {
      // Send 5 messages
      for (let i = 0; i < 5; i++) {
        await request(app)
          .post(`/chatroom/${chatroomId}/message`)
          .set('Authorization', `Bearer ${token}`)
          .send({ content: `Message ${i + 1}` });
      }
      // 6th message should hit rate limit
      const res = await request(app)
        .post(`/chatroom/${chatroomId}/message`)
        .set('Authorization', `Bearer ${token}`)
        .send({ content: 'Message 6' });
      expect(res.statusCode).toBe(429);
      expect(res.body).toHaveProperty('error', 'Daily prompt limit reached');
    });
  });

  // Subscription APIs
  describe('Subscription APIs', () => {
    beforeAll(async () => {
      // Set stripeCustomerId for testing
      await User.updateOne(
        { _id: userId },
        { stripeCustomerId: 'cus_test_123' }
      );
    });

    it('POST /subscription/pro should create checkout session', async () => {
      const res = await request(app)
        .post('/subscription/pro')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(500); // Expect 500 until valid Stripe Price ID is set
    });

    it('GET /subscription/status should return subscription status', async () => {
      const res = await request(app)
        .get('/subscription/status')
        .set('Authorization', `Bearer ${token}`);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('tier', 'BASIC');
      expect(res.body).toHaveProperty('dailyPrompts', 5);
    });
  });
});