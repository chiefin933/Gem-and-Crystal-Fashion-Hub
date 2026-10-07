import React, { useState } from "react";
import { X, ShoppingBag, Heart, Star } from "lucide-react";
import { useStore } from "../../context/useStore";
import { Product } from "../../types/ecommerce";
import { useModalDialog } from "../../utils/useModalDialog";

export const ProductQuickView: React.FC = () => {
  const { quickViewProduct } = useStore();
  return quickViewProduct ? (
    <ProductQuickViewContent
      key={quickViewProduct.id}
      quickViewProduct={quickViewProduct}
    />
  ) : null;
};

const ProductQuickViewContent: React.FC<{ quickViewProduct: Product }> = ({
  quickViewProduct,
}) => {
  const { setQuickViewProduct, addToCart, toggleWishlist, isInWishlist } =
    useStore();
  useModalDialog(true, "quick-view", () => setQuickViewProduct(null));

  const onlyVariant =
    quickViewProduct.variants.length === 1
      ? quickViewProduct.variants[0]
      : null;
  const [selectedSize, setSelectedSize] = useState(onlyVariant?.size || "");
  const [selectedColor, setSelectedColor] = useState(onlyVariant?.color || "");
  const quantity = 1;
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const selectedVariant = quickViewProduct.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor,
  );

  const availableStock = selectedVariant ? selectedVariant.stockQuantity : 0;
  const displayPrice =
    selectedVariant?.salePrice ??
    selectedVariant?.price ??
    quickViewProduct.price;

  const handleAddToCart = () => {
    if (addToCart(quickViewProduct, selectedSize, selectedColor, quantity))
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
      <div
        data-dialog="quick-view"
        role="dialog"
        aria-modal="true"
        aria-label={quickViewProduct.title}
        className="relative w-full max-w-4xl bg-white border border-gem-border rounded-sm overflow-hidden shadow-xl z-10 grid grid-cols-1 md:grid-cols-2 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          aria-label="Close quick view"
          onClick={() => setQuickViewProduct(null)}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white text-gem-ink hover:text-gem-pink hover:bg-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Column */}
        <div className="p-6 bg-white flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-gem-border">
          <div className="w-full aspect-[3/4] rounded-sm overflow-hidden mb-4 bg-black">
            <img
              src={
                quickViewProduct.images[activeImageIndex] ||
                quickViewProduct.images[0]
              }
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
                  aria-label={`View image ${idx + 1}`}
                  className={`w-14 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImageIndex === idx
                      ? "border-gem-pink scale-105"
                      : "border-gem-border opacity-60"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info & Options Column */}
        <div className="p-6 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold   text-gem-pink block mb-1">
              {quickViewProduct.category}
            </span>
            <h2 className="font-serif text-2xl font-bold text-gem-ink mb-2">
              {quickViewProduct.title}
            </h2>

            {quickViewProduct.reviewCount > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < Math.floor(quickViewProduct.rating) ? "fill-amber-400" : "text-slate-600"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gem-muted">
                  ({quickViewProduct.reviewCount} reviews)
                </span>
              </div>
            )}

            <div className="text-2xl font-extrabold text-gem-ink mb-4">
              KSh {displayPrice.toLocaleString()}
            </div>

            <p className="text-xs text-gem-ink font-light leading-relaxed mb-6">
              {quickViewProduct.description}
            </p>

            {/* Color Selector */}
            {quickViewProduct.colors.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-bold text-gem-ink   block mb-2">
                  Select Color:{" "}
                  <span className="text-gem-pink font-semibold">
                    {selectedColor}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.colors.map((c) => (
                    <button
                      key={c.name}
                      aria-pressed={selectedColor === c.name}
                      onClick={() => setSelectedColor(c.name)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold border flex items-center space-x-1.5 transition-all ${
                        selectedColor === c.name
                          ? "bg-gem-pink/20 border-gem-pink text-white"
                          : "bg-white border-gem-border text-gem-muted hover:text-gem-ink"
                      }`}
                    >
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selector */}
            {quickViewProduct.sizes.length > 0 && (
              <div className="mb-6">
                <label className="text-xs font-bold text-gem-ink   block mb-2">
                  Select Size:{" "}
                  <span className="text-gem-pink font-semibold">
                    {selectedSize}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {quickViewProduct.sizes.map((s) => (
                    <button
                      key={s}
                      aria-pressed={selectedSize === s}
                      onClick={() => setSelectedSize(s)}
                      className={`w-10 h-10 rounded-md font-bold text-xs border transition-all ${
                        selectedSize === s
                          ? "bg-gem-pink border-gem-pink text-white "
                          : "bg-white border-gem-border text-gem-ink hover:border-slate-400"
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
              Status:{" "}
              <span
                className={
                  availableStock > 0 ? "text-emerald-700" : "text-gem-pink"
                }
              >
                {!selectedSize || !selectedColor
                  ? "Choose a size and colour"
                  : availableStock > 0
                    ? `In Stock (${availableStock} available)`
                    : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-4 border-t border-gem-border">
            <button
              onClick={handleAddToCart}
              disabled={availableStock <= 0}
              className="flex-1 py-3.5 bg-gem-pink hover:bg-gem-magenta disabled:bg-slate-700 text-white font-extrabold text-xs   rounded-lg  transition-all flex items-center justify-center space-x-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>ADD TO CART</span>
            </button>

            <button
              onClick={() => toggleWishlist(quickViewProduct.id)}
              aria-label={
                isInWishlist(quickViewProduct.id)
                  ? "Remove from wishlist"
                  : "Save to wishlist"
              }
              aria-pressed={isInWishlist(quickViewProduct.id)}
              className="p-3.5 bg-white border border-gem-border hover:border-gem-pink rounded-lg text-gem-ink hover:text-gem-pink transition-colors"
            >
              <Heart
                className={`w-5 h-5 ${isInWishlist(quickViewProduct.id) ? "fill-gem-pink text-gem-pink" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
