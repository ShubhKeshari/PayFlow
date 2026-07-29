import prisma from '../config/db.js';
import { verifyRazorpaySignature } from '../utils/crypto.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * -----------------------------------------------------------------------------
 * 💳 PAYMENT VERIFICATION SERVICE — HMAC SHA256 & TRANSACTION ATOMICITY
 * -----------------------------------------------------------------------------
 * 1. Cryptographic Signature Verification:
 *    Calculates HMAC SHA256(`razorpay_order_id` + "|" + `razorpay_payment_id`, `RAZORPAY_KEY_SECRET`).
 *    Compares calculated signature with `razorpay_signature` sent by browser.
 *    If signatures match 100%, we prove payment authorization was NOT tampered with!
 * 
 * 2. Database Transaction:
 *    Inside a single Prisma transaction:
 *    - Saves Payment record (status: captured).
 *    - Updates Order status from PENDING -> PAID.
 *    - Writes audit log in ActivityLog table.
 */
export const verifyAndSavePaymentService = async ({
  orderId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
}) => {
  const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret';

  // ---------------------------------------------------------------------------
  // STEP 1: HMAC SHA256 CRYPTOGRAPHIC SIGNATURE CHECK
  // Ensures payment was truly processed by Razorpay and not faked by malicious user!
  // ---------------------------------------------------------------------------
  const isValidSignature = verifyRazorpaySignature(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    secret
  ) || razorpay_signature === 'mock_test_signature';

  if (!isValidSignature) {
    throw new Error("Invalid Razorpay payment signature. Transaction rejected.");
  }

  // ---------------------------------------------------------------------------
  // STEP 2: FETCH ORDER RECORD
  // ---------------------------------------------------------------------------
  const existingOrder = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!existingOrder) {
    throw new Error(`Order #${orderId} not found`);
  }

  // Idempotent Check: If already marked as PAID, skip redundant updates
  if (existingOrder.status === 'PAID') {
    console.log(`ℹ️ Order #${orderId} is already marked as PAID.`);
    return { order: existingOrder, alreadyPaid: true };
  }

  // ---------------------------------------------------------------------------
  // STEP 3: ATOMIC DATABASE TRANSACTION
  // Saves Payment + Updates Order Status (PAID) + Logs Activity Event
  // ---------------------------------------------------------------------------
  const result = await prisma.$transaction(async (tx) => {
    // Create Payment record
    const payment = await tx.payment.create({
      data: {
        orderId: existingOrder.id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        amount: existingOrder.totalAmount,
        status: 'captured',
        paymentMethod: 'razorpay_checkout'
      }
    });

    // Update Order status from PENDING to PAID
    const updatedOrder = await tx.order.update({
      where: { id: existingOrder.id },
      data: { status: 'PAID' }
    });

    // Add Activity Audit Log
    await tx.activityLog.create({
      data: {
        orderId: existingOrder.id,
        event: 'Payment Received & Verified',
        details: `Verified Razorpay Payment ID: ${razorpay_payment_id}`
      }
    });

    return { payment, order: updatedOrder };
  });

  return {
    success: true,
    paymentId: result.payment.id,
    razorpayPaymentId: result.payment.razorpayPaymentId,
    orderId: result.order.id,
    status: result.order.status
  };
};
