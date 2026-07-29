import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import type { OrderDetails } from '../types';
import axios from 'axios';
import { Package, Download, Clock, ArrowLeft, Loader2, CreditCard } from 'lucide-react';
import { verifyPayment } from '../services/api';

const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const MyOrders: React.FC = () => {
  const { user, token } = useAuth();

  const [orders, setOrders] = useState<OrderDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimelineOrder, setSelectedTimelineOrder] = useState<OrderDetails | null>(null);
  const [payLoadingId, setPayLoadingId] = useState<string | null>(null);

  const fetchMyOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<{ success: boolean; data: OrderDetails[] }>(
        `http://127.0.0.1:5000/api/orders/my-orders?email=${encodeURIComponent(user.email)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setOrders(response.data.data);
    } catch (err: any) {
      console.error("Error fetching my orders:", err);
      setError(err.response?.data?.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, [user]);

  const handleDownloadInvoice = (orderId: string) => {
    window.open(`http://127.0.0.1:5000/api/orders/invoice/${orderId}`, '_blank');
  };

  const handlePayPendingOrder = async (order: OrderDetails) => {
    try {
      setPayLoadingId(order.id);
      await loadRazorpayScript();

      const options = {
        key: 'rzp_test_TJK3bomcvuDZGi',
        amount: Math.round(order.totalAmount * 100),
        currency: 'INR',
        name: 'PayFlow Bookstore',
        description: `Payment for Pending Order #${order.id.substring(0, 8)}`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: order.customer.name,
          email: order.customer.email,
          contact: order.customer.phone,
        },
        theme: {
          color: '#6366f1',
        },
        handler: async function (response: any) {
          try {
            await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.id,
            });
            setPayLoadingId(null);
            fetchMyOrders();
          } catch (verifErr: any) {
            console.error("Payment verification failed:", verifErr);
            setPayLoadingId(null);
          }
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay via UPI / QR Code',
                instruments: [
                  {
                    method: 'upi',
                  },
                ],
              },
              other: {
                name: 'Cards, Netbanking & Wallets',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' },
                ],
              },
            },
            sequence: ['block.upi', 'block.other'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        modal: {
          ondismiss: function () {
            setPayLoadingId(null);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error(err);
      setPayLoadingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 font-sans">
        <Navbar />
        <div className="max-w-md mx-auto py-20 text-center px-4">
          <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign in to view your orders</h2>
          <p className="text-slate-400 text-xs mb-6">Log in with Google to view purchases and download PDF invoices.</p>
          <Link
            to="/"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg inline-block"
          >
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-400" />
              <span>My Orders & Purchases</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Logged in as <strong className="text-slate-200">{user.email}</strong></p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 font-bold">
              Total Orders: {orders.length}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-sm font-semibold text-slate-400">Loading order history...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="glass-card border-red-500/20 p-6 rounded-2xl text-center max-w-md mx-auto my-10">
            <p className="text-red-400 text-xs font-semibold mb-3">{error}</p>
            <button
              onClick={fetchMyOrders}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold"
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && orders.length === 0 && (
          <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto my-12">
            <Package className="w-14 h-14 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No orders found</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6">
              You haven't placed any book orders yet. Browse our catalog to test the payment flow.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl text-xs font-bold shadow-lg inline-block"
            >
              Start Shopping
            </Link>
          </div>
        )}

        {/* Orders List */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-6">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="glass-card rounded-3xl p-6 border border-slate-800/80 hover:border-slate-700 transition-all shadow-xl"
              >
                {/* Order Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">#{ord.id}</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          ord.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Placed on {new Date(ord.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Show PDF Invoice ONLY if Order is PAID */}
                    {ord.status === 'PAID' ? (
                      <button
                        onClick={() => handleDownloadInvoice(ord.id)}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                        title="Download Executive PDF Invoice generated by Worker 2"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF Invoice</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePayPendingOrder(ord)}
                        disabled={payLoadingId === ord.id}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                      >
                        {payLoadingId === ord.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5" />
                        )}
                        <span>Complete Payment</span>
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedTimelineOrder(ord)}
                      className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Timeline</span>
                    </button>
                  </div>
                </div>

                {/* Items List */}
                <div className="py-4 space-y-3">
                  {ord.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                      <img
                        src={item.book.imageUrl}
                        alt={item.book.title}
                        className="w-12 h-16 object-cover rounded-lg bg-slate-900 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-white truncate">{item.book.title}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">by {item.book.author}</p>
                        <p className="text-xs font-semibold text-indigo-300 mt-1">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                      <span className="text-xs font-extrabold text-white">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div className="pt-4 border-t border-slate-800/80 flex justify-between items-center text-xs">
                  <div className="text-slate-400 text-[11px]">
                    {ord.payment?.razorpayPaymentId && (
                      <span>Razorpay Pay ID: <code className="text-slate-300">{ord.payment.razorpayPaymentId}</code></span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Total Payable</span>
                    <span className="text-lg font-extrabold text-emerald-400 tracking-tight">
                      ₹{ord.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>

      {/* Activity Logs Timeline Modal */}
      {selectedTimelineOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedTimelineOrder(null)} />
          <div className="relative glass-card rounded-3xl max-w-lg w-full p-6 shadow-2xl z-10">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>BullMQ Workers Audit Trail</span>
              </h3>
              <button onClick={() => setSelectedTimelineOrder(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {selectedTimelineOrder.activityLogs && selectedTimelineOrder.activityLogs.length > 0 ? (
                selectedTimelineOrder.activityLogs.map((log) => (
                  <div key={log.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                    <div className="flex justify-between items-center text-slate-200 font-bold mb-1">
                      <span>{log.event}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{new Date(log.createdAt).toLocaleTimeString()}</span>
                    </div>
                    {log.details && <p className="text-[11px] text-slate-400">{log.details}</p>}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic text-center py-4">No activity logs recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
