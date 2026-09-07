import React from 'react';
import { ArrowRight, MapPin } from 'lucide-react';
import { HERO_REAL_IMAGE } from '../../utils/demoData';
import { useStore } from '../../context/useStore';
import { FilterState } from '../../types/ecommerce';

interface HeroSectionProps {
  setCurrentTab: (tab: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ setCurrentTab }) => {
  const { setFilters } = useStore();

  const handleNavDepartment = (gender: 'women' | 'men') => {
    setFilters((prev: FilterState) => ({
      ...prev,
      gender,
      category: 'All',
      searchQuery: '',
    }));
    setCurrentTab(gender === 'women' ? 'women-page' : 'men-page');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="relative bg-[#09090b] overflow-hidden lg:min-h-[640px] flex items-center border-b border-gem-border/50">
      
      {/* Background Pink & Blue Ambient Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gem-pink/20 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-9 sm:py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Text & Headline Column */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6 text-center lg:text-left">
            <div className="inline-flex max-w-full items-center gap-2 px-3 py-1.5 rounded-full bg-gem-pink/15 border border-gem-pink/40 text-[10px] sm:text-xs font-bold text-gem-lightPink uppercase tracking-[0.12em] sm:tracking-widest">
              <MapPin className="w-3.5 h-3.5 text-gem-pink" />
              <span>ROYSAMBU BOUTIQUE HUB</span>
            </div>

            <h1 className="font-serif text-[clamp(2.75rem,14vw,4.5rem)] lg:text-7xl font-bold tracking-tight text-white leading-[0.95] sm:leading-[1.05]">
              BE <span className="text-gem-pink pink-glow-text">BOLD.</span><br />
              BE <span className="text-gem-pink pink-glow-text">BRIGHT.</span><br />
              BE <span className="text-white">YOU.</span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-xl font-light leading-relaxed">
              Explore high-waisted mom jeans, crop tops, dresses, blazers, sneakers, Chelsea boots, and menswear. Built for maximum confidence and style.
            </p>

            {/* LC Waikiki Style Department Selectors */}
            <div className="flex flex-col min-[420px]:flex-row items-stretch min-[420px]:items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => handleNavDepartment('women')}
                className="w-full min-[420px]:w-auto px-6 sm:px-9 py-3.5 sm:py-4.5 bg-gem-pink hover:bg-gem-magenta text-white font-extrabold text-xs tracking-widest uppercase rounded-xl shadow-pink-glow hover:shadow-pink-glow-lg transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <span>WOMEN'S HUB</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleNavDepartment('men')}
                className="w-full min-[420px]:w-auto px-6 sm:px-9 py-3.5 sm:py-4.5 bg-[#141419] hover:bg-blue-600 border border-gem-border hover:border-blue-500 text-slate-200 hover:text-white font-extrabold text-xs tracking-widest uppercase rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <span>MEN'S HUB</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image Feature Column */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-[440px] lg:max-w-none aspect-[5/6] sm:aspect-[4/5] max-h-[470px] lg:max-h-none rounded-2xl overflow-hidden border border-gem-pink/40 shadow-2xl group bg-[#121215]">
              {HERO_REAL_IMAGE ? (
                <img
                  src={HERO_REAL_IMAGE}
                  alt="Gem & Crystal Fashion Model"
                  className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                  fetchPriority="high"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-zinc-950 via-rose-950/40 to-zinc-900 flex flex-col items-center justify-center p-8 text-center">
                  {/* Decorative gem icon */}
                  <div className="w-20 h-20 rounded-2xl bg-gem-pink/20 border border-gem-pink/40 flex items-center justify-center mb-5 shadow-pink-glow">
                    <svg className="w-10 h-10 text-gem-pink" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 9l10 13 10-13-10-7zm0 3.2L18.4 9H5.6L12 5.2z"/>
                    </svg>
                  </div>
                  <h3 className="font-serif text-3xl font-bold text-white mb-2 tracking-wide">Gem & Crystal</h3>
                  <p className="text-xs text-gem-pink font-semibold uppercase tracking-[0.2em] mb-3">Fashion Hub</p>
                  <p className="text-xs text-zinc-400 max-w-[200px] leading-relaxed">Physical Boutique & Online Store<br />Roysambu, Nairobi 🇰🇪</p>
                  {/* Decorative divider */}
                  <div className="mt-6 w-16 h-px bg-gradient-to-r from-transparent via-gem-pink to-transparent" />
                  <p className="mt-4 text-[10px] text-zinc-500 uppercase tracking-widest">BE BOLD. BE BRIGHT. BE YOU.</p>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-transparent opacity-85 pointer-events-none" />
              
              <div className="absolute bottom-3 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-6 p-3 sm:p-4 rounded-xl glass-panel border border-gem-pink/30 flex flex-col gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gem-pink block">
                    Fashion & Footwear
                  </span>
                  <span className="font-serif text-base sm:text-lg font-bold text-white block">
                    Select Your Department
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleNavDepartment('women')}
                    className="px-3.5 py-2 bg-gem-pink text-white text-xs font-bold rounded-lg hover:bg-gem-magenta transition-colors shadow-pink-glow"
                  >
                    Women
                  </button>
                  <button
                    onClick={() => handleNavDepartment('men')}
                    className="px-3.5 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors shadow-lg"
                  >
                    Men
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
