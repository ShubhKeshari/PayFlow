import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, BookOpen, Package, LogOut, User as UserIcon } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { GoogleAuthModal } from './GoogleAuthModal';

interface NavbarProps {
  onOpenCartDrawer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCartDrawer }) => {
  const { totalItems, totalAmount } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition duration-300" />
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-700/60 shadow-xl">
                <BookOpen className="w-5 h-5 text-indigo-400 group-hover:rotate-6 transition-transform" />
              </div>
            </div>
            
            <div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-gradient block">
                PayFlow
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 block -mt-1">
                Bookstore Gateway
              </span>
            </div>
          </Link>

          {/* Right Navigation Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* My Orders Link */}
            {user && (
              <Link
                to="/orders"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  location.pathname === '/orders'
                    ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">My Orders</span>
              </Link>
            )}

            {/* Cart Button */}
            {onOpenCartDrawer ? (
              <button
                onClick={onOpenCartDrawer}
                className="relative group flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-extrabold">
                    {totalItems}
                  </span>
                )}
                {totalAmount > 0 && (
                  <span className="hidden lg:inline-block pl-1 border-l border-slate-700 text-indigo-300 font-extrabold">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                )}
              </button>
            ) : (
              <Link
                to="/cart"
                className="relative group flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-bold transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span className="hidden sm:inline">Cart</span>
                {totalItems > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-pink-500 text-white text-[10px] font-extrabold">
                    {totalItems}
                  </span>
                )}
                {totalAmount > 0 && (
                  <span className="hidden lg:inline-block pl-1 border-l border-slate-700 text-indigo-300 font-extrabold">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </span>
                )}
              </Link>
            )}

            {/* User Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <img
                    src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover bg-slate-800"
                  />
                  <span className="text-xs font-bold text-slate-200 hidden sm:inline max-w-[120px] truncate">
                    {user.name}
                  </span>
                </button>

                {/* Dropdown Menu (Logout only) */}
                {userDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50"
                    onMouseLeave={() => setUserDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-slate-800 mb-1">
                      <p className="text-xs font-bold text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 border border-indigo-400/30"
              >
                <UserIcon className="w-4 h-4" />
                <span>Google Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>

      {/* Google Auth Modal */}
      <GoogleAuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </header>
  );
};
