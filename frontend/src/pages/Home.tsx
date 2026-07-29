import React, { useEffect, useState } from 'react';
import type { Book } from '../types';
import { fetchBooks } from '../services/api';
import { BookCard } from '../components/BookCard';
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/CartDrawer';
import { Footer } from '../components/Footer';
import { Sparkles, Loader2, RefreshCw, ShieldCheck, Zap, BookOpen, Search, Award, X } from 'lucide-react';

export const Home: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState<boolean>(false);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBooks();
      setBooks(data);
    } catch (err: any) {
      console.error("Failed to load books:", err);
      setError(err.message || "Failed to retrieve catalog books from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const categories = ['All', 'System Design', 'Databases & Storage', 'Frontend & Web', 'Security & APIs'];

  const matchesCategory = (bookTitle: string, category: string) => {
    if (category === 'All') return true;
    const title = bookTitle.toLowerCase();
    if (category === 'Databases & Storage') return title.includes('data') || title.includes('database') || title.includes('redis') || title.includes('postgres');
    if (category === 'System Design') return title.includes('microservices') || title.includes('system') || title.includes('distributed') || title.includes('architecture');
    if (category === 'Frontend & Web') return title.includes('react') || title.includes('javascript') || title.includes('css') || title.includes('frontend') || title.includes('web');
    if (category === 'Security & APIs') return title.includes('security') || title.includes('trust') || title.includes('api');
    return true;
  };

  const filteredBooks = books.filter(
    (book) =>
      matchesCategory(book.title, selectedCategory) &&
      (book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans antialiased relative flex flex-col justify-between">
      <div>
        <Navbar
          onOpenCartDrawer={() => setIsCartDrawerOpen(true)}
        />

        <CartDrawer isOpen={isCartDrawerOpen} onClose={() => setIsCartDrawerOpen(false)} />

        {/* Full-Height Hero Section */}
        <section className="relative min-h-[80vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 overflow-hidden py-12">
          
          {/* Background Mesh Gradients */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[400px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-pink-600/10 blur-[130px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto text-center relative z-10 my-auto">
            
            {/* Executive Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-6 shadow-xl">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>CURATED SOFTWARE ENGINEERING LIBRARY • 2026 EDITION</span>
            </div>

            {/* E-Commerce Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-5xl mx-auto leading-[1.12]">
              Master Software Craftsmanship with <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">PayFlow Books</span>
            </h1>

            <p className="mt-5 text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
              Handpicked titles on System Design, Distributed Systems, Modern Databases, and Full Stack Architecture. Instant order confirmation & PDF tax invoices.
            </p>

            {/* E-Commerce Value Props Bar */}
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
              <div className="glass-card p-5 rounded-2xl text-center border border-slate-800/80">
                <Zap className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <span className="text-sm font-extrabold text-white block">Instant PDF Invoice</span>
                <span className="text-xs text-slate-400 font-medium">Automated Receipts</span>
              </div>

              <div className="glass-card p-5 rounded-2xl text-center border border-slate-800/80">
                <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                <span className="text-sm font-extrabold text-white block">Razorpay Secured</span>
                <span className="text-xs text-slate-400 font-medium">256-Bit Encrypted Payments</span>
              </div>

              <div className="glass-card p-5 rounded-2xl text-center border border-slate-800/80">
                <Award className="w-6 h-6 text-pink-400 mx-auto mb-2" />
                <span className="text-sm font-extrabold text-white block">Verified Authors</span>
                <span className="text-xs text-slate-400 font-medium">Industry Thought Leaders</span>
              </div>
            </div>

          </div>
        </section>

        {/* Main Catalog Container */}
        <main id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Catalog Section Header + Search & Category Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-800/80">
            
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-400" />
                <span>Explore Catalog</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Showing {filteredBooks.length} of {books.length} publications
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              
              {/* Catalog Search Bar */}
              <div className="relative min-w-[240px] sm:min-w-[280px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search catalog books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2 pl-10 pr-8 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

            </div>

          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <p className="text-sm font-semibold text-slate-300">Loading engineering catalog...</p>
              <p className="text-xs text-slate-500 mt-1">Connecting to PostgreSQL Database</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="glass-card rounded-2xl p-8 text-center max-w-md mx-auto border border-red-500/30">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4 font-bold">
                !
              </div>
              <h3 className="text-base font-bold text-white mb-2">Catalog Connection Error</h3>
              <p className="text-xs text-slate-400 mb-6">{error}</p>
              <button
                onClick={loadBooks}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          {/* Empty Search Result */}
          {!loading && !error && filteredBooks.length === 0 && (
            <div className="text-center py-16 glass-card rounded-3xl p-8 max-w-md mx-auto">
              <p className="text-slate-400 text-sm font-medium">No books matching "{searchTerm}"</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="mt-4 px-4 py-2 bg-slate-900 border border-slate-800 text-indigo-400 rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Books Grid */}
          {!loading && !error && filteredBooks.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}

        </main>
      </div>

      {/* Luxury E-Commerce Footer */}
      <Footer />
    </div>
  );
};
