import { createOrderService, getOrderByIdService, getCustomerOrdersService } from '../services/order.service.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Order Controller
 * Thin HTTP handler layer for Order endpoints
 */
export const createOrder = async (req, res) => {
  try {
    const { customerDetails, cartItems, idempotencyKey } = req.body;

    if (!customerDetails || !customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      return res.status(400).json({
        success: false,
        message: "Missing required customer details (name, email, phone)"
      });
    }

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart items must be a non-empty array"
      });
    }

    const orderData = await createOrderService({
      customerDetails,
      cartItems,
      idempotencyKey
    });

    return res.status(201).json({
      success: true,
      message: "Order created with Razorpay payment authorization",
      data: orderData
    });
  } catch (error) {
    console.error("❌ Error creating order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during order creation"
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await getOrderByIdService(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error(`❌ Error fetching order ${req.params.id}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: error.message
    });
  }
};

/**
 * Get My Orders (For Logged In User)
 */
export const getMyOrders = async (req, res) => {
  try {
    const email = req.user?.email || req.query.email;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "User email required"
      });
    }

    const orders = await getCustomerOrdersService(email);
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error("❌ Error fetching user orders:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders history",
      error: error.message
    });
  }
};

/**
 * Download or Redirect to PDF Invoice (AWS S3 Link or Local Fallback)
 */
export const downloadInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Fetch order to retrieve the stored S3 invoice URL
    const order = await getOrderByIdService(orderId);

    if (order && order.invoiceUrl) {
      // If invoice is stored on AWS S3 or external URL, redirect directly
      if (order.invoiceUrl.startsWith('http://') || order.invoiceUrl.startsWith('https://')) {
        // If it's a local fallback API URL pointing to itself, prevent infinite redirect
        const isSelfUrl = order.invoiceUrl.includes(`/api/orders/invoice/${orderId}`);
        if (!isSelfUrl) {
          console.log(`🔗 [Order Controller] Redirecting client to AWS S3 invoice URL: ${order.invoiceUrl}`);
          return res.redirect(302, order.invoiceUrl);
        }
      }
    }

    // Fallback: Check local disk storage
    const pdfPath = path.join(__dirname, '..', 'invoices', `invoice_${orderId}.pdf`);
    if (fs.existsSync(pdfPath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice_${orderId}.pdf`);
      return res.sendFile(pdfPath);
    }

    return res.status(404).json({
      success: false,
      message: "PDF Invoice not found on S3 or still generating in background queue."
    });
  } catch (error) {
    console.error("❌ Download invoice error:", error);
    return res.status(500).json({
      success: false,
      message: "Error fetching PDF invoice",
      error: error.message
    });
  }
};
