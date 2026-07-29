import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { createOrder, verifyPayment } from '../services/api';
import { GoogleAuthModal } from '../components/GoogleAuthModal';
import { CreditCard, Lock, ArrowLeft, Loader2, User, Sparkles, LogIn, ShieldCheck } from 'lucide-react';

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

export const Checkout: React.FC = () => {
  const { cart, totalAmount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Freeze background screen scroll while on checkout page
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setAuthModalOpen(true);
    }
  }, [user]);

  const handleProceedToPayment = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (cart.length === 0) {
      setError('Your cart is empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Load Razorpay SDK
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        throw new Error('Razorpay SDK failed to load. Check your internet connection.');
      }

      const customerDetails = {
        name: user.name,
        email: user.email,
        phone: user.phone || '+91 9876543210',
      };

      // Invoke backend Order Creation API
      const orderPayload = {
        customerDetails,
        cartItems: cart.map((item) => ({
          bookId: item.book.id,
          quantity: item.quantity,
        })),
        idempotencyKey: `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      };

      const orderResponse = await createOrder(orderPayload);
      const { razorpayOrderId, razorpayKeyId, amount, orderId } = orderResponse.data;

      // LAUNCH OFFICIAL RAZORPAY CHECKOUT POPUP MODAL BY DEFAULT
      const options = {
        key: razorpayKeyId || 'rzp_test_TJK3bomcvuDZGi',
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'PayFlow Bookstore',
        description: `Payment for Order #${orderId.substring(0, 8)}`,
        order_id: razorpayOrderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '+91 9876543210',
        },
        theme: {
          color: '#6366f1',
        },
        handler: async function (response: any) {
          try {
            setLoading(true);
            await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            clearCart();
            navigate(`/success?orderId=${orderId}&paymentId=${response.razorpay_payment_id}`);
          } catch (verifErr: any) {
            console.error("❌ Payment Verification Error:", verifErr);
            setError(verifErr.response?.data?.message || 'Payment verification failed');
            setLoading(false);
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
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();

    } catch (err: any) {
      console.error("❌ Checkout Error:", err);
      setError(err.response?.data?.message || err.message || 'Checkout session initialization failed');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#030712] text-slate-100 font-sans">
        <Navbar />
        <div className="max-w-md mx-auto py-20 text-center px-4">
          <p className="text-slate-400 text-sm mb-4">No items in cart for checkout.</p>
          <Link to="/" className="text-indigo-400 font-semibold text-xs hover:underline">
            Return to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased overflow-hidden">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Cart</span>
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-indigo-400" />
              <span>Checkout</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Razorpay Verified Payment Authorization</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Customer Logged In Profile Box */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Verified Customer Profile</span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Logged in via Google. Receipt will be sent to your Google email.
              </p>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3.5 rounded-xl mb-4 font-medium">
                  {error}
                </div>
              )}

              {user ? (
                <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                      alt={user.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-700/60"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{user.name}</h4>
                      <p className="text-xs text-indigo-400 font-mono">{user.email}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Customer ID</span>
                      <span className="font-mono text-slate-200">{user.id.substring(0, 12)}...</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Authentication</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5" /> Google OAuth Verified
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-slate-950/60 border border-slate-800 rounded-2xl text-center">
                  <LogIn className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-bold mb-3">Google Login Required</p>
                  <button
                    onClick={() => setAuthModalOpen(true)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs"
                  >
                    Sign In with Google
                  </button>
                </div>
              )}
            </div>

            <div className="pt-6 mt-6">
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={loading || !user}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Opening Razorpay Modal...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Razorpay Payment (₹{totalAmount.toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sidebar Review */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
            <div>
              <h3 className="text-base font-bold text-white mb-4 pb-3 border-b border-slate-800 flex items-center justify-between">
                <span>Order Summary ({cart.length} items)</span>
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                {cart.map(({ book, quantity }) => (
                  <div key={book.id} className="flex justify-between items-center text-xs bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="font-bold text-slate-200 truncate">{book.title}</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Qty: {quantity} × ₹{book.price}</p>
                    </div>
                    <span className="font-extrabold text-indigo-300">₹{(book.price * quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 mt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-bold text-white">Grand Total</span>
                <span className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-indigo-300 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Official Razorpay Test Popup opens directly with UPI, Cards, Netbanking & Wallets.</span>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
        }}
      />

    </div>
  );
};
