import React from 'react';
import { FilterState, Gender } from '../../types/ecommerce';
import { RotateCcw } from 'lucide-react';

interface ProductFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
  availableCategories?: string[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, setFilters, onReset, availableCategories }) => {
  const defaultCategories = [
    'All',
    'Dresses',
    'Two piece (skirt/trouser)',
    'Three piece',
    'Straight jeans',
    'Mommy jeans',
    'Hoodies',
    'Leather jackets',
    'Crop jackets',
    'Trench coats',
    'Heels',
    'Sneakers',
    'Torte Bags',
  ];

  const categoriesList = availableCategories ?? defaultCategories;

  const availableSizes = ['S', 'M', 'L', 'XL', '37', '38', '39', '40', '41', '42', '43', '44'];

  const availableColors = [
    { name: 'Vintage Blue', hex: '#4b6b94' },
    { name: 'Classic Black', hex: '#18181b' },
    { name: 'Cream White', hex: '#fdfbf7' },
    { name: 'Hot Pink', hex: '#ec4899' },
    { name: 'Emerald Green', hex: '#065f46' },
    { name: 'Cognac Brown', hex: '#78350f' },
  ];

  const handleGenderChange = (gender: Gender | 'all') => {
    setFilters(prev => ({ ...prev, gender }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const toggleSize = (size: string) => {
    setFilters(prev => {
      const exists = prev.sizes.includes(size);
      return {
        ...prev,
        sizes: exists ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size]
      };
    });
  };

  const toggleColor = (colorName: string) => {
    setFilters(prev => {
      const exists = prev.colors.includes(colorName);
      return {
        ...prev,
        colors: exists ? prev.colors.filter(c => c !== colorName) : [...prev.colors, colorName]
      };
    });
  };

  return (
    <div className="shopping-surface shopping-filters space-y-6 text-xs text-slate-300">
      
      {/* Header & Reset Button */}
      <div className="flex items-center justify-between pb-4 border-b border-gem-border">
        <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
          Filter Catalogue
        </h3>
        <button
          onClick={onReset}
          className="flex items-center space-x-1 text-gem-pink hover:text-white transition-colors text-[11px] font-semibold"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Gender Filter Tabs — only shown on the generic shop/catalogue page */}
      {!availableCategories && (
        <div>
          <label className="font-bold text-white uppercase tracking-wider block mb-2 font-sans">
            Department
          </label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#121215] rounded-lg border border-gem-border">
            {(['all', 'women', 'men'] as const).map(g => (
              <button
                key={g}
                onClick={() => handleGenderChange(g)}
                className={`py-1.5 rounded-md font-semibold text-center uppercase tracking-wider capitalize transition-all ${
                  filters.gender === g
                    ? 'bg-gem-pink text-white shadow-pink-glow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Categories Filter */}
      <div>
        <label className="font-bold text-white uppercase tracking-wider block mb-2 font-sans">
          Category
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {categoriesList.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`block w-full text-left py-1.5 px-2.5 rounded-md transition-all ${
                filters.category === cat
                  ? 'bg-gem-pink/20 text-gem-pink font-bold border-l-2 border-gem-pink'
                  : 'text-slate-400 hover:bg-[#141419] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Slider */}
      <div>
        <div className="flex justify-between font-bold text-white uppercase tracking-wider mb-2 font-sans">
          <span>Max Price</span>
          <span className="text-gem-pink">KSh {filters.maxPrice.toLocaleString()}</span>
        </div>
        <input
          type="range"
          min="2000"
          max="30000"
          step="500"
          value={filters.maxPrice}
          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
          className="w-full accent-gem-pink bg-gem-border rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>KSh 2,000</span>
          <span>KSh 30,000</span>
        </div>
      </div>

      {/* Sizes Multi-Select */}
      <div>
        <label className="font-bold text-white uppercase tracking-wider block mb-2 font-sans">
          Available Sizes
        </label>
        <div className="flex flex-wrap gap-1.5">
          {availableSizes.map(s => {
            const isSelected = filters.sizes.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggleSize(s)}
                className={`w-9 h-8 rounded border font-semibold flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-gem-pink border-gem-pink text-white shadow-pink-glow'
                    : 'bg-[#121215] border-gem-border text-slate-400 hover:border-slate-400'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* Colors Swatches */}
      <div>
        <label className="font-bold text-white uppercase tracking-wider block mb-2 font-sans">
          Color Swatches
        </label>
        <div className="flex flex-wrap gap-2">
          {availableColors.map(c => {
            const isSelected = filters.colors.includes(c.name);
            return (
              <button
                key={c.name}
                onClick={() => toggleColor(c.name)}
                title={c.name}
                className={`w-7 h-7 rounded-full border-2 transition-transform ${
                  isSelected ? 'border-gem-pink scale-110 shadow-pink-glow' : 'border-gem-border hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="pt-2 border-t border-gem-border space-y-2">
        <label className="flex items-center space-x-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.onSaleOnly}
            onChange={(e) => setFilters(prev => ({ ...prev, onSaleOnly: e.target.checked }))}
            className="w-4 h-4 rounded bg-[#121215] border-gem-border text-gem-pink focus:ring-0 accent-gem-pink"
          />
          <span className="font-semibold text-slate-200">On Sale Items Only</span>
        </label>

        <label className="flex items-center space-x-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={(e) => setFilters(prev => ({ ...prev, inStockOnly: e.target.checked }))}
            className="w-4 h-4 rounded bg-[#121215] border-gem-border text-gem-pink focus:ring-0 accent-gem-pink"
          />
          <span className="font-semibold text-slate-200">In Stock Only</span>
        </label>
      </div>

    </div>
  );
};
