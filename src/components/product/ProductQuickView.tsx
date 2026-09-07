import React, { useState } from 'react';
import { X, ShoppingBag, Heart, Star, Check } from 'lucide-react';
import { useStore } from '../../context/useStore';

export const ProductQuickView: React.FC = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, isInWishlist } = useStore();

  if (!quickViewProduct) return null;

  const [selectedSize, setSelectedSize] = useState(quickViewProduct.sizes[0] || 'M');
  const [selectedColor, setSelectedColor] = useState(quickViewProduct.colors[0]?.name || 'Standard');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const selectedVariant = quickViewProduct.variants.find(
    v => v.size === selectedSize && v.color === selectedColor
  );

  const availableStock = selectedVariant ? selectedVariant.stockQuantity : 0;
  const displayPrice = selectedVariant?.salePrice ?? selectedVariant?.price ?? quickViewProduct.price;

  const handleAddToCart = () => {
    addToCart(quickViewProduct, selectedSize, selectedColor, quantity);
    setQuickViewProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={() => setQuickViewProduct(null)}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-4xl bg-[#09090b] border border-gem-pink/40 rounded-2xl overflow-hidden shadow-2xl z-10 grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-slate-300 hover:text-gem-pink hover:bg-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Column */}
        <div className="p-6 bg-[#121215] flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-gem-border">
          <div className="w-full aspect-[3/4] rounded-xl overflow-hidden mb-4 bg-black">
            <img
              src={quickViewProduct.images[activeImageIndex] || quickViewProduct.images[0]}
              alt={quickViewProduct.title}
              className="w-full h-full object-cover object-top"
            />
          </div>

          {quickViewProduct.images.length > 1 && (
            <div className="flex gap-2">
              {quickViewProduct.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-14 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx ? 'border-gem-pink scale-105' : 'border-gem-border opacity-60'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Options Column */}
        <div className="p-6 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-gem-pink block mb-1">
              {quickViewProduct.category}
            </span>
            <h2 className="font-serif text-2xl font-bold text-white mb-2">
              {quickViewProduct.title}
            </h2>

            <div className="flex items-center space-x-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(quickViewProduct.rating) ? 'fill-amber-400' : 'text-slate-600'}`}
                  />
                ))}
              </div>
              <span className="text-xs text-slate-400">({quickViewProduct.reviewCount} reviews)</span>
            </div>

            <div className="text-2xl font-extrabold text-white mb-4">
              KSh {displayPrice.toLocaleString()}
            </div>

            <p className="text-xs text-slate-300 font-light leading-relaxed mb-6">
              {quickViewProduct.description}
            </p>

            {/* Color Selector */}
            {quickViewProduct.colors.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Select Color: <span className="text-gem-pink font-semibold">{selectedColor}</span>
                </label>
                <div className="flex gap-2">
                  {quickViewProduct.colors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
                        selectedColor === c.name
                          ? 'bg-gem-pink/20 border-gem-pink text-white'
                          : 'bg-[#121215] border-gem-border text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {quickViewProduct.sizes.length > 0 && (
              <div className="mb-6">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                  Select Size: <span className="text-gem-pink font-semibold">{selectedSize}</span>
                </label>
                <div className="flex gap-2">
                  {quickViewProduct.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-10 h-10 rounded-md font-bold text-xs border transition-all ${
                        selectedSize === s
                          ? 'bg-gem-pink border-gem-pink text-white shadow-pink-glow'
                          : 'bg-[#121215] border-gem-border text-slate-300 hover:border-slate-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stock status indicator */}
            <div className="mb-4 text-xs font-semibold">
              Status: {' '}
              <span className={availableStock > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                {availableStock > 0 ? `In Stock (${availableStock} available)` : 'Out of Stock'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4 border-t border-gem-border">
            <button
              onClick={handleAddToCart}
              disabled={availableStock <= 0}
              className="flex-1 py-3.5 bg-gem-pink hover:bg-gem-magenta disabled:bg-slate-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-lg shadow-pink-glow transition-all flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ADD TO CART</span>
            </button>

            <button
              onClick={() => toggleWishlist(quickViewProduct.id)}
              className="p-3.5 bg-[#141419] border border-gem-border hover:border-gem-pink rounded-lg text-slate-300 hover:text-gem-pink transition-colors"
            >
              <Heart className={`w-5 h-5 ${isInWishlist(quickViewProduct.id) ? 'fill-gem-pink text-gem-pink' : ''}`} />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
