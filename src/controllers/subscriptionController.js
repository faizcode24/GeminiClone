const stripe = require('../services/stripe');
const User = require('../models/user');

const createCheckoutSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const session = await stripe.checkout.sessions.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [{
        price: 'price_...pro_plan_id', // Replace with actual Stripe price ID
        quantity: 1
      }],
      success_url: 'https://your-app/success',
      cancel_url: 'https://your-app/cancel'
    });
    
    res.json({ sessionId: session.id });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object;
      await User.updateOne(
        { stripeCustomerId: subscription.customer },
        { 
          subscriptionTier: 'PRO',
          dailyPrompts: 1000
        }
      );
    }
    
    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: 'Webhook error' });
  }
};

const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      tier: user.subscriptionTier,
      dailyPrompts: user.dailyPrompts
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { createCheckoutSession, handleWebhook, getSubscriptionStatus };