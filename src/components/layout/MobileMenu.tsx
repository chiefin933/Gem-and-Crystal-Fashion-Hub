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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xs bg-[#09090b] border-r border-gem-border/80 h-full flex flex-col z-10 overflow-y-auto p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-6 border-b border-gem-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-gem-pink flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 9l10 13 10-13-10-7zm0 3.2L18.4 9H5.6L12 5.2z"/>
              </svg>
            </div>
            <span className="font-serif text-lg font-bold text-white">GEM & CRYSTAL</span>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="py-6 space-y-4 font-serif text-lg font-medium">
          <button
            onClick={() => navigateTo('home')}
            className={`block w-full text-left transition-colors ${
              currentTab === 'home' ? 'text-gem-pink font-bold' : 'text-slate-200'
            }`}
          >
            HOME
          </button>

          <button
            onClick={() => navigateTo('women-page', { gender: 'women', category: 'All' })}
            className={`block w-full text-left transition-colors ${
              currentTab === 'women-page' ? 'text-gem-pink font-bold' : 'text-slate-200'
            }`}
          >
            WOMEN'S COLLECTION
          </button>

          <button
            onClick={() => navigateTo('men-page', { gender: 'men', category: 'All' })}
            className={`block w-full text-left transition-colors ${
              currentTab === 'men-page' ? 'text-gem-pink font-bold' : 'text-slate-200'
            }`}
          >
            MEN'S COLLECTION
          </button>

          <button
            onClick={() => navigateTo('about-us')}
            className={`block w-full text-left transition-colors ${
              currentTab === 'about-us' ? 'text-gem-pink font-bold' : 'text-slate-200'
            }`}
          >
            ABOUT US
          </button>

          <button
            onClick={() => navigateTo('contact-us')}
            className={`block w-full text-left transition-colors ${
              currentTab === 'contact-us' ? 'text-gem-pink font-bold' : 'text-slate-200'
            }`}
          >
            CONTACT US
          </button>
        </div>

        {/* Contact Info Footer */}
        <div className="mt-auto pt-6 border-t border-gem-border space-y-3">
          <div className="pt-4 text-xs text-slate-400 space-y-2">
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
