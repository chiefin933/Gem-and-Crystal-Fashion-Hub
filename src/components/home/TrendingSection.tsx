import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Product } from '../../types/ecommerce';
import { ProductCard } from '../product/ProductCard';

interface TrendingSectionProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  setCurrentTab: (tab: string) => void;
}

export const TrendingSection: React.FC<TrendingSectionProps> = ({
  products,
  onSelectProduct,
  setCurrentTab,
}) => {
  const featuredList = products.slice(0, 4);

  return (
    <section className="py-16 bg-[#09090b] border-b border-gem-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 pb-4 border-b border-gem-border/60">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gem-pink block mb-1">
              Top Picked Items
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-wide">
              TRENDING NOW
            </h2>
          </div>

          <button
            onClick={() => setCurrentTab('shop')}
            className="mt-4 sm:mt-0 flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-gem-pink hover:text-gem-lightPink transition-colors group"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredList.map((prod) => (
            <ProductCard key={prod.id} product={prod} onSelect={onSelectProduct} />
          ))}
        </div>

      </div>
    </section>
  );
};
