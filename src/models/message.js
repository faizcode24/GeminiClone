const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  isFromUser: {
    type: Boolean,
    default: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  chatroomId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chatroom',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);