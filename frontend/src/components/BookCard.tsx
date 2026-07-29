import React, { useState } from 'react';
import type { Book } from '../types';
import { useCart } from '../context/CartContext';
import { ShoppingCart, Check, Box, Star, Eye } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onQuickView?: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onQuickView }) => {
  const { addToCart, cart } = useCart();
  const [added, setAdded] = useState(false);

  const cartItem = cart.find((item) => item.book.id === book.id);
  const currentQuantityInCart = cartItem ? cartItem.quantity : 0;
  const remainingStock = Math.max(0, book.stock - currentQuantityInCart);

  const handleAddToCart = () => {
    addToCart(book);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const getCategory = (title: string) => {
    if (title.toLowerCase().includes('data') || title.toLowerCase().includes('database') || title.toLowerCase().includes('redis') || title.toLowerCase().includes('postgres')) return 'Databases & Storage';
    if (title.toLowerCase().includes('microservices') || title.toLowerCase().includes('system') || title.toLowerCase().includes('distributed') || title.toLowerCase().includes('architecture')) return 'System Design';
    if (title.toLowerCase().includes('react') || title.toLowerCase().includes('javascript') || title.toLowerCase().includes('css') || title.toLowerCase().includes('frontend')) return 'Frontend & Web';
    if (title.toLowerCase().includes('security') || title.toLowerCase().includes('trust') || title.toLowerCase().includes('api')) return 'Security & APIs';
    return 'Engineering';
  };

  const category = getCategory(book.title);

  return (
    <div className="group relative glass-card rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300">
      
      {/* Top Media & Overlay Badges */}
      <div>
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
          <img
            src={book.imageUrl}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          
          {/* Category Tag */}
          <div className="absolute top-3 left-3">
            <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[10px] font-bold text-indigo-300 tracking-wide uppercase shadow-lg">
              {category}
            </span>
          </div>

          {/* Stock Badge (Default Stock = 10,000 baseline) */}
          <div className="absolute top-3 right-3">
            <div className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[10px] font-bold text-slate-300 flex items-center gap-1.5 shadow-lg">
              <Box className="w-3 h-3 text-emerald-400" />
              <span>Stock: <strong className="text-emerald-400">{remainingStock.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Quick Preview Hover Overlay */}
          {onQuickView && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/40 backdrop-blur-xs">
              <button
                onClick={() => onQuickView(book)}
                className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-semibold text-white flex items-center gap-1.5 shadow-xl hover:bg-slate-800 transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Quick View</span>
              </button>
            </div>
          )}
        </div>

        {/* Book Details */}
        <div className="p-5">
          <div className="flex items-center gap-1 text-amber-400 text-xs mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
            ))}
            <span className="text-[10px] text-slate-400 font-semibold ml-1">4.9 (High Demand)</span>
          </div>

          <h3 className="text-base font-bold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
            {book.title}
          </h3>

          <p className="text-xs font-medium text-slate-400 mt-1">
            by <span className="text-slate-300">{book.author}</span>
          </p>

          {book.description && (
            <p className="text-xs text-slate-400/90 mt-2.5 line-clamp-2 leading-relaxed font-normal">
              {book.description}
            </p>
          )}
        </div>
      </div>

      {/* Card Footer: Price & Single-Line Add Button */}
      <div className="p-5 pt-0 flex items-center justify-between gap-2 mt-3 border-t border-slate-800/60 pt-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400 block">Price</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-extrabold text-white tracking-tight">
              ₹{book.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          className={`px-3.5 py-2 rounded-xl font-extrabold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all duration-300 shadow-md active:scale-95 border whitespace-nowrap shrink-0 ${
            added
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/30'
              : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 border-indigo-400/40 text-white hover:shadow-indigo-500/30 hover:scale-[1.02]'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5 animate-bounce" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
