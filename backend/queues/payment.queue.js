import { Queue } from 'bullmq';
import { redisConfig } from '../config/redis.js';

export const QUEUE_NAME = 'payment-processing';

// Initialize BullMQ Queue
export let paymentQueue = null;

try {
  paymentQueue = new Queue(QUEUE_NAME, {
    connection: redisConfig,
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      },
      removeOnComplete: 100,
      removeOnFail: 500
    }
  });

  paymentQueue.on('error', (err) => {
    console.warn(`⚠️ BullMQ Queue Error: ${err.message}`);
  });
} catch (err) {
  console.warn("⚠️ Redis connection unavailable for BullMQ queue initializing fallback.");
}

/**
 * Enqueue payment job for background workers
 */
export const enqueuePaymentJob = async (paymentData) => {
  if (!paymentQueue) {
    console.log(`ℹ️ [Queue Fallback] Enqueuing simulated payment job for Order #${paymentData.orderId}`);
    return { id: `sim_${Date.now()}` };
  }

  const jobId = `job_pay_${paymentData.orderId}_${Date.now()}`;
  
  const job = await paymentQueue.add('process-successful-payment', paymentData, {
    jobId,
  });

  console.log(`📥 Pushed job #${job.id} into queue "${QUEUE_NAME}" for Order #${paymentData.orderId}`);
  return job;
};
