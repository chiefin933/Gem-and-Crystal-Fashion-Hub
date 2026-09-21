import React, { useState } from 'react';
import { SlidersHorizontal, PackageSearch } from 'lucide-react';
import { Product, FilterState } from '../../types/ecommerce';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';

interface ProductGridProps {
  products: Product[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectProduct: (product: Product) => void;
  onResetFilters: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  filters,
  setFilters,
  onSelectProduct,
  onResetFilters,
}) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  return (
    <section className="py-10 bg-[#09090b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-gem-border gap-4">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-wide">
              {filters.category === 'All' ? 'EXPLORE CATALOGUE' : filters.category.toUpperCase()}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Showing <span className="text-gem-pink font-bold">{products.length}</span> luxury fashion items & footwear
            </p>
          </div>

          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 px-3.5 py-2 bg-[#121215] border border-gem-border rounded-lg text-xs font-bold text-slate-200 hover:border-gem-pink"
            >
              <SlidersHorizontal className="w-4 h-4 text-gem-pink" />
              <span>Filters</span>
            </button>

            {/* Sorting Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Sort By:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-[#121215] border border-gem-border rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-gem-pink cursor-pointer"
              >
                <option value="featured">Featured Items</option>
                <option value="newest">Newest Arrivals</option>
                <option value="bestselling">Best Sellers</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 crystal-card p-5 rounded-xl sticky top-28">
            <ProductFilters
              filters={filters}
              setFilters={setFilters}
              onReset={onResetFilters}
            />
          </div>

          {/* Product Grid Area */}
          <div className="lg:col-span-3">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 crystal-card rounded-2xl p-8 border border-dashed border-gem-border">
                <PackageSearch className="w-16 h-16 text-gem-pink/40 mx-auto mb-4 animate-bounce" />
                <h3 className="font-serif text-2xl font-bold text-white mb-2">
                  No Matching Products Found
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                  We couldn't find any clothes or footwear matching your current filter choices. Try expanding your search or resetting filters.
                </p>
                <button
                  onClick={onResetFilters}
                  className="px-6 py-3 bg-gem-pink hover:bg-gem-magenta text-white font-bold text-xs uppercase tracking-widest rounded-md shadow-pink-glow transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Filters Drawer Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative w-full max-w-xs bg-[#09090b] border-r border-gem-border h-full p-6 overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gem-border">
              <span className="font-serif text-lg font-bold text-white">Filters</span>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
            <ProductFilters
              filters={filters}
              setFilters={setFilters}
              onReset={() => {
                onResetFilters();
                setIsMobileFilterOpen(false);
              }}
            />
          </div>
        </div>
      )}

    </section>
  );
};
