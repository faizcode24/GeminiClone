const bcrypt = require('bcrypt');
const User = require('../models/user');
const { generateToken } = require('../utils/jwt');
const redis = require('redis').createClient({ url: process.env.REDIS_URL });

redis.connect();

const signup = async (req, res) => {
  const { mobileNumber } = req.body;
  try {
    const existingUser = await User.findOne({ mobileNumber });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const user = new User({ mobileNumber });
    await user.save();
    res.status(201).json({ message: 'User created, please verify OTP' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const sendOTP = async (req, res) => {
  const { mobileNumber } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  try {
    await redis.setEx(`otp:${mobileNumber}`, 300, otp);
    res.json({ otp, message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const verifyOTP = async (req, res) => {
  const { mobileNumber, otp } = req.body;
  
  try {
    const storedOtp = await redis.get(`otp:${mobileNumber}`);
    if (storedOtp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    
    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const token = await generateToken({ id: user._id, mobileNumber });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const changePassword = async (req, res) => {
  const { password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: req.user.id },
      { password: hashedPassword }
    );
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { signup, sendOTP, verifyOTP, changePassword, getUser };