const mongoose = require('mongoose');

const chatroomSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Chatroom', chatroomSchema);