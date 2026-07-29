import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Navbar } from '../components/Navbar';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft, ShieldCheck, Tag } from 'lucide-react';

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Navigation Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Book Catalog</span>
        </Link>

        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Shopping Cart</h1>
              <p className="text-xs text-slate-400">Review selected engineering titles before payment</p>
            </div>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20"
            >
              Clear Cart
            </button>
          )}
        </div>

        {cart.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center max-w-md mx-auto my-12">
            <ShoppingBag className="w-14 h-14 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">Your cart is empty</h3>
            <p className="text-xs text-slate-400 mt-2 mb-6">
              Browse our catalog of 50 software engineering books and add items to your cart.
            </p>
            <Link
              to="/"
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/25 inline-block"
            >
              Explore Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map(({ book, quantity }) => (
                <div
                  key={book.id}
                  className="glass-card rounded-2xl p-4 sm:p-5 flex items-center gap-4 transition-all"
                >
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="w-16 h-22 object-cover rounded-xl bg-slate-900 shadow-md shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{book.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">by {book.author}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-extrabold text-indigo-400">
                        ₹{book.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-500 line-through">
                        ₹{(book.price * 1.25).toFixed(0)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-1 shadow-inner">
                    <button
                      onClick={() => updateQuantity(book.id, quantity - 1)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-white w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(book.id, quantity + 1)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Total & Remove */}
                  <div className="text-right flex flex-col items-end gap-3 pl-2">
                    <span className="text-sm font-bold text-white">
                      ₹{(book.price * quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                    <button
                      onClick={() => removeFromCart(book.id)}
                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Panel */}
            <div className="glass-card rounded-3xl p-6 h-fit sticky top-24 shadow-2xl">
              <h3 className="text-base font-bold text-white pb-4 border-b border-slate-800 flex items-center justify-between">
                <span>Order Summary</span>
                <Tag className="w-4 h-4 text-indigo-400" />
              </h3>

              <div className="py-4 space-y-3 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="font-semibold text-slate-200">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Standard Delivery</span>
                  <span className="font-semibold text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Razorpay Test Sandbox Fee</span>
                  <span className="font-semibold text-slate-200">₹0.00</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center mb-6">
                <span className="text-sm font-bold text-white">Total Amount</span>
                <span className="text-2xl font-extrabold text-emerald-400 tracking-tight">
                  ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 active:scale-95 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Verified 256-bit SSL Payment Gateway</span>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
};
