import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bookRoutes from './routes/book.routes.js';
import orderRoutes from './routes/order.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import authRoutes from './routes/auth.routes.js';

// -----------------------------------------------------------------------------
// 🚀 BULLMQ WORKER FLEET INITIALIZATION
// Importing this worker index file automatically spawns 4 background workers:
// 1. Inventory Worker (Decrements book stock in DB & Redis)
// 2. Invoice Worker (Generates executive PDF tax invoices using PDFKit)
// 3. Email Worker (Dispatches HTML receipts via Nodemailer/Gmail)
// 4. Activity Worker (Records lifecycle audit logs in PostgreSQL)
// -----------------------------------------------------------------------------
import './workers/index.js';

// Load environment variables from backend/.env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// -----------------------------------------------------------------------------
// 🌐 CORS (Cross-Origin Resource Sharing)
// Enables frontend (e.g. http://localhost:5173) to securely make HTTP requests
// to this backend server API.
// -----------------------------------------------------------------------------
app.use(cors());

// -----------------------------------------------------------------------------
// ⚠️ CRITICAL ARCHITECTURAL REQUIREMENT FOR WEBHOOKS:
// Razorpay Webhook signatures require the exact UNTOUCHED RAW BODY BUFFER
// to compute HMAC SHA256 checksums correctly.
// Therefore, /api/webhooks MUST be mounted BEFORE express.json() parses the body!
// -----------------------------------------------------------------------------
app.use('/api/webhooks', webhookRoutes);

// Global Body Parsers for standard JSON API requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------------------------------------------------
// 🗺️ API ROUTE REGISTRATION
// -----------------------------------------------------------------------------
app.use('/api/auth', authRoutes);       // Google OAuth Sign-In & JWT issuing
app.use('/api/books', bookRoutes);     // Book catalog retrieval & filtering
app.use('/api/orders', orderRoutes);   // Order creation, my-orders query & PDF invoice download
app.use('/api/payments', paymentRoutes); // Razorpay signature verification & verification

// -----------------------------------------------------------------------------
// 🩺 HEALTH CHECK ENDPOINT
// Used by load balancers and monitoring scripts to check server status.
// -----------------------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: 'PayFlow Payment Processing API',
    timestamp: new Date().toISOString()
  });
});

// -----------------------------------------------------------------------------
// 🛡️ GLOBAL ERROR HANDLING MIDDLEWARE
// Catches unhandled errors across async routes and returns a sanitized JSON response.
// -----------------------------------------------------------------------------
app.use((err, req, res, next) => {
  console.error("💥 Unhandled Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message
  });
});

// -----------------------------------------------------------------------------
// 📡 SERVER BOOTSTRAP
// Starts listening for incoming HTTP requests on the designated PORT (5000).
// -----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 PayFlow Backend Server running on http://localhost:${PORT}`);
  console.log(`🔑 Auth API: http://localhost:${PORT}/api/auth/google`);
  console.log(`📚 Books API: http://localhost:${PORT}/api/books`);
  console.log(`💳 Orders API: http://localhost:${PORT}/api/orders/create`);
  console.log(`✅ Payments Verification: http://localhost:${PORT}/api/payments/verify`);
  console.log(`🔔 Webhook Endpoint: http://localhost:${PORT}/api/webhooks/razorpay`);
});
