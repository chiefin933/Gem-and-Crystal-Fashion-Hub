import React, { useState } from 'react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../../types/ecommerce';
import { useStore } from '../../context/useStore';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const { toggleWishlist, isInWishlist, setQuickViewProduct, addToCart } = useStore();
  const [activeColorIdx, setActiveColorIdx] = useState(0);

  if (!product || !product.images || product.images.length === 0) {
    return null;
  }

  const isWished = isInWishlist(product.id);
  const displayPrice = product.salePrice ?? product.price ?? 0;
  const hasDiscount = product.onSale && product.salePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.salePrice!) / product.price) * 100)
    : 0;

  const variants = product.variants || [];
  const totalStock = variants.reduce((sum, v) => sum + (v.stockQuantity || 0), 0);

  // Show image corresponding to selected color swatch index
  const cardImage = product.images[activeColorIdx] ?? product.images[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const firstAvailable = variants.find(v => v.stockQuantity > 0) || variants[0];
    if (firstAvailable) {
      addToCart(product, firstAvailable.size, firstAvailable.color, 1);
    }
  };

  const handleSwatchClick = (e: React.MouseEvent, idx: number) => {
    e.stopPropagation();
    setActiveColorIdx(idx);
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className="group relative bg-[#fffaf2] border border-[#d9cbb9] overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_35px_-24px_rgba(28,23,19,.65)]"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#eee5d7]">
        <img
          key={cardImage}
          src={cardImage}
          alt={product.title}
          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500 animate-fade-in"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1.5 z-10">
          {hasDiscount && (
            <span className="px-2.5 py-1 text-[10px] font-extrabold uppercase rounded badge-sale text-white shadow-md">
              -{discountPercent}% OFF
            </span>
          )}
          {product.isNew && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-slate-900 text-gem-lightPink border border-gem-pink/40">
              NEW
            </span>
          )}
          {product.isBestSeller && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded bg-gem-pink text-white shadow-pink-glow">
              BEST SELLER
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          aria-label="Wishlist toggle"
          className="absolute top-3 right-3 p-2 bg-[#fffaf2]/90 text-[#5e5147] hover:text-gem-pink transition-all z-10"
        >
          <Heart className={`w-4 h-4 ${isWished ? 'fill-gem-pink text-gem-pink' : ''}`} />
        </button>

        {/* Quick View & Quick Add */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 opacity-0 max-md:opacity-100 group-hover:opacity-100 transform translate-y-2 max-md:translate-y-0 group-hover:translate-y-0 transition-all duration-300 z-10">
          <button
            onClick={(e) => { e.stopPropagation(); setQuickViewProduct(product); }}
            className="flex-1 py-2 px-3 bg-[#1c1713]/95 hover:bg-gem-pink text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
          <button
            onClick={handleQuickAdd}
            disabled={totalStock <= 0}
            className="p-2 bg-gem-pink hover:bg-gem-deepPink text-white disabled:bg-slate-400 disabled:cursor-not-allowed"
            title="Quick Add to Cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details Section */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between text-[#181411]">
        <div>
          <span className="text-[10px] font-bold uppercase text-gem-pink tracking-wider block mb-1">
            {product.category}
          </span>
          <h3 className="font-serif text-lg font-bold text-[#181411] group-hover:text-gem-pink transition-colors line-clamp-1">
            {product.title}
          </h3>

          {/* Color Swatches — click to preview that color's image */}
          {product.colors.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2.5">
              {product.colors.map((c, idx) => (
                <button
                  key={c.name}
                  onClick={(e) => handleSwatchClick(e, idx)}
                  title={c.name}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 hover:scale-125 ${
                    activeColorIdx === idx
                    ? 'border-gem-pink scale-110 shadow-[0_0_6px_rgba(217,47,110,0.35)]'
                      : 'border-[#d9cbb9] hover:border-[#5e5147]'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
              {product.colors.length > 1 && (
                <span className="text-[10px] text-[#5e5147] ml-1 truncate max-w-[80px]">
                  {product.colors[activeColorIdx]?.name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Stock */}
        <div className="mt-4 pt-3 border-t border-[#d9cbb9] flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-base font-extrabold text-[#181411] font-sans">
              KSh {displayPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-500 line-through">
                KSh {product.price.toLocaleString()}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            totalStock > 5
              ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
              : totalStock > 0
              ? 'text-amber-400 bg-amber-950/40 border border-amber-800/40'
              : 'text-rose-400 bg-rose-950/40 border border-rose-800/40'
          }`}>
            {totalStock > 5 ? 'In Stock' : totalStock > 0 ? `${totalStock} Left` : 'Sold Out'}
          </span>
        </div>
      </div>
    </div>
  );
};
