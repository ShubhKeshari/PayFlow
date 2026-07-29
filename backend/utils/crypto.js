import crypto from 'crypto';

/**
 * Verifies Razorpay Checkout Payment Signature
 * Formula: HMAC_SHA256(order_id + "|" + payment_id, secret)
 */
export const verifyRazorpaySignature = (orderId, paymentId, signature, secret) => {
  const body = `${orderId}|${paymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body.toString())
    .digest('hex');

  return expectedSignature === signature;
};

/**
 * Verifies Razorpay Webhook Signature
 * Formula: HMAC_SHA256(rawRequestBody, webhookSecret)
 */
export const verifyWebhookSignature = (rawBody, signature, webhookSecret) => {
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
};
