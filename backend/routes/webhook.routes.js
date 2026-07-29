import { Router, raw } from 'express';
import { handleRazorpayWebhook } from '../controllers/webhook.controller.js';

const router = Router();

// Raw body parser middleware for HMAC SHA256 webhook signature verification
const rawBodySaver = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

// POST /api/webhooks/razorpay
router.post(
  '/razorpay',
  raw({ type: 'application/json', verify: rawBodySaver }),
  handleRazorpayWebhook
);

export default router;
