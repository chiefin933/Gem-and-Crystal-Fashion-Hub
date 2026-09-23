import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Check } from 'lucide-react';
import { useStore } from '../../context/useStore';
import { validateCoupon } from '../../api/client';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onContinueShopping,
}) => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeFromCart,
    cartSubtotal,
    showToast,
    appliedCoupon,
    setAppliedCoupon,
  } = useStore();

  const [promoCode, setPromoCode] = useState('');
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    try {
      const res = await validateCoupon(promoCode, cartSubtotal);
      if (!res.valid || !res.coupon) {
        showToast(res.error || 'This promo code is not available.', 'error');
        return;
      }
      setAppliedCoupon({ code: res.coupon.code, discount: res.coupon.discountAmount });
      setPromoCode(res.coupon.code);
      showToast(`Promo code ${res.coupon.code} applied.`, 'success');
    } catch (error: any) {
      setAppliedCoupon(null);
      showToast(error.message || 'Unable to validate this promo code.', 'error');
    } finally {
      setIsApplyingPromo(false);
    }
  };

  const appliedDiscount = appliedCoupon?.discount || 0;
  const grandTotal = Math.max(0, cartSubtotal - appliedDiscount);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="shopping-surface shopping-drawer relative w-full max-w-md bg-[#09090b] border-l border-gem-border h-full flex flex-col z-10 shadow-2xl">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-gem-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-gem-pink" />
            <h2 className="font-serif text-xl font-bold text-white">Your Shopping Cart</h2>
            <span className="text-xs font-bold bg-gem-pink text-white px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-[#121215]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.length > 0 ? (
            cart.map((item) => (
              <div
                key={item.variantId}
                className="flex gap-4 p-3 rounded-xl bg-[#121215] border border-gem-border/60 relative group"
              >
                {/* Image */}
                <div className="w-20 h-24 rounded-lg overflow-hidden bg-black shrink-0">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover object-top" />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-white line-clamp-1">
                      {item.title}
                    </h4>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span>Size: <strong className="text-gem-pink">{item.size}</strong></span>
                      <span>•</span>
                      <span>Color: <strong className="text-slate-200">{item.color}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gem-border rounded bg-[#09090b]">
                      <button
                        onClick={() => updateCartQuantity(item.variantId, item.quantity - 1)}
                        className="px-2 py-0.5 text-slate-400 hover:text-white font-bold text-xs"
                      >
                        -
                      </button>
                      <span className="px-2 text-xs font-bold text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(item.variantId, item.quantity + 1)}
                        className="px-2 py-0.5 text-slate-400 hover:text-white font-bold text-xs"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-xs font-extrabold text-white">
                      KSh {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.variantId)}
                  className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 p-1"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-gem-pink/30 mx-auto mb-4" />
              <p className="font-serif text-lg font-bold text-white mb-2">Your Cart is Empty</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
                Discover our latest luxury mom jeans, crop tops, dresses and heels catalogue.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onContinueShopping();
                }}
                className="px-6 py-3 bg-gem-pink text-white text-xs font-bold uppercase rounded-md shadow-pink-glow"
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>

        {/* Footer & Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gem-border bg-[#0e0e11] space-y-4">
            
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Promo Code (e.g. GEM10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full bg-[#121215] border border-gem-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-gem-pink focus:outline-none uppercase font-mono font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={isApplyingPromo}
                className="px-3.5 py-2 bg-[#18181b] hover:bg-gem-pink text-slate-200 hover:text-white border border-gem-border rounded-lg text-xs font-bold transition-colors"
              >
                {isApplyingPromo ? 'Checking…' : 'Apply'}
              </button>
            </form>

            {appliedCoupon && (
              <div className="flex justify-between items-center text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                <span className="flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Code <strong>{appliedCoupon.code}</strong> applied</span>
                </span>
                <span>-KSh {appliedDiscount.toLocaleString()}</span>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-white font-semibold">KSh {cartSubtotal.toLocaleString()}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-gem-pink">
                  <span>Discount</span>
                  <span>-KSh {appliedDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-amber-300">Arranged separately</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-500">
                Pay the delivery person directly after agreeing the cost. It is not included in this order total.
              </p>

              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-gem-border">
                <span>Order Total</span>
                <span className="text-gem-pink">KSh {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              className="w-full py-4 bg-gem-pink hover:bg-gem-magenta text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-pink-glow transition-all flex items-center justify-center space-x-2"
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
