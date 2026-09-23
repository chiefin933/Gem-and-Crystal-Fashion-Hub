import React from 'react';
import { X, Phone, Mail, MapPin } from 'lucide-react';
import { useStore } from '../../context/useStore';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  currentTab,
  setCurrentTab,
}) => {
  const { setFilters } = useStore();

  if (!isOpen) return null;

  const navigateTo = (tab: string, filterObj?: any) => {
    if (filterObj) {
      setFilters(prev => ({ ...prev, ...filterObj }));
    }
    setCurrentTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex lg:hidden">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-[#1c1713]/55 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-sm bg-[#fffaf2] border-r border-[#d9cbb9] h-full flex flex-col z-10 overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-6 border-b border-[#d9cbb9]">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gem-pink flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 9l10 13 10-13-10-7zm0 3.2L18.4 9H5.6L12 5.2z"/>
              </svg>
            </div>
            <div><span className="block font-serif text-lg font-bold text-[#181411]">GEM &amp; CRYSTAL</span><span className="text-[9px] font-bold uppercase tracking-[.18em] text-gem-pink">Fashion hub</span></div>
          </div>

          <button onClick={onClose} aria-label="Close menu" className="p-2 text-[#5e5147] hover:text-gem-pink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gem-pink">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="py-7 space-y-1 font-serif text-xl font-medium">
          <button
            onClick={() => navigateTo('home')}
            className={`block w-full text-left px-3 py-2.5 transition-colors ${
              currentTab === 'home' ? 'bg-gem-pink/10 text-gem-pink font-bold' : 'text-[#181411] hover:bg-[#f5f0e8]'
            }`}
          >
            HOME
          </button>

          <button
            onClick={() => navigateTo('women-page', { gender: 'women', category: 'All' })}
            className={`block w-full text-left px-3 py-2.5 transition-colors ${
              currentTab === 'women-page' ? 'bg-gem-pink/10 text-gem-pink font-bold' : 'text-[#181411] hover:bg-[#f5f0e8]'
            }`}
          >
            WOMEN'S COLLECTION
          </button>

          <button
            onClick={() => navigateTo('men-page', { gender: 'men', category: 'All' })}
            className={`block w-full text-left px-3 py-2.5 transition-colors ${
              currentTab === 'men-page' ? 'bg-gem-pink/10 text-gem-pink font-bold' : 'text-[#181411] hover:bg-[#f5f0e8]'
            }`}
          >
            MEN'S COLLECTION
          </button>

          <button
            onClick={() => navigateTo('about-us')}
            className={`block w-full text-left px-3 py-2.5 transition-colors ${
              currentTab === 'about-us' ? 'bg-gem-pink/10 text-gem-pink font-bold' : 'text-[#181411] hover:bg-[#f5f0e8]'
            }`}
          >
            ABOUT US
          </button>

          <button
            onClick={() => navigateTo('contact-us')}
            className={`block w-full text-left px-3 py-2.5 transition-colors ${
              currentTab === 'contact-us' ? 'bg-gem-pink/10 text-gem-pink font-bold' : 'text-[#181411] hover:bg-[#f5f0e8]'
            }`}
          >
            CONTACT US
          </button>
        </div>

        {/* Contact Info Footer */}
        <div className="mt-auto pt-6 border-t border-[#d9cbb9] space-y-3">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#5e5147]">Boutique concierge</p>
          <div className="pt-1 text-xs text-[#5e5147] space-y-2">
            <div className="flex items-center space-x-2">
              <Phone className="w-3.5 h-3.5 text-gem-pink" />
              <span>+254 718 796 296</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-3.5 h-3.5 text-gem-pink" />
              <span>info@gemandcrystal.co.ke</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-gem-pink" />
              <span>Roysambu, Nairobi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
