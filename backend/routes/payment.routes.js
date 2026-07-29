import { Router } from 'express';
import { verifyPayment } from '../controllers/payment.controller.js';

const router = Router();

// POST /api/payments/verify - Verify Razorpay signature and update order status to PAID
router.post('/verify', verifyPayment);

export default router;
