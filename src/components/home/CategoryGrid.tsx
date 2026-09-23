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
    <section className="py-16 bg-[#f5f0e8] border-b border-[#d9cbb9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 text-gem-pink text-xs font-bold uppercase tracking-widest mb-2">
              <Tag className="w-3.5 h-3.5 text-gem-pink" />
              <span>SHOP BY DEPARTMENT & CATEGORY</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#181411]">
              EXPLORE COLLECTIONS
            </h2>
          </div>

          {/* Department Gender Selector Buttons */}
          <div className="grid w-full md:w-auto grid-cols-3 gap-1 p-1.5 bg-[#fffaf2] border border-[#d9cbb9]">
            <button
              onClick={() => setActiveGender('all')}
              className={`min-w-0 px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-normal sm:tracking-wider transition-all ${
                activeGender === 'all'
                  ? 'bg-gem-pink text-white shadow-pink-glow'
                  : 'text-[#5e5147] hover:text-[#181411]'
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setActiveGender('women')}
              className={`min-w-0 px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-normal sm:tracking-wider transition-all ${
                activeGender === 'women'
                  ? 'bg-gem-pink text-white shadow-pink-glow'
                  : 'text-[#5e5147] hover:text-[#181411]'
              }`}
            >
              Women's Hub
            </button>
            <button
              onClick={() => setActiveGender('men')}
              className={`min-w-0 px-2 sm:px-4 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-normal sm:tracking-wider transition-all ${
                activeGender === 'men'
                  ? 'bg-gem-pink text-white shadow-pink-glow'
                  : 'text-[#5e5147] hover:text-[#181411]'
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
              className="group relative overflow-hidden aspect-[4/5] bg-[#fffaf2] cursor-pointer border border-[#d9cbb9] hover:border-gem-pink transition-all duration-300 shadow-[0_14px_35px_-26px_rgba(28,23,19,.7)]"
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
                    'bg-gradient-to-tr from-[#1c1713] via-[#5e5147] to-gem-pink'
                  }`}
                >
                  <span
                    className="font-serif font-black text-[5rem] leading-none select-none opacity-20 text-[#f4c99e]"
                  >
                    {cat.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1c1713] via-[#1c1713]/35 to-transparent" />

              <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#ffb5d0] mb-1">
                  {cat.gender === 'women' ? "Women's Fashion" : cat.gender === 'men' ? "Men's Fashion" : 'Unisex Collection'}
                </span>
                <h3 className="font-serif text-2xl font-bold text-white group-hover:text-[#ffb5d0] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-300 font-light line-clamp-2 mt-1 mb-4">
                  {cat.description}
                </p>

                <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-[#ffb5d0] transition-colors pt-3 border-t border-[#fffaf2]/30">
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
