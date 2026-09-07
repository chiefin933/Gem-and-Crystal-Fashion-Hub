import React, { useState } from 'react';
import { Product, FilterState } from '../types/ecommerce';
import { ProductCard } from '../components/product/ProductCard';
import { ProductFilters } from '../components/product/ProductFilters';
import { Tag, SlidersHorizontal, PackageSearch } from 'lucide-react';

interface MenPageProps {
  products: Product[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectProduct: (product: Product) => void;
  onResetFilters: () => void;
}

export const MenPage: React.FC<MenPageProps> = ({
  products,
  filters,
  setFilters,
  onSelectProduct,
  onResetFilters,
}) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const menCategories = [
    { label: 'All Men', category: 'All' },
    { label: 'Straight jeans', category: 'Straight jeans' },
    { label: 'Hoodies', category: 'Hoodies' },
    { label: 'Leather jackets', category: 'Leather jackets' },
    { label: 'Crop jackets', category: 'Crop jackets' },
    { label: 'Trench coats', category: 'Trench coats' },
    { label: 'Sneakers', category: 'Sneakers' },
  ];

  // Apply all active filters for Men
  const menProducts = (() => {
    let result = products.filter(
      p => p.gender === 'men' || p.gender === 'unisex'
    );

    // Category
    if (filters.category && filters.category !== 'All') {
      result = result.filter(p =>
        p.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    // Sizes
    if (filters.sizes.length > 0) {
      result = result.filter(p =>
        filters.sizes.some(s => p.sizes.includes(s))
      );
    }

    // Colors
    if (filters.colors.length > 0) {
      result = result.filter(p =>
        p.colors.some(c => filters.colors.includes(c.name))
      );
    }

    // Price
    result = result.filter(p => (p.salePrice ?? p.price) <= filters.maxPrice);

    // On-sale toggle
    if (filters.onSaleOnly) {
      result = result.filter(p => p.onSale);
    }

    // In-stock toggle
    if (filters.inStockOnly) {
      result = result.filter(p =>
        p.variants.some(v => v.stockQuantity > 0)
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'newest':
        result = [...result].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case 'bestselling':
        result = [...result].sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
        break;
      case 'price-low':
        result = [...result].sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
        break;
      case 'price-high':
        result = [...result].sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
        break;
      default:
        result = [...result].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    }

    return result;
  })();

  return (
    <div className="bg-[#09090b] min-h-screen pb-20">
      {/* LC Waikiki Style Hero Banner for Men */}
      <section className="relative bg-[#121215] border-b border-gem-border/60 py-12 lg:py-16 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/40 text-[11px] font-extrabold text-blue-400 uppercase tracking-widest">
              <Tag className="w-3.5 h-3.5 text-blue-400" />
              <span>Men's Department</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
              MEN'S <span className="text-blue-400">COLLECTION</span>
            </h1>
            
            <p className="text-slate-300 text-xs sm:text-sm font-light leading-relaxed">
              Discover tailored suits, leather jackets, oxford shirts, cargo jeans, white leather sneakers, Chelsea boots, and loafers.
            </p>
          </div>

          {/* LC Waikiki Category Quick-Bar for Men */}
          <div className="flex items-center gap-2 overflow-x-auto pt-8 pb-2 scrollbar-none">
            {menCategories.map(cat => {
              const isActive = filters.category.toLowerCase() === cat.category.toLowerCase();
              return (
                <button
                  key={cat.label}
                  onClick={() => setFilters(prev => ({ ...prev, category: cat.category, gender: 'men' }))}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg'
                      : 'bg-[#18181f] text-slate-300 border-gem-border hover:border-blue-500 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Grid + Sidebar Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-gem-border gap-4">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-wide">
              {!filters.category || filters.category === 'All' ? "ALL MEN'S FASHION" : filters.category.toUpperCase()}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Showing <span className="text-blue-400 font-bold">{menProducts.length}</span> {menProducts.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 px-3.5 py-2 bg-[#121215] border border-gem-border rounded-lg text-xs font-bold text-slate-200 hover:border-blue-500"
            >
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Sort By:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-[#121215] border border-gem-border rounded-lg px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
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

        {/* Content Layout: Sidebar + Products */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 crystal-card p-5 rounded-xl sticky top-28 border border-gem-border/60">
            <ProductFilters
              filters={filters}
              setFilters={setFilters}
              onReset={onResetFilters}
              availableCategories={[
                'All',
                'Straight jeans',
                'Hoodies',
                'Leather jackets',
                'Crop jackets',
                'Trench coats',
                'Sneakers',
              ]}
            />
          </div>

          {/* Product Cards */}
          <div className="lg:col-span-3">
            {menProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {menProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 crystal-card rounded-2xl p-8 border border-dashed border-gem-border">
                <PackageSearch className="w-16 h-16 text-blue-400/40 mx-auto mb-4 animate-bounce" />
                <h3 className="font-serif text-2xl font-bold text-white mb-2">
                  No Men's Items Found
                </h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
                  We couldn't find any items matching your selected criteria. Try selecting another category or resetting filters.
                </p>
                <button
                  onClick={onResetFilters}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-widest rounded-md shadow-lg transition-all"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>

        </div>

      </section>

      {/* Mobile Filters Modal */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative w-full max-w-xs bg-[#09090b] border-r border-gem-border h-full p-6 overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gem-border">
              <span className="font-serif text-lg font-bold text-white">Men's Filters</span>
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
              availableCategories={[
                'All',
                'Straight jeans',
                'Hoodies',
                'Leather jackets',
                'Crop jackets',
                'Trench coats',
                'Sneakers',
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};
