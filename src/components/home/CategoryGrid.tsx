import React, { useState } from 'react';
import { ArrowRight, Tag } from 'lucide-react';
import { useStore } from '../../context/useStore';
import { CATEGORIES } from '../../utils/demoData';
import { FilterState } from '../../types/ecommerce';

interface CategoryGridProps {
  setCurrentTab: (tab: string) => void;
}

export const CategoryGrid: React.FC<CategoryGridProps> = ({ setCurrentTab }) => {
  const { setFilters } = useStore();
  const [activeGender, setActiveGender] = useState<'all' | 'women' | 'men'>('all');

  const handleCategoryClick = (categoryName: string, gender: string) => {
    setFilters((prev: FilterState) => ({
      ...prev,
      category: categoryName,
      gender: gender as any,
    }));
    if (gender === 'women') {
      setCurrentTab('women-page');
    } else if (gender === 'men') {
      setCurrentTab('men-page');
    } else {
      setCurrentTab('shop');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredCategories = activeGender === 'all'
    ? CATEGORIES
    : CATEGORIES.filter(c => c.gender === activeGender || c.gender === 'unisex');

  return (
    <section className="py-16 bg-[#09090b] border-b border-gem-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-gem-pink text-xs font-bold uppercase tracking-widest mb-2">
              <Tag className="w-3.5 h-3.5 text-gem-pink" />
              <span>SHOP BY DEPARTMENT & CATEGORY</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              EXPLORE COLLECTIONS
            </h2>
          </div>

          {/* Department Gender Selector Buttons */}
          <div className="grid w-full md:w-auto grid-cols-3 gap-1 p-1.5 bg-[#121215] rounded-xl border border-gem-border">
            <button
              onClick={() => setActiveGender('all')}
              className={`min-w-0 px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-normal sm:tracking-wider transition-all ${
                activeGender === 'all'
                  ? 'bg-gem-pink text-white shadow-pink-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setActiveGender('women')}
              className={`min-w-0 px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-normal sm:tracking-wider transition-all ${
                activeGender === 'women'
                  ? 'bg-gem-pink text-white shadow-pink-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Women's Hub
            </button>
            <button
              onClick={() => setActiveGender('men')}
              className={`min-w-0 px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-normal sm:tracking-wider transition-all ${
                activeGender === 'men'
                  ? 'bg-gem-pink text-white shadow-pink-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Men's Hub
            </button>
          </div>
        </div>

        {/* Category Cards Grid */}
        <div className="grid grid-cols-1 min-[390px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.name, cat.gender)}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] crystal-card cursor-pointer border border-gem-border/60 hover:border-gem-pink/60 transition-all duration-300 shadow-xl"
            >
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div
                  className={`w-full h-full flex items-end pb-24 justify-center transition-transform duration-700 group-hover:scale-105 ${
                    cat.gender === 'men'
                      ? 'bg-gradient-to-tr from-zinc-950 via-blue-950/50 to-zinc-900'
                      : 'bg-gradient-to-tr from-zinc-950 via-rose-950/50 to-zinc-900'
                  }`}
                >
                  <span
                    className={`font-serif font-black text-[5rem] leading-none select-none opacity-20 ${
                      cat.gender === 'men' ? 'text-blue-400' : 'text-rose-400'
                    }`}
                  >
                    {cat.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />

              <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-gem-pink mb-1">
                  {cat.gender === 'women' ? "Women's Fashion" : cat.gender === 'men' ? "Men's Fashion" : 'Unisex Collection'}
                </span>
                <h3 className="font-serif text-2xl font-bold text-white group-hover:text-gem-pink transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-300 font-light line-clamp-2 mt-1 mb-4">
                  {cat.description}
                </p>

                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-gem-pink transition-colors pt-3 border-t border-gem-border/40">
                  <span>Browse Collection</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
