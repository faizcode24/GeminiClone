const express = require('express');
const helmet = require('helmet');
const winston = require('winston');
const authRoutes = require('./routes/auth');
const chatroomRoutes = require('./routes/chatroom');
const subscriptionRoutes = require('./routes/subscription');
const errorMiddleware = require('./middleware/error');

const rateLimiter = require('./middleware/rateLimit');
const { connectDB } = require('./config');


const app = express();

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Middleware
app.use(helmet());
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use('/auth', authRoutes);
app.use('/chatroom', chatroomRoutes);
app.use('/subscription', subscriptionRoutes);

// Error handling
app.use(errorMiddleware);

// Database connection
connectDB().then(() => {
  logger.info('Database connected');
}).catch((err) => {
  logger.error('Database connection error:', err);
  process.exit(1);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));