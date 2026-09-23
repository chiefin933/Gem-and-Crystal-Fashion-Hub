import React from 'react';
import { ChevronDown, Phone, Mail, MapPin } from 'lucide-react';
import { useStore } from '../../context/useStore';
import { FilterState } from '../../types/ecommerce';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

const womenLinks = ['Dresses', 'Two piece (skirt/trouser)', 'Three piece', 'Mommy jeans', 'Straight jeans', 'Hoodies', 'Leather jackets', 'Crop jackets', 'Trench coats', 'Heels', 'Sneakers', 'Torte Bags'];
const menLinks = ['Straight jeans', 'Hoodies', 'Leather jackets', 'Crop jackets', 'Trench coats', 'Sneakers'];

export const Footer: React.FC<FooterProps> = ({ setCurrentTab }) => {
  const { setFilters } = useStore();

  const handleNavCategory = (category: string, gender = 'women') => {
    setFilters((prev: FilterState) => ({ ...prev, category, gender: gender as any }));
    setCurrentTab('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const LinkList = ({ links, gender }: { links: string[]; gender: 'women' | 'men' }) => (
    <ul className="space-y-2 pt-3">
      {links.map((link) => (
        <li key={link}><button onClick={() => handleNavCategory(link, gender)} className="text-left hover:text-gem-pink focus-visible:outline focus-visible:outline-2 focus-visible:outline-gem-pink">{link === 'Two piece (skirt/trouser)' ? 'Two Piece Sets' : link}</button></li>
      ))}
    </ul>
  );
  const SupportLinks = () => <ul className="space-y-2 pt-3"><li><button onClick={() => setCurrentTab('about-us')} className="hover:text-gem-pink">About Gem &amp; Crystal Fashion Hub</button></li><li><button onClick={() => setCurrentTab('contact-us')} className="hover:text-gem-pink">Contact boutique concierge</button></li></ul>;

  return (
    <footer className="bg-[#1c1713] border-t border-[#392d27] text-[#d9cbb9] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => {
                setCurrentTab('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-gem-pink to-gem-deepPink flex items-center justify-center shadow-pink-glow">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 9l10 13 10-13-10-7zm0 3.2L18.4 9H5.6L12 5.2z"/>
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-2xl font-bold tracking-wider text-white group-hover:text-gem-pink transition-colors">
                  GEM & CRYSTAL
                </span>
                <span className="text-[10px] tracking-[0.25em] text-gem-pink font-semibold">
                  FASHION HUB · BE BOLD. BE BRIGHT. BE YOU.
                </span>
              </div>
            </div>

            <p className="text-[#d9cbb9] text-xs leading-relaxed max-w-sm">
              Curated clothes and footwear for looks with confidence, colour and presence.
            </p>

            <div className="space-y-2 pt-2 text-[#f5f0e8]">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gem-pink shrink-0" />
                <span>+254 718 796 296 (Store Concierge)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gem-pink shrink-0" />
                <span>info@gemandcrystal.co.ke</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-gem-pink shrink-0" />
                <span>Roysambu, Nairobi</span>
              </div>
            </div>
          </div>

          {/* Column 2: Women's Collections */}
          <div className="hidden md:block space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#fffaf2] uppercase tracking-wider">
              Women's Apparel
            </h4>
            <ul className="space-y-2">
              <li><button onClick={() => handleNavCategory('Dresses', 'women')} className="hover:text-gem-pink transition-colors">Dresses</button></li>
              <li><button onClick={() => handleNavCategory('Two piece (skirt/trouser)', 'women')} className="hover:text-gem-pink transition-colors">Two Piece Sets</button></li>
              <li><button onClick={() => handleNavCategory('Three piece', 'women')} className="hover:text-gem-pink transition-colors">Three Piece Sets</button></li>
              <li><button onClick={() => handleNavCategory('Mommy jeans', 'women')} className="hover:text-gem-pink transition-colors">Mommy Jeans</button></li>
              <li><button onClick={() => handleNavCategory('Straight jeans', 'women')} className="hover:text-gem-pink transition-colors">Straight Jeans</button></li>
              <li><button onClick={() => handleNavCategory('Hoodies', 'women')} className="hover:text-gem-pink transition-colors">Hoodies</button></li>
              <li><button onClick={() => handleNavCategory('Leather jackets', 'women')} className="hover:text-gem-pink transition-colors">Leather Jackets</button></li>
              <li><button onClick={() => handleNavCategory('Crop jackets', 'women')} className="hover:text-gem-pink transition-colors">Crop Jackets</button></li>
              <li><button onClick={() => handleNavCategory('Trench coats', 'women')} className="hover:text-gem-pink transition-colors">Trench Coats</button></li>
              <li><button onClick={() => handleNavCategory('Heels', 'women')} className="hover:text-gem-pink transition-colors">Heels</button></li>
              <li><button onClick={() => handleNavCategory('Sneakers', 'women')} className="hover:text-gem-pink transition-colors">Sneakers</button></li>
              <li><button onClick={() => handleNavCategory('Torte Bags', 'women')} className="hover:text-gem-pink transition-colors">Torte Bags</button></li>
            </ul>
          </div>

          {/* Column 3: Men's Collections */}
          <div className="hidden md:block space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#fffaf2] uppercase tracking-wider">
              Men's Apparel
            </h4>
            <ul className="space-y-2">
              <li><button onClick={() => handleNavCategory('Straight jeans', 'men')} className="hover:text-gem-pink transition-colors">Straight Jeans</button></li>
              <li><button onClick={() => handleNavCategory('Hoodies', 'men')} className="hover:text-gem-pink transition-colors">Hoodies</button></li>
              <li><button onClick={() => handleNavCategory('Leather jackets', 'men')} className="hover:text-gem-pink transition-colors">Leather Jackets</button></li>
              <li><button onClick={() => handleNavCategory('Crop jackets', 'men')} className="hover:text-gem-pink transition-colors">Crop Jackets</button></li>
              <li><button onClick={() => handleNavCategory('Trench coats', 'men')} className="hover:text-gem-pink transition-colors">Trench Coats</button></li>
              <li><button onClick={() => handleNavCategory('Sneakers', 'men')} className="hover:text-gem-pink transition-colors">Sneakers</button></li>
            </ul>
          </div>

          {/* Column 4: Quick Links */}
          <div className="hidden md:block space-y-3">
            <h4 className="font-serif text-sm font-bold text-[#fffaf2] uppercase tracking-wider">
              Store Support
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentTab('about-us')} className="hover:text-gem-pink transition-colors">
                  About Gem &amp; Crystal Fashion Hub
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('contact-us')} className="hover:text-gem-pink transition-colors">
                  Contact Boutique Concierge
                </button>
              </li>
            </ul>
          </div>

          <div className="md:hidden border-t border-[#392d27] divide-y divide-[#392d27]">
            <details className="group py-1"><summary className="flex cursor-pointer list-none items-center justify-between py-4 font-serif text-base font-bold text-[#fffaf2]">Women’s Apparel <ChevronDown className="h-4 w-4 text-gem-pink transition-transform group-open:rotate-180" /></summary><LinkList links={womenLinks} gender="women" /></details>
            <details className="group py-1"><summary className="flex cursor-pointer list-none items-center justify-between py-4 font-serif text-base font-bold text-[#fffaf2]">Men’s Apparel <ChevronDown className="h-4 w-4 text-gem-pink transition-transform group-open:rotate-180" /></summary><LinkList links={menLinks} gender="men" /></details>
            <details className="group py-1"><summary className="flex cursor-pointer list-none items-center justify-between py-4 font-serif text-base font-bold text-[#fffaf2]">Store Support <ChevronDown className="h-4 w-4 text-gem-pink transition-transform group-open:rotate-180" /></summary><SupportLinks /></details>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#392d27] flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-[#9b897d]">
          <p>© 2026 GEM & CRYSTAL FASHION HUB. All rights reserved.</p>
        </div>

      </div>
    </footer>
  );
};
