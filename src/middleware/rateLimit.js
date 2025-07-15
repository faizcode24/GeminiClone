// // src/middleware/rateLimit.js
// const rateLimit = require('express-rate-limit');
// const RedisStore = require('rate-limit-redis');
// const Redis = require('ioredis');

// const redisClient = new Redis({
//   host: 'localhost',
//   port: 6379,
//   // password: 'yourpassword', // if required
// });

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   standardHeaders: true,
//   legacyHeaders: false,
//   store: RedisStore({
//     sendCommand: (...args) => redisClient.call(...args),
//   }),
// });

// module.exports = limiter; // ✅ export the middleware function directly

const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const redis = require('redis');

// Create a Redis client
const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379,
  // password: 'yourpassword' // optional
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    client: redisClient,
  }),
});

module.exports = limiter;
