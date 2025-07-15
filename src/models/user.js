const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobileNumber: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  subscriptionTier: {
    type: String,
    enum: ['BASIC', 'PRO'],
    default: 'BASIC'
  },
  dailyPrompts: {
    type: Number,
    default: 5
  },
  stripeCustomerId: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);