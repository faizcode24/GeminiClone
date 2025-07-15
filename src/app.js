


// const express = require('express');
// const helmet = require('helmet');
// const winston = require('winston');
// const authRoutes = require('./routes/auth');
// const chatroomRoutes = require('./routes/chatroom');
// const subscriptionRoutes = require('./routes/subscription');
// const errorMiddleware = require('./middleware/error');
// const { connectDB } = require('./config');

// const app = express();

// // Logger setup
// const logger = winston.createLogger({
//   level: 'info',
//   format: winston.format.json(),
//   transports: [
//     new winston.transports.File({ filename: 'error.log', level: 'error' }),
//     new winston.transports.File({ filename: 'combined.log' })
//   ]
// });

// // Middleware
// app.use(helmet());
// app.use(express.json());

// // Routes
// app.use('/auth', authRoutes);
// app.use('/chatroom', chatroomRoutes);
// app.use('/subscription', subscriptionRoutes);

// // Test endpoint for GET /
// app.get('/', (req, res) => {
//   res.send('Hello World!');
// });

// // Error handling
// app.use(errorMiddleware);

// // Database connection
// connectDB().then(() => {
//   logger.info('Database connected');
// }).catch((err) => {
//   logger.error('Database connection error:', err);
//   process.exit(1);
// });

// // Start server only if not in test environment
// if (process.env.NODE_ENV !== 'test') {
//   const PORT = process.env.PORT || 3000;
//   app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));
// }

// module.exports = app;

require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const winston = require('winston');
const { connectDB } = require('./config'); // MongoDB connection
const authRoutes = require('./routes/auth');
const chatroomRoutes = require('./routes/chatroom');
const subscriptionRoutes = require('./routes/subscription');
const errorMiddleware = require('./middleware/error');
// const rateLimiter = require('./middleware/rateLimit'); // Uncomment if using

const app = express();

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// Middleware
app.use(helmet());
app.use(express.json());
// app.use(rateLimiter); // Uncomment if using

// Basic health check route
app.get('/', (req, res) => {
  res.send('✅ Gemini Clone Backend is Running');
});

// Routes
app.use('/auth', authRoutes);
app.use('/chatroom', chatroomRoutes);
app.use('/subscription', subscriptionRoutes);

// Error handling
app.use(errorMiddleware);

// Connect to MongoDB
connectDB()
  .then(() => logger.info('✅ MongoDB connected'))
  .catch((err) => {
    logger.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Start server (skip during test runs)
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
