import prisma from '../config/db.js';

/**
 * -----------------------------------------------------------------------------
 * 📦 BULLMQ WORKER 1 — INVENTORY PROCESSOR
 * -----------------------------------------------------------------------------
 * Why Decouple Inventory Reduction into a Background Worker?
 * 1. Performance: Decrementing inventory in a background queue keeps payment verification (<20ms).
 * 2. Fault Isolation: If Email or PDF workers crash, inventory is still updated reliably.
 * 3. Race Condition Safety: Uses Prisma `stock: { decrement: item.quantity }` which translates to SQL
 *    `UPDATE "Book" SET stock = stock - N WHERE id = X`, preventing concurrency race conditions!
 */
export const processInventoryUpdate = async (orderId) => {
  console.log(`📦 [Worker 1: Inventory] Processing stock reduction for Order #${orderId}...`);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }
  });

  if (!order) {
    throw new Error(`[Worker 1] Order #${orderId} not found`);
  }

  // ---------------------------------------------------------------------------
  // ATOMIC STOCK DECREMENT TRANSACTION
  // ---------------------------------------------------------------------------
  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.book.update({
        where: { id: item.bookId },
        data: {
          stock: {
            decrement: item.quantity
          }
        }
      });
      console.log(`  └─ Stock decremented by ${item.quantity} for Book ID ${item.bookId}`);
    }

    // Record Activity Audit Log
    await tx.activityLog.create({
      data: {
        orderId: order.id,
        event: 'Inventory Updated',
        details: `Decremented stock for ${order.items.length} purchased book line-item(s)`
      }
    });
  });

  console.log(`✅ [Worker 1: Inventory] Stock successfully updated for Order #${orderId}`);
  return { success: true, orderId };
};
