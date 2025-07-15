const Redis = require('redis');
const Chatroom = require('../models/chatroom');
const Message = require('../models/message');
const { chatQueue } = require('../services/queue');

const redis = Redis.createClient({ url: process.env.REDIS_URL });
redis.connect();

const createChatroom = async (req, res) => {
  const { title } = req.body;
  try {
    const chatroom = new Chatroom({
      title,
      userId: req.user.id
    });
    await chatroom.save();
    res.status(201).json(chatroom);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getChatrooms = async (req, res) => {
  const cacheKey = `chatrooms:${req.user.id}`;
  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }
    
    const chatrooms = await Chatroom.find({ userId: req.user.id });
    await redis.setEx(cacheKey, 600, JSON.stringify(chatrooms));
    res.json(chatrooms);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getChatroom = async (req, res) => {
  const { id } = req.params;
  try {
    const chatroom = await Chatroom.findOne({
      _id: id,
      userId: req.user.id
    });
    
    if (!chatroom) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }
    
    const messages = await Message.find({ chatroomId: id });
    res.json({ ...chatroom.toObject(), messages });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const sendMessage = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  try {
    const chatroom = await Chatroom.findOne({
      _id: id,
      userId: req.user.id
    });
    if (!chatroom) {
      return res.status(404).json({ error: 'Chatroom not found' });
    }
    
    const message = new Message({
      content,
      isFromUser: true,
      userId: req.user.id,
      chatroomId: id
    });
    await message.save();
    
    await chatQueue.add('process-message', {
      chatroomId: id,
      userId: req.user.id,
      content
    });
    
    res.json({ message: 'Message sent, processing response' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createChatroom, getChatrooms, getChatroom, sendMessage };