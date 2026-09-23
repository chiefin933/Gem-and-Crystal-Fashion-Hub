import React, { useState } from 'react';
import { Search, Heart, ShoppingBag, Menu } from 'lucide-react';
import { useStore } from '../../context/useStore';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTab, setCurrentTab, onOpenMobileMenu }) => {
  const { cartCount, wishlist, setIsCartOpen, setFilters } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters(prev => ({ ...prev, searchQuery, category: 'All' }));
      setCurrentTab('shop');
    }
  };

  const navLinks = [
    { id: 'home', label: 'HOME' },
    { id: 'women', label: 'WOMEN' },
    { id: 'men', label: 'MEN' },
    { id: 'about-us', label: 'ABOUT US' },
    { id: 'contact-us', label: 'CONTACT US' },
  ];

  const handleNavClick = (id: string) => {
    if (id === 'women') {
      setFilters(prev => ({ ...prev, gender: 'women', category: 'All', searchQuery: '' }));
      setCurrentTab('women-page');
    } else if (id === 'men') {
      setFilters(prev => ({ ...prev, gender: 'men', category: 'All', searchQuery: '' }));
      setCurrentTab('men-page');
    } else {
      setCurrentTab(id);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fffaf2]/95 backdrop-blur-md border-b border-[#d9cbb9]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mobile-safe-x">
        <div className="flex min-w-0 items-center justify-between h-16 sm:h-20 gap-1 sm:gap-3">
          
          {/* Mobile menu trigger */}
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open Mobile Menu"
            className="lg:hidden shrink-0 p-2 text-[#5e5147] hover:text-[#a45c25] transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo Section */}
          <div
            onClick={() => setCurrentTab('home')}
            className="min-w-0 flex items-center gap-2 sm:gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 shrink-0 bg-[#1c1713] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 9l10 13 10-13-10-7zm0 3.2L18.4 9H5.6L12 5.2z"/>
              </svg>
            </div>
            <div className="min-w-0 flex flex-col">
              <span className="font-serif whitespace-nowrap text-base sm:text-2xl font-bold tracking-wide sm:tracking-wider text-[#181411] group-hover:text-[#a45c25] transition-colors">
                GEM & CRYSTAL
              </span>
              <span className="hidden min-[381px]:block text-[10px] tracking-[0.25em] text-slate-400 font-medium">
                FASHION HUB
              </span>
            </div>
          </div>

          {/* Search bar desktop */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex items-center flex-1 max-w-md mx-8 relative"
          >
            <input
              type="text"
              placeholder="Search mom jeans, dresses, sneakers, jackets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#f5f0e8] border border-[#d9cbb9] py-2 pl-4 pr-10 text-xs text-[#181411] placeholder-[#8a7b6d] focus:outline-none focus:border-[#a45c25] focus:ring-1 focus:ring-[#a45c25] transition-all"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-3 text-[#5e5147] hover:text-[#a45c25] transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Action Icons */}
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-3">

            {/* Wishlist */}
            <button
              onClick={() => setCurrentTab('wishlist')}
              aria-label="Wishlist"
              className="relative p-2 sm:p-2.5 text-[#5e5147] hover:text-[#a45c25] transition-colors"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#a45c25] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              aria-label="Shopping Cart"
              className="relative p-2 sm:p-2.5 text-[#5e5147] hover:text-[#a45c25] transition-colors flex items-center"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#a45c25] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Links Bar */}
        <nav className="hidden lg:flex items-center justify-center space-x-12 border-t border-[#d9cbb9] py-3 text-xs font-bold tracking-widest uppercase">
          {navLinks.map((link) => {
            const isActive =
              currentTab === link.id ||
              (link.id === 'women' && currentTab === 'women-page') ||
              (link.id === 'men' && currentTab === 'men-page');

            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                className={`transition-colors py-1 ${
                  isActive ? 'text-[#a45c25] font-extrabold border-b-2 border-[#a45c25]' : 'text-[#5e5147] hover:text-[#a45c25]'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </nav>

      </div>
    </header>
  );
};
