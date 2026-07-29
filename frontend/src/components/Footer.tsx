import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 font-sans py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/60">
          
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700/60 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-indigo-400 group-hover:rotate-6 transition-transform" />
            </div>
            <span className="text-lg font-extrabold tracking-tight text-gradient">
              PayFlow Bookstore
            </span>
          </Link>

          {/* Quick Links (Catalog removed) */}
          <nav className="flex items-center gap-6 text-xs font-semibold">
            <Link to="/orders" className="text-slate-300 hover:text-white transition-colors">My Orders</Link>
            <Link to="/cart" className="text-slate-300 hover:text-white transition-colors">Cart</Link>
            <Link to="/checkout" className="text-slate-300 hover:text-white transition-colors">Checkout</Link>
          </nav>

        </div>

        {/* Bottom Copyright & Ultra-Smooth Scroll Top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PayFlow Bookstore Gateway. All rights reserved.</p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors font-medium cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
};
