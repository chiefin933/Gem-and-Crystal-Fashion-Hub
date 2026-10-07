import React, { useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Heart,
  Star,
  Truck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Minus,
  Plus,
} from "lucide-react";
import { Product } from "../../types/ecommerce";
import { useStore } from "../../context/useStore";
import { ProductCard } from "./ProductCard";

interface ProductDetailPageProps {
  product: Product;
  allProducts: Product[];
  onBack: () => void;
  onSelectProduct: (p: Product) => void;
  onBuyNow: (
    product: Product,
    size: string,
    color: string,
    qty: number,
  ) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  allProducts,
  onBack,
  onSelectProduct,
  onBuyNow,
}) => {
  const { addToCart, toggleWishlist, isInWishlist, setIsCartOpen } = useStore();

  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [activeColorIdx, setActiveColorIdx] = useState(0);
  const onlyVariant =
    product.variants.length === 1 ? product.variants[0] : null;
  const [selectedSize, setSelectedSize] = useState(onlyVariant?.size || "");
  const [selectedColor, setSelectedColor] = useState(onlyVariant?.color || "");
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<
    "shipping" | "returns" | "care" | null
  >("shipping");

  const handleColorSelect = (colorName: string, colorIdx: number) => {
    setSelectedColor(colorName);
    setQuantity(1);
    setActiveColorIdx(colorIdx);
    const targetImage = product.images[colorIdx] ?? product.images[0];
    setActiveImage(targetImage);
  };

  const handlePrevColor = () => {
    if (product.colors.length <= 1) return;
    const prevIdx =
      (activeColorIdx - 1 + product.colors.length) % product.colors.length;
    handleColorSelect(product.colors[prevIdx].name, prevIdx);
  };

  const handleNextColor = () => {
    if (product.colors.length <= 1) return;
    const nextIdx = (activeColorIdx + 1) % product.colors.length;
    handleColorSelect(product.colors[nextIdx].name, nextIdx);
  };

  const selectedVariant = product.variants.find(
    (v) => v.size === selectedSize && v.color === selectedColor,
  );

  const availableStock = selectedVariant ? selectedVariant.stockQuantity : 0;
  const currentPrice =
    selectedVariant?.salePrice ?? selectedVariant?.price ?? product.price;

  const relatedProducts = allProducts
    .filter(
      (p) =>
        p.id !== product.id &&
        (p.category === product.category || p.gender === product.gender),
    )
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, quantity);
  };

  const handleBuyNowClick = () => {
    if (addToCart(product, selectedSize, selectedColor, quantity)) {
      setIsCartOpen(false);
      onBuyNow(product, selectedSize, selectedColor, quantity);
    }
  };

  return (
    <div className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-gem-muted hover:text-gem-pink transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Catalogue</span>
        </button>

        {/* Main PDP Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Gallery Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails list */}
            {product.images.length > 1 && (
              <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto max-h-[560px]">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    aria-label={`View product image ${idx + 1}`}
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === img
                        ? "border-gem-pink scale-105 "
                        : "border-gem-border opacity-60 hover:opacity-100"
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

            {/* Main Stage Image */}
            <div className="flex-1 aspect-[3/4] overflow-hidden bg-white relative">
              <img
                key={activeImage}
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover object-top animate-fade-in"
              />
              {product.onSale && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-gem-pink text-white font-extrabold text-xs   rounded ">
                  SALE
                </span>
              )}
              {/* Active Color Label overlay */}
              {product.colors.length > 1 && (
                <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-white text-[11px] font-semibold text-gem-ink flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full border border-white/30"
                    style={{
                      backgroundColor:
                        product.colors[activeColorIdx]?.hex ?? "#fff",
                    }}
                  />
                  <span>{selectedColor}</span>
                </div>
              )}
            </div>
          </div>

          {/* Product Details & Purchase Form Column (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            <div>
              <span className="text-xs font-bold   text-gem-pink block mb-1">
                {product.category}
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gem-ink mb-3 leading-tight">
                {product.title}
              </h1>

              {/* Star Rating */}
              {product.reviewCount > 0 && (
                <div className="flex items-center space-x-2 mb-6">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? "fill-amber-400" : "text-slate-600"}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-gem-muted">
                    {product.rating} ({product.reviewCount} customer reviews)
                  </span>
                </div>
              )}

              {/* Pricing Box */}
              <div className="flex items-baseline space-x-3 mb-6 py-4 border-b border-gem-border">
                <span className="text-3xl font-extrabold text-gem-ink">
                  KSh {currentPrice.toLocaleString()}
                </span>
                {product.onSale && product.price > currentPrice && (
                  <span className="text-sm text-gem-muted line-through">
                    KSh {product.price.toLocaleString()}
                  </span>
                )}
              </div>

              <p className="text-xs text-gem-ink font-light leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div className="mb-6">
                  <label className="text-xs font-bold text-gem-ink   block mb-3 font-sans">
                    Colour
                  </label>

                  {/* Prev / Active / Next navigation */}
                  <div className="flex items-center gap-3">
                    {/* Back button */}
                    <button
                      onClick={handlePrevColor}
                      disabled={product.colors.length <= 1}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gem-border hover:border-gem-pink hover:bg-gem-pink/10 text-gem-ink hover:text-gem-pink disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Previous colour"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Active colour preview */}
                    <div className="flex items-center gap-2.5 flex-1 px-4 py-2.5 rounded-sm bg-white border border-gem-border">
                      <span
                        className="w-7 h-7 rounded-full border-2 border-gem-pink  shrink-0"
                        style={{
                          backgroundColor:
                            product.colors[activeColorIdx]?.hex ?? "#fff",
                        }}
                      />
                      <div>
                        <p className="text-gem-ink font-semibold text-sm leading-tight">
                          {product.colors[activeColorIdx]?.name}
                        </p>
                        <p className="text-[10px] text-gem-muted">
                          {activeColorIdx + 1} of {product.colors.length}
                        </p>
                      </div>
                    </div>

                    {/* Forward button */}
                    <button
                      onClick={handleNextColor}
                      disabled={product.colors.length <= 1}
                      className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-gem-border hover:border-gem-pink hover:bg-gem-pink/10 text-gem-ink hover:text-gem-pink disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Next colour"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* All colour dots for direct jump */}
                  <div className="flex items-center gap-2 mt-3">
                    {product.colors.map((c, idx) => (
                      <button
                        key={c.name}
                        onClick={() => handleColorSelect(c.name, idx)}
                        title={c.name}
                        className={`w-5 h-5 rounded-full border-2 transition-all duration-200 hover:scale-125 ${
                          activeColorIdx === idx
                            ? "border-gem-pink scale-110 "
                            : "border-gem-border hover:border-slate-400"
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-gem-ink   font-sans">
                      Size:{" "}
                      <span className="text-gem-pink font-semibold">
                        {selectedSize}
                      </span>
                    </label>
                    <a
                      href={`https://wa.me/254718796296?text=${encodeURIComponent(`Please help me choose a size for ${product.title}.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-gem-pink underline"
                    >
                      Ask about sizing
                    </a>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setSelectedSize(s);
                          setQuantity(1);
                        }}
                        aria-pressed={selectedSize === s}
                        className={`w-12 h-11 rounded-lg font-bold text-xs border transition-all ${
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

              {/* Quantity & Stock */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center border border-gem-border rounded-lg bg-white">
                  <button
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gem-muted hover:text-gem-ink font-bold"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 text-xs font-bold text-gem-ink">
                    {quantity}
                  </span>
                  <button
                    aria-label="Increase quantity"
                    disabled={availableStock <= quantity}
                    onClick={() =>
                      setQuantity(
                        Math.max(1, Math.min(availableStock, quantity + 1)),
                      )
                    }
                    className="px-3 py-2 text-gem-muted hover:text-gem-ink font-bold"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <span
                  className={`text-xs font-semibold ${availableStock > 0 ? "text-emerald-700" : "text-gem-pink"}`}
                >
                  {!selectedSize || !selectedColor
                    ? "Choose a size and colour"
                    : availableStock > 0
                      ? `In Stock (${availableStock} available)`
                      : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-3 pt-4 border-t border-gem-border">
              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={availableStock <= 0}
                  className="flex-1 py-4 bg-gem-pink hover:bg-gem-magenta disabled:bg-slate-700 text-white font-extrabold text-xs   rounded-sm  transition-all flex items-center justify-center space-x-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>ADD TO CART</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  aria-label="Wishlist toggle"
                  className="p-4 bg-white border border-gem-border hover:border-gem-pink rounded-sm text-gem-ink hover:text-gem-pink transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${isInWishlist(product.id) ? "fill-gem-pink text-gem-pink" : ""}`}
                  />
                </button>
              </div>

              <button
                onClick={handleBuyNowClick}
                disabled={availableStock <= 0}
                className="w-full py-4 bg-white hover:bg-gem-card border border-gem-border hover:border-gem-pink text-gem-ink font-extrabold text-xs   rounded-sm transition-all"
              >
                BUY NOW WITH M-PESA
              </button>
            </div>

            {/* Shipping Accordions */}
            <div className="pt-6 border-t border-gem-border space-y-3">
              <div className="border border-gem-border rounded-sm overflow-hidden bg-white">
                <button
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === "shipping" ? null : "shipping",
                    )
                  }
                  className="w-full px-4 py-3 text-left text-xs font-bold text-gem-ink flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-gem-pink" />
                    <span>Shipping & Kenya Delivery</span>
                  </div>
                  {openAccordion === "shipping" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openAccordion === "shipping" && (
                  <div className="px-4 pb-4 text-xs text-gem-muted font-light border-t border-gem-border/40 pt-3">
                    Contact the boutique to confirm delivery availability,
                    timing and cost for your location. Delivery charges are
                    agreed separately and are not included in the product order
                    total.
                  </div>
                )}
              </div>

              <div className="border border-gem-border rounded-sm overflow-hidden bg-white">
                <button
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === "returns" ? null : "returns",
                    )
                  }
                  className="w-full px-4 py-3 text-left text-xs font-bold text-gem-ink flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-4 h-4 text-gem-pink" />
                    <span>Returns &amp; exchanges</span>
                  </div>
                  {openAccordion === "returns" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {openAccordion === "returns" && (
                  <div className="px-4 pb-4 text-xs text-gem-muted font-light border-t border-gem-border/40 pt-3">
                    Contact the boutique about return or exchange arrangements
                    before ordering. We can help with sizing and product
                    questions on WhatsApp.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="pt-12 border-t border-gem-border/60">
            <h2 className="font-serif text-2xl font-bold text-gem-ink mb-6">
              YOU MAY ALSO LIKE
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onSelect={onSelectProduct}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
