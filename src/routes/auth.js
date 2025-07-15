const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/signup', authController.signup);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/forgot-password', authController.sendOTP);
router.post('/change-password', authMiddleware, authController.changePassword);
router.get('/me', authMiddleware, authController.getUser);

module.exports = router;