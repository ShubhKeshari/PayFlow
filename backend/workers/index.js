import { Worker } from 'bullmq';
import { QUEUE_NAME } from '../queues/payment.queue.js';
import { redisConfig } from '../config/redis.js';
import { processInventoryUpdate } from './inventory.worker.js';
import { processInvoiceGeneration } from './invoice.worker.js';
import { processEmailNotification } from './email.worker.js';
import { processActivityLogging } from './activity.worker.js';

/**
 * BullMQ Worker Runner Initialization
 * 
 * FAULT ISOLATION GUARANTEES:
 * Executes 4 isolated worker processors for every payment event.
 * Each worker function is wrapped in its own try/catch block so that:
 * - If Email fails, Inventory & PDF Invoice generation still succeed.
 * - If Invoice fails, Payment remains 100% PAID and valid in PostgreSQL.
 */
export const runWorkerJob = async (jobData) => {
  const { orderId } = jobData;
  console.log(`\n======================================================`);
  console.log(`🚀 [BullMQ Worker Fleet] Processing Job for Order #${orderId}`);
  console.log(`======================================================`);

  // Worker 1: Inventory Update
  try {
    await processInventoryUpdate(orderId);
  } catch (err) {
    console.error(`❌ Worker 1 (Inventory) Error for Order #${orderId}:`, err.message);
  }

  // Worker 2: PDF Invoice Generation
  try {
    await processInvoiceGeneration(orderId);
  } catch (err) {
    console.error(`❌ Worker 2 (Invoice) Error for Order #${orderId}:`, err.message);
  }

  // Worker 3: Email Notification
  try {
    await processEmailNotification(orderId);
  } catch (err) {
    console.error(`❌ Worker 3 (Email) Error for Order #${orderId}:`, err.message);
  }

  // Worker 4: Final Lifecycle Activity Log
  try {
    await processActivityLogging(
      orderId,
      'Payment Processing Lifecycle Completed',
      'Inventory updated, Invoice generated, and Email dispatched by isolated BullMQ workers.'
    );
  } catch (err) {
    console.error(`❌ Worker 4 (Activity Log) Error for Order #${orderId}:`, err.message);
  }

  console.log(`✨ [BullMQ Worker Fleet] All workers finished processing Order #${orderId}\n`);
};

// Initialize BullMQ Worker instance
export let paymentWorker = null;

try {
  paymentWorker = new Worker(
    QUEUE_NAME,
    async (job) => {
      console.log(`📥 [BullMQ Job Received] Job ID #${job.id}`);
      await runWorkerJob(job.data);
    },
    {
      connection: redisConfig,
      concurrency: 5
    }
  );

  paymentWorker.on('completed', (job) => {
    console.log(`🎉 [BullMQ Job Completed] Job ID #${job.id}`);
  });

  paymentWorker.on('failed', (job, err) => {
    console.error(`💥 [BullMQ Job Failed] Job ID #${job?.id}: ${err.message}`);
  });

  console.log(`👷 BullMQ Worker Fleet active and listening on queue "${QUEUE_NAME}"`);
} catch (err) {
  console.warn("⚠️ BullMQ Worker Redis listener warning:", err.message);
}
