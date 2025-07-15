const { Queue, Worker } = require('bullmq');
const { processGeminiMessage } = require('./gemini');
const Message = require('../models/message');
const winston = require('winston');

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Create BullMQ queue
const chatQueue = new Queue('chat-queue', {
  connection: { url: process.env.REDIS_URL }
});

// Worker to process messages
const worker = new Worker(
  'chat-queue',
  async (job) => {
    const { chatroomId, userId, content } = job.data;
    try {
      const response = await processGeminiMessage(content);
      
      await Message.create({
        content: response,
        isFromUser: false,
        userId,
        chatroomId
      });
      
      logger.info(`Processed message for chatroom ${chatroomId}`);
    } catch (error) {
      logger.error(`Error processing message: ${error.message}`);
      throw error;
    }
  },
  { connection: { url: process.env.REDIS_URL } }
);

// Handle worker events
worker.on('failed', (job, err) => {
  logger.error(`Job ${job.id} failed: ${err.message}`);
});

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

module.exports = { chatQueue };