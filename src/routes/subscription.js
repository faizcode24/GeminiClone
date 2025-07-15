const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const authMiddleware = require('../middleware/auth');

router.post('/pro', authMiddleware, subscriptionController.createCheckoutSession);
router.post('/webhook/stripe', subscriptionController.handleWebhook);
router.get('/status', authMiddleware, subscriptionController.getSubscriptionStatus);

module.exports = router;