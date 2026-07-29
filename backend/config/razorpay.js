import Razorpay from 'razorpay';
import dotenv from 'dotenv';
dotenv.config();

// Razorpay SDK Initialization
const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key_id';
const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret';

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret
});

export const RAZORPAY_PUBLIC_KEY = keyId;
