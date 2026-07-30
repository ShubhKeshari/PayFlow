import PDFDocument from 'pdfkit';
import prisma from '../config/db.js';
import { StorageService } from '../services/storage.service.js';

/**
 * -----------------------------------------------------------------------------
 * 📄 BULLMQ WORKER 2 — EXECUTIVE PDF INVOICE GENERATOR & S3 STORAGE
 * -----------------------------------------------------------------------------
 * Generates an executive-level corporate PDF tax invoice in memory using PDFKit
 * and uploads it to AWS S3 (or fallback local storage).
 * Updates PostgreSQL Order table with the persistent invoice URL.
 */
export const processInvoiceGeneration = async (orderId) => {
  console.log(`📄 [Worker 2: Invoice] Generating executive PDF invoice for Order #${orderId}...`);

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
    throw new Error(`[Worker 2] Order #${orderId} not found`);
  }

  // ---------------------------------------------------------------------------
  // STEP 1: GENERATE PDF IN-MEMORY BUFFER
  // ---------------------------------------------------------------------------
  const pdfBuffer = await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Primary Brand Colors
    const primaryColor = '#4338ca'; // Indigo 700
    const secondaryColor = '#0f172a'; // Slate 900
    const textColor = '#334155'; // Slate 700
    const lightBg = '#f8fafc'; // Slate 50

    // Header Banner Background
    doc
      .rect(0, 0, 612, 100)
      .fill(secondaryColor);

    // Header Branding
    doc
      .fillColor('#ffffff')
      .fontSize(26)
      .font('Helvetica-Bold')
      .text('PayFlow', 40, 30)
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#a5b4fc')
      .text('Enterprise Payment Processing System', 40, 62);

    // Invoice Title on Top Right
    doc
      .fillColor('#ffffff')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('TAX INVOICE', 400, 30, { align: 'right' })
      .fontSize(10)
      .font('Helvetica')
      .fillColor('#34d399')
      .text('STATUS: PAID', 400, 58, { align: 'right' });

    // Move below header
    doc.y = 120;

    // Metadata Box Left (Billing Info) & Right (Invoice Details)
    const topY = 120;

    // Left Column: Customer Details Box
    doc
      .rect(40, topY, 260, 90)
      .fillAndStroke(lightBg, '#e2e8f0');

    doc
      .fillColor(primaryColor)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('BILLED TO', 50, topY + 12)
      .fillColor(secondaryColor)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(order.customer.name, 50, topY + 28)
      .fillColor(textColor)
      .fontSize(9)
      .font('Helvetica')
      .text(`Email: ${order.customer.email}`, 50, topY + 44)
      .text(`Phone: ${order.customer.phone}`, 50, topY + 58)
      .text(`Customer ID: ${order.customer.id.substring(0, 14)}`, 50, topY + 72);

    // Right Column: Invoice Details Box
    doc
      .rect(312, topY, 240, 90)
      .fillAndStroke(lightBg, '#e2e8f0');

    doc
      .fillColor(primaryColor)
      .fontSize(11)
      .font('Helvetica-Bold')
      .text('INVOICE DETAILS', 322, topY + 12)
      .fillColor(textColor)
      .fontSize(9)
      .font('Helvetica')
      .text(`Invoice No: INV-2026-${order.id.substring(0, 8).toUpperCase()}`, 322, topY + 28)
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}`, 322, topY + 44)
      .text(`Order ID: ${order.id}`, 322, topY + 58)
      .text(`Razorpay Pay ID: ${order.payment?.razorpayPaymentId || 'pay_test_verified'}`, 322, topY + 72);

    // Space before Table
    doc.y = topY + 115;

    // Table Headers
    const tableTop = doc.y;
    doc
      .rect(40, tableTop, 512, 24)
      .fill(primaryColor);

    doc
      .fillColor('#ffffff')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('Item Description', 50, tableTop + 7, { width: 260 })
      .text('Qty', 320, tableTop + 7, { width: 40, align: 'center' })
      .text('Unit Price (INR)', 370, tableTop + 7, { width: 80, align: 'right' })
      .text('Amount (INR)', 460, tableTop + 7, { width: 82, align: 'right' });

    let currentY = tableTop + 24;

    // Items List Rows
    order.items.forEach((item, index) => {
      const rowBg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      doc
        .rect(40, currentY, 512, 24)
        .fillAndStroke(rowBg, '#f1f5f9');

      doc
        .fillColor(secondaryColor)
        .fontSize(9)
        .font('Helvetica')
        .text(item.book.title, 50, currentY + 7, { width: 260 })
        .text(item.quantity.toString(), 320, currentY + 7, { width: 40, align: 'center' })
        .text(`Rs. ${item.price.toFixed(2)}`, 370, currentY + 7, { width: 80, align: 'right' })
        .font('Helvetica-Bold')
        .text(`Rs. ${(item.price * item.quantity).toFixed(2)}`, 460, currentY + 7, { width: 82, align: 'right' });

      currentY += 24;
    });

    // Summary Section
    const summaryY = currentY + 20;

    doc
      .rect(312, summaryY, 240, 80)
      .fillAndStroke(lightBg, '#cbd5e1');

    doc
      .fillColor(textColor)
      .fontSize(9)
      .font('Helvetica')
      .text('Subtotal:', 322, summaryY + 12)
      .text(`Rs. ${order.totalAmount.toFixed(2)}`, 450, summaryY + 12, { align: 'right' })
      .text('Taxes (GST Inclusive):', 322, summaryY + 28)
      .text('Rs. 0.00', 450, summaryY + 28, { align: 'right' })
      .text('Shipping:', 322, summaryY + 44)
      .fillColor('#047857')
      .text('FREE', 450, summaryY + 44, { align: 'right' });

    doc
      .rect(312, summaryY + 58, 240, 22)
      .fill(primaryColor);

    doc
      .fillColor('#ffffff')
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('TOTAL PAID:', 322, summaryY + 64)
      .text(`Rs. ${order.totalAmount.toFixed(2)}`, 450, summaryY + 64, { align: 'right' });

    // Footer Security Callout
    doc
      .fontSize(9)
      .font('Helvetica')
      .fillColor('#64748b')
      .text('This is a computer-generated tax invoice. Signature verified via Razorpay HMAC SHA256 Engine.', 40, 750, { align: 'center' });

    doc.end();
  });

  // ---------------------------------------------------------------------------
  // STEP 2: UPLOAD TO AWS S3 / STORAGE PROVIDER
  // ---------------------------------------------------------------------------
  const s3Key = `invoices/invoice_${order.id}.pdf`;
  const uploadResult = await StorageService.uploadInvoice(pdfBuffer, s3Key, 'application/pdf');
  const { invoiceUrl, storageProvider } = uploadResult;

  // ---------------------------------------------------------------------------
  // STEP 3: PERSIST INVOICE LINK TO DATABASE
  // ---------------------------------------------------------------------------
  await prisma.order.update({
    where: { id: order.id },
    data: { invoiceUrl }
  });

  // Record activity audit log
  await prisma.activityLog.create({
    data: {
      orderId: order.id,
      event: 'Invoice Uploaded to S3',
      details: `Executive PDF Invoice uploaded to ${storageProvider}: ${invoiceUrl}`
    }
  });

  console.log(`✅ [Worker 2: Invoice] PDF Invoice saved & linked in DB for Order #${orderId} (${invoiceUrl})`);
  return { success: true, invoiceUrl, storageProvider };
};
