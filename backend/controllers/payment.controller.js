import { verifyAndSavePaymentService } from '../services/payment.service.js';
import { enqueuePaymentJob } from '../queues/payment.queue.js';

/**
 * Payment Verification Controller
 * Verifies Razorpay payment signature synchronously and responds IMMEDIATELY to frontend.
 * Also enqueues async background job into BullMQ queue.
 */
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification parameters"
      });
    }

    // 1. Synchronous Verification & Order Status Update (PAID)
    const verificationResult = await verifyAndSavePaymentService({
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    // 2. Enqueue job into BullMQ for async background workers (Inventory, PDF Invoice, Email, Logs)
    try {
      await enqueuePaymentJob({
        orderId,
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        source: 'checkout_verification'
      });
    } catch (queueErr) {
      console.warn("⚠️ Queue enqueue notice:", queueErr.message);
    }

    // 3. Respond immediately to frontend (< 20ms)
    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      data: verificationResult
    });

  } catch (error) {
    console.error("❌ Payment Verification Error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Payment verification failed"
    });
  }
};
