import React from 'react';
import { ArrowRight, Tag } from 'lucide-react';
import { FilterState } from '../../types/ecommerce';

interface EditorialBannerProps {
  setCurrentTab: (tab: string) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

export const EditorialBanner: React.FC<EditorialBannerProps> = ({ setCurrentTab, setFilters }) => {
  return (
    <section className="py-16 bg-[#09090b] border-b border-gem-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card 1: NEW SEASON NEW YOU */}
          <div className="relative rounded-2xl overflow-hidden min-h-[260px] sm:min-h-[320px] flex items-end sm:items-center p-5 sm:p-8 border border-gem-pink/30 group">
            <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#09090b] via-[#09090b]/75 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80"
              alt="New Season Footwear Collection"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />

            <div className="relative z-20 w-full space-y-3 sm:space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-gem-pink/20 text-gem-pink text-[10px] font-bold tracking-widest uppercase">
                <Tag className="w-3 h-3 text-gem-pink" />
                <span>BOUTIQUE HIGHLIGHTS</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                NEW SEASON<br />
                <span className="text-gem-pink pink-glow-text">NEW YOU</span>
              </h3>
              <p className="text-xs text-slate-300 font-light hidden sm:block">
                Step into the season with statement heels, mom jeans, crop tops and tailoring that shines.
              </p>
              <button
                onClick={() => setCurrentTab('shop')}
                className="inline-flex px-5 py-2.5 bg-gem-pink hover:bg-gem-magenta text-white font-semibold text-xs tracking-widest uppercase rounded-md shadow-pink-glow transition-all items-center space-x-2"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Sparkle More, Spend Less */}
          <div className="relative rounded-2xl overflow-hidden min-h-[260px] sm:min-h-[320px] flex items-end sm:items-center p-5 sm:p-8 border border-gem-pink/30 group">
            <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-[#09090b] via-[#09090b]/75 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80"
              alt="Exclusive Offers"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />

            <div className="relative z-20 w-full space-y-3 sm:space-y-4">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold tracking-widest uppercase">
                <span>EXCLUSIVE DEALS</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
                Sparkle More,<br />
                <span className="text-gem-lightPink">Spend Less</span>
              </h3>
              <p className="text-xs text-slate-300 font-light hidden sm:block">
                Enjoy special prices on selected designer footwear, evening gowns and crop tops.
              </p>
              <button
                onClick={() => {
                  setFilters(prev => ({ ...prev, onSaleOnly: true, gender: 'all', category: 'All' }));
                  setCurrentTab('shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex px-5 py-2.5 bg-[#141419] hover:bg-gem-pink text-white font-semibold text-xs tracking-widest uppercase rounded-md border border-gem-border hover:border-gem-pink transition-all items-center space-x-2"
              >
                <span>SHOP OFFERS</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
