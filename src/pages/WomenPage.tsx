import React, { useState } from 'react';
import { Product, FilterState } from '../types/ecommerce';
import { ProductCard } from '../components/product/ProductCard';
import { ProductFilters } from '../components/product/ProductFilters';
import { SlidersHorizontal, PackageSearch } from 'lucide-react';
import { CollectionHero } from '../components/collections/CollectionHero';
import womenCollectionImage from '../assets/collection-women-staged.jpg';

interface WomenPageProps {
  products: Product[];
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onSelectProduct: (product: Product) => void;
  onResetFilters: () => void;
}

export const WomenPage: React.FC<WomenPageProps> = ({
  products,
  filters,
  setFilters,
  onSelectProduct,
  onResetFilters,
}) => {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const womenCategories = [
    { label: 'All Women', category: 'All' },
    { label: 'Dresses', category: 'Dresses' },
    { label: 'Two piece', category: 'Two piece (skirt/trouser)' },
    { label: 'Three piece', category: 'Three piece' },
    { label: 'Mommy jeans', category: 'Mommy jeans' },
    { label: 'Straight jeans', category: 'Straight jeans' },
    { label: 'Crop jackets', category: 'Crop jackets' },
    { label: 'Leather jackets', category: 'Leather jackets' },
    { label: 'Trench coats', category: 'Trench coats' },
    { label: 'Hoodies', category: 'Hoodies' },
    { label: 'Heels', category: 'Heels' },
    { label: 'Torte Bags', category: 'Torte Bags' },
  ];

  // Apply all active filters for Women
  const womenProducts = (() => {
    let result = products.filter(
      p => p.gender === 'women' || p.gender === 'unisex'
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

    // In-stock toggle (at least one variant with stock > 0)
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
    <div className="boutique-page pb-20">
      <CollectionHero
        department="Women"
        image={womenCollectionImage}
        eyebrow="The women’s edit · new season"
        title="Made to be seen."
        description="High-waisted denim, confident tailoring, dress-up pieces and footwear selected for every version of your day."
        categories={womenCategories}
        activeCategory={filters.category}
        onCategoryChange={(category) => setFilters(prev => ({ ...prev, category, gender: 'women' }))}
        onShopCollection={() => document.getElementById('women-products')?.scrollIntoView({ behavior: 'smooth' })}
      />

      {/* Main Grid + Sidebar Section */}
      <section id="women-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b border-[#d9cbb9] gap-4">
          <div>
            <p className="boutique-label mb-2">Curated arrivals</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#181411] tracking-tight">
              {!filters.category || filters.category === 'All' ? "ALL WOMEN'S FASHION" : filters.category.toUpperCase()}
            </h2>
            <p className="text-xs text-[#5e5147] mt-1">
              Showing <span className="text-[#a45c25] font-bold">{womenProducts.length}</span> {womenProducts.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center space-x-2 px-3.5 py-2 boutique-panel text-xs font-bold text-[#181411] hover:border-[#a45c25]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#a45c25]" />
              <span>Filters</span>
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-[#5e5147] hidden sm:inline">Sort By:</span>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                className="bg-[#fffaf2] border border-[#d9cbb9] px-3 py-2 text-xs font-semibold text-[#181411] focus:outline-none focus:border-[#a45c25] cursor-pointer"
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
          <div className="hidden lg:block lg:col-span-1 boutique-panel p-5 sticky top-28">
            <ProductFilters
              filters={filters}
              setFilters={setFilters}
              onReset={onResetFilters}
              availableCategories={[
                'All',
                'Dresses',
                'Two piece (skirt/trouser)',
                'Three piece',
                'Mommy jeans',
                'Straight jeans',
                'Hoodies',
                'Leather jackets',
                'Crop jackets',
                'Trench coats',
                'Heels',
                'Sneakers',
                'Torte Bags',
              ]}
            />
          </div>

          {/* Product Cards */}
          <div className="lg:col-span-3">
            {womenProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {womenProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 boutique-panel p-8 border-dashed">
                <PackageSearch className="w-16 h-16 text-[#a45c25]/50 mx-auto mb-4" />
                <h3 className="font-serif text-2xl font-bold text-[#181411] mb-2">
                  No Women's Items Found
                </h3>
                <p className="text-xs text-[#5e5147] max-w-sm mx-auto mb-6">
                  We couldn't find any items matching your selected criteria. Try selecting another category or resetting filters.
                </p>
                <button
                  onClick={onResetFilters}
                  className="px-6 py-3 boutique-button font-bold text-xs uppercase tracking-widest transition-all"
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
          <div className="relative w-full max-w-xs bg-[#fffaf2] border-r border-[#d9cbb9] h-full p-6 overflow-y-auto z-10">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#d9cbb9]">
              <span className="font-serif text-lg font-bold text-[#181411]">Women's Filters</span>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-[#5e5147] hover:text-[#181411] text-xs font-bold"
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
                'Dresses',
                'Two piece (skirt/trouser)',
                'Three piece',
                'Mommy jeans',
                'Straight jeans',
                'Hoodies',
                'Leather jackets',
                'Crop jackets',
                'Trench coats',
                'Heels',
                'Sneakers',
                'Torte Bags',
              ]}
            />
          </div>
        </div>
      )}
    </div>
  );
};
