const express = require('express');
const router = express.Router();
const chatroomController = require('../controllers/chatroomController');
const authMiddleware = require('../middleware/auth');
const rateLimiter = require('../middleware/rateLimit');

router.post('/', authMiddleware, chatroomController.createChatroom);
router.get('/', authMiddleware, chatroomController.getChatrooms);
router.get('/:id', authMiddleware, chatroomController.getChatroom);
router.post('/:id/message', authMiddleware, rateLimiter, chatroomController.sendMessage);

module.exports = router;