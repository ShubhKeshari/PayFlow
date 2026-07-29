import nodemailer from 'nodemailer';
import prisma from '../config/db.js';
import dotenv from 'dotenv';
dotenv.config();

/**
 * -----------------------------------------------------------------------------
 * ✉️ BULLMQ WORKER 3 — EMAIL NOTIFICATION SERVICE
 * -----------------------------------------------------------------------------
 * Why Async Email Workers?
 * Sending emails involves connecting to SMTP servers (e.g. Gmail), which can take 1 to 3 seconds.
 * By running Nodemailer inside a BullMQ background worker, we prevent the user's browser checkout
 * from freezing while waiting for SMTP network responses!
 * 
 * SMTP Modes:
 * 1. Real SMTP Mode: When SMTP_USER & SMTP_PASS are set in backend/.env, dispatches directly to Gmail inbox.
 * 2. Sandbox Test Mode: Automatically creates an Ethereal SMTP test account and prints a clickable
 *    preview link in the backend logs (`🔗 [Email Preview Link]: https://ethereal.email/...`).
 */
export const processEmailNotification = async (orderId) => {
  console.log(`✉️ [Worker 3: Email] Preparing email confirmation for Order #${orderId}...`);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      customer: true,
      items: {
        include: { book: true }
      },
      payment: true
    }
  });

  if (!order) {
    throw new Error(`[Worker 3] Order #${orderId} not found`);
  }

  // ---------------------------------------------------------------------------
  // STEP 1: CONFIGURE NODEMAILER TRANSPORTER
  // ---------------------------------------------------------------------------
  let transporter;
  const isRealSmtpConfigured = process.env.SMTP_USER && process.env.SMTP_PASS && !process.env.SMTP_USER.includes('sandbox');

  if (isRealSmtpConfigured) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  } else {
    // Fallback: Generate Ethereal test SMTP account automatically
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (testErr) {
      console.warn("⚠️ Failed to generate Ethereal test account:", testErr.message);
    }
  }

  // ---------------------------------------------------------------------------
  // STEP 2: BUILD HTML EMAIL RECEIPT TEMPLATE
  // ---------------------------------------------------------------------------
  const bookItemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px;">${item.book.title}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-size: 13px;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-size: 13px; font-weight: bold;">₹${item.price.toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #4338ca; margin: 0; font-size: 24px;">PayFlow Bookstore</h1>
        <p style="color: #64748b; margin-top: 4px; font-size: 12px;">Payment Receipt & Order Confirmation</p>
      </div>

      <p style="font-size: 14px; color: #1e293b;">Hi <strong>${order.customer.name}</strong>,</p>
      <p style="font-size: 14px; color: #475569; line-height: 1.5;">Thank you for your purchase! Your payment has been successfully processed and verified.</p>
      
      <div style="background-color: #f8fafc; padding: 16px; border-radius: 12px; margin: 20px 0; border: 1px solid #f1f5f9;">
        <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Order ID:</strong> ${order.id}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Razorpay Payment ID:</strong> ${order.payment?.razorpayPaymentId || 'N/A'}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #334155;"><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
        <p style="margin: 4px 0; font-size: 14px; color: #047857;"><strong>Total Amount Paid:</strong> ₹${order.totalAmount.toFixed(2)}</p>
      </div>

      <h3 style="font-size: 15px; color: #0f172a; margin-top: 24px; margin-bottom: 12px;">Purchased Items</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #f1f5f9; color: #475569;">
            <th style="padding: 10px; text-align: left; font-size: 12px;">Book Title</th>
            <th style="padding: 10px; text-align: center; font-size: 12px;">Qty</th>
            <th style="padding: 10px; text-align: right; font-size: 12px;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${bookItemsHtml}
        </tbody>
      </table>

      <div style="text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Verified by Razorpay Payment Gateway • Powered by PayFlow</p>
      </div>
    </div>
  `;

  // ---------------------------------------------------------------------------
  // STEP 3: DISPATCH EMAIL VIA SMTP
  // ---------------------------------------------------------------------------
  try {
    if (!transporter) {
      console.warn("⚠️ No SMTP transporter available for sending email.");
      return { success: false };
    }

    const mailOptions = {
      from: process.env.SMTP_USER ? `"PayFlow" <${process.env.SMTP_USER}>` : '"PayFlow Bookstore" <noreply@payflow.com>',
      to: order.customer.email,
      subject: `PayFlow Order Receipt #${order.id.substring(0, 8)}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 [Worker 3: Email] Sent email to ${order.customer.email} (Message ID: ${info.messageId})`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`🔗 [Email Preview Link]: ${previewUrl}`);
    }

    // Record Activity Audit Log
    await prisma.activityLog.create({
      data: {
        orderId: order.id,
        event: 'Confirmation Email Sent',
        details: isRealSmtpConfigured
          ? `Dispatched real email to ${order.customer.email}`
          : `Dispatched test email to ${order.customer.email} (Preview: ${previewUrl || 'Ethereal'})`
      }
    });

    return { success: true, previewUrl };
  } catch (err) {
    console.error(`❌ [Worker 3: Email Error]: ${err.message}`);
    return { success: false, error: err.message };
  }
};
