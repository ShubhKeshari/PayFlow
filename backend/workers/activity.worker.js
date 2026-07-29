import prisma from '../config/db.js';

/**
 * Worker 4 — Activity Logger
 * 
 * AUDIT TRAIL RECORDING:
 * Records audit logs into PostgreSQL ActivityLog model to track payment lifecycle events.
 */
export const processActivityLogging = async (orderId, eventName, details) => {
  console.log(`📊 [Worker 4: Activity Log] Recording event "${eventName}" for Order #${orderId}...`);

  const log = await prisma.activityLog.create({
    data: {
      orderId,
      event: eventName,
      details: details || `Event recorded at ${new Date().toISOString()}`
    }
  });

  console.log(`✅ [Worker 4: Activity Log] Log entry recorded: ID #${log.id}`);
  return log;
};
