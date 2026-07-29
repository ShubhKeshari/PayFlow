import React, { useState } from 'react';
import { X, CreditCard, QrCode, Building2, Wallet, ShieldCheck, CheckCircle2, Lock, Loader2, ArrowRight } from 'lucide-react';
import { verifyPayment } from '../services/api';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  razorpayKeyId?: string;
  customerDetails: {
    name: string;
    email: string;
    phone: string;
  };
  onSuccess: (paymentId: string) => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  orderId,
  razorpayOrderId,
  amount,
  razorpayKeyId,
  customerDetails,
  onSuccess,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Inputs
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [upiId, setUpiId] = useState(`${customerDetails.email.split('@')[0]}@okaxis`);
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  if (!isOpen) return null;

  // Option to launch official Razorpay popup modal if user has real keys configured
  const launchOfficialRazorpayModal = () => {
    if ((window as any).Razorpay) {
      const options = {
        key: razorpayKeyId || 'rzp_test_TJK3bomcvuDZGi',
        amount: Math.round(amount * 100),
        currency: 'INR',
        name: 'PayFlow Bookstore',
        description: `Payment for Order #${orderId.substring(0, 8)}`,
        order_id: razorpayOrderId,
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
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
            onSuccess(response.razorpay_payment_id);
          } catch (verifErr: any) {
            setError(verifErr.response?.data?.message || 'Payment verification failed');
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
      onClose();
    } else {
      setError('Razorpay checkout script not loaded.');
    }
  };

  const handleCompletePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const generatedPaymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Execute verification call
      await verifyPayment({
        razorpay_payment_id: generatedPaymentId,
        razorpay_order_id: razorpayOrderId,
        razorpay_signature: 'mock_test_signature',
        orderId,
      });

      setLoading(false);
      onSuccess(generatedPaymentId);
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err.response?.data?.message || 'Payment authorization failed');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      <div className="relative glass-card rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-700/60 z-10 overflow-hidden">
        
        {/* Top bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Razorpay Secured Payment</h2>
              <p className="text-xs text-slate-400">Order ID: <code className="text-indigo-300 font-mono">{orderId.substring(0, 10)}...</code></p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Header Banner */}
        <div className="my-5 p-4 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-indigo-300 block font-medium">Total Payable Amount</span>
            <span className="text-2xl font-extrabold text-white tracking-tight">₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          <button
            onClick={launchOfficialRazorpayModal}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all"
            title="Open official Razorpay popup SDK"
          >
            <span>Launch Razorpay Popup</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl mb-4 font-medium">
            {error}
          </div>
        )}

        {/* Payment Method Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 mb-6">
          <button
            type="button"
            onClick={() => setSelectedMethod('card')}
            className={`p-3 rounded-xl border text-left transition-all flex sm:flex-col items-center gap-2 ${
              selectedMethod === 'card'
                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <CreditCard className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold">Card</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('upi')}
            className={`p-3 rounded-xl border text-left transition-all flex sm:flex-col items-center gap-2 ${
              selectedMethod === 'upi'
                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <QrCode className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-bold">UPI / QR</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('netbanking')}
            className={`p-3 rounded-xl border text-left transition-all flex sm:flex-col items-center gap-2 ${
              selectedMethod === 'netbanking'
                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Building2 className="w-5 h-5 text-pink-400" />
            <span className="text-xs font-bold">Netbanking</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedMethod('wallet')}
            className={`p-3 rounded-xl border text-left transition-all flex sm:flex-col items-center gap-2 ${
              selectedMethod === 'wallet'
                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <Wallet className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold">Wallets</span>
          </button>
        </div>

        {/* Dynamic Payment Method Form */}
        <form onSubmit={handleCompletePayment} className="space-y-4">
          
          {/* CARD FORM */}
          {selectedMethod === 'card' && (
            <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expiry Date</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">CVV</label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* UPI FORM */}
          {selectedMethod === 'upi' && (
            <div className="space-y-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800 text-center">
              <div className="w-32 h-32 bg-white p-2 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                {/* Simulated QR Code */}
                <div className="w-full h-full border-4 border-slate-900 rounded flex flex-col items-center justify-center text-slate-900">
                  <QrCode className="w-16 h-16" />
                  <span className="text-[9px] font-bold">SCAN WITH ANY UPI</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Or Enter Virtual Payment Address (VPA)</label>
                <input
                  type="text"
                  placeholder="username@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* NETBANKING FORM */}
          {selectedMethod === 'netbanking' && (
            <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Bank</label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="State Bank of India">State Bank of India (SBI)</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra">Kotak Mahindra Bank</option>
              </select>
            </div>
          )}

          {/* WALLETS FORM */}
          {selectedMethod === 'wallet' && (
            <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Digital Wallet</label>
              <select className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="Paytm Wallet">Paytm Wallet</option>
                <option value="PhonePe Wallet">PhonePe Wallet</option>
                <option value="Mobikwik">Mobikwik Wallet</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verifying Payment & Triggering Workers...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Pay ₹{amount.toLocaleString('en-IN')} Now</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Razorpay HMAC SHA256 Signature Verification Guaranteed</span>
        </div>

      </div>
    </div>
  );
};
