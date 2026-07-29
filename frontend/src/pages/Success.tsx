import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchOrderById } from '../services/api';
import type { OrderDetails } from '../types';
import { Navbar } from '../components/Navbar';
import { CheckCircle2, Download, ArrowRight, Loader2, ShieldCheck, Mail, FileCheck, Package, ShoppingBag } from 'lucide-react';

export const Success: React.FC = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const paymentId = searchParams.get('paymentId');

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadOrder = async () => {
    if (orderId) {
      try {
        const data = await fetchOrderById(orderId);
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order confirmation:", err);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
    const interval = setInterval(loadOrder, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  const handleDownloadInvoice = () => {
    if (orderId) {
      window.open(`http://127.0.0.1:5000/api/orders/invoice/${orderId}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-300">Processing order confirmation...</p>
          </div>
        ) : (
          <div className="glass-card rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-slate-800">
            
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

            {/* Victory Header */}
            <div className="text-center pb-8 border-b border-slate-800/80 relative z-10">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-400 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
              </div>

              <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-extrabold rounded-full mb-3">
                <ShieldCheck className="w-4 h-4" />
                <span>Order Paid & Verified</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 tracking-tight">
                Order Confirmed!
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
                Thank you for your order. We have received your payment and dispatched your order details and tax invoice to your registered Gmail account.
              </p>
            </div>

            {/* Transaction Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-8">
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">Order Reference ID</span>
                <span className="text-xs font-mono font-bold text-indigo-300 truncate block mt-1.5">
                  #{orderId || 'N/A'}
                </span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">Razorpay Payment ID</span>
                <span className="text-xs font-mono font-bold text-purple-300 truncate block mt-1.5">
                  {paymentId || order?.payment?.razorpayPaymentId || 'pay_verified_test'}
                </span>
              </div>

              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
                <span className="text-[11px] text-slate-400 block font-medium uppercase tracking-wider">Total Paid</span>
                <span className="text-base font-extrabold text-emerald-400 block mt-1">
                  ₹{order ? order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
            </div>

            {/* Customer Fulfillment Pipeline Status */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 mb-8">
              <h3 className="text-sm font-bold text-white mb-4 pb-3 border-b border-slate-800/60 flex items-center justify-between">
                <span>Order Fulfillment Status</span>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  READY FOR DISPATCH
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                
                {/* Step 1 */}
                <div className="bg-slate-900/60 border border-emerald-500/30 p-3.5 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">VERIFIED</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">1. Payment Status</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Secured by Razorpay</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-slate-900/60 border border-indigo-500/30 p-3.5 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <ShoppingBag className="w-4 h-4 text-indigo-400" />
                    <span className="text-[10px] font-extrabold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">CONFIRMED</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">2. Item Reservation</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Stock Reserved</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-slate-900/60 border border-purple-500/30 p-3.5 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <FileCheck className="w-4 h-4 text-purple-400" />
                    <span className="text-[10px] font-extrabold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">READY</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">3. Tax Invoice</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Official PDF Receipt</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="bg-slate-900/60 border border-teal-500/30 p-3.5 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-2">
                    <Mail className="w-4 h-4 text-teal-400" />
                    <span className="text-[10px] font-extrabold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded">SENT</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">4. Email Receipt</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Dispatched to Gmail</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Order Items Breakdown */}
            {order?.items && order.items.length > 0 && (
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-6 mb-8">
                <h3 className="text-sm font-bold text-white mb-4 pb-3 border-b border-slate-800/60 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-400" />
                  <span>Purchased Items ({order.items.length})</span>
                </h3>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between bg-slate-900/60 border border-slate-800 p-3 rounded-xl">
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <img
                          src={item.book.imageUrl}
                          alt={item.book.title}
                          className="w-10 h-14 object-cover rounded-lg bg-slate-950 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{item.book.title}</h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">by {item.book.author}</p>
                          <p className="text-[11px] font-semibold text-indigo-300 mt-0.5">
                            Qty: {item.quantity} × ₹{item.price}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-extrabold text-white shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
              
              <button
                onClick={handleDownloadInvoice}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Executive Tax Invoice</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/orders"
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <span>My Orders</span>
                </Link>

                <Link
                  to="/"
                  className="w-full sm:w-auto px-5 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-md"
                >
                  <span>Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
};
