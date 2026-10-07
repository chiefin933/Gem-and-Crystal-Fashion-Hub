import React, { useState } from "react";
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Tag,
  Check,
  Minus,
  Plus,
} from "lucide-react";
import { useModalDialog } from "../../utils/useModalDialog";
import { useStore } from "../../context/useStore";
import { validateCoupon } from "../../api/client";

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

  const [promoCode, setPromoCode] = useState("");
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  useModalDialog(isCartOpen, "cart", () => setIsCartOpen(false));

  if (!isCartOpen) return null;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsApplyingPromo(true);
    try {
      const res = await validateCoupon(promoCode, cartSubtotal);
      if (!res.valid || !res.coupon) {
        showToast(res.error || "This promo code is not available.", "error");
        return;
      }
      setAppliedCoupon({
        code: res.coupon.code,
        discount: res.coupon.discountAmount,
      });
      setPromoCode(res.coupon.code);
      showToast(`Promo code ${res.coupon.code} applied.`, "success");
    } catch (error: any) {
      setAppliedCoupon(null);
      showToast(
        error.message || "Unable to validate this promo code.",
        "error",
      );
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
      <div
        data-dialog="cart"
        role="dialog"
        aria-modal="true"
        aria-label="Shopping bag"
        className="relative w-full max-w-md bg-white border-l border-gem-border h-full flex flex-col z-10 shadow-xl"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-gem-border flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-gem-pink" />
            <h2 className="font-serif text-xl font-bold text-gem-ink">
              Your Shopping Cart
            </h2>
            <span className="text-xs font-bold bg-gem-pink text-white px-2 py-0.5 rounded-full">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            aria-label="Close shopping bag"
            className="p-1.5 text-gem-muted hover:text-gem-ink rounded-lg hover:bg-white"
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
                className="flex gap-4 p-3 rounded-sm bg-white border border-gem-border/60 relative group"
              >
                {/* Image */}
                <div className="w-20 h-24 overflow-hidden bg-gem-dark shrink-0">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-serif text-sm font-bold text-gem-ink line-clamp-1">
                      {item.title}
                    </h4>
                    <div className="text-[11px] text-gem-muted flex items-center space-x-2 mt-0.5">
                      <span>
                        Size:{" "}
                        <strong className="text-gem-pink">{item.size}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Color:{" "}
                        <strong className="text-gem-ink">{item.color}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gem-border rounded bg-white">
                      <button
                        aria-label={`Decrease quantity of ${item.title}`}
                        onClick={() =>
                          updateCartQuantity(item.variantId, item.quantity - 1)
                        }
                        className="px-2 py-0.5 text-gem-muted hover:text-gem-ink font-bold text-xs"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-2 text-xs font-bold text-gem-ink">
                        {item.quantity}
                      </span>
                      <button
                        aria-label={`Increase quantity of ${item.title}`}
                        disabled={item.quantity >= item.maxStock}
                        onClick={() =>
                          updateCartQuantity(item.variantId, item.quantity + 1)
                        }
                        className="px-2 py-0.5 text-gem-muted hover:text-gem-ink font-bold text-xs"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <span className="text-xs font-extrabold text-gem-ink">
                      KSh {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.variantId)}
                  className="absolute top-2 right-2 text-gem-muted hover:text-gem-pink p-1"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="w-16 h-16 text-gem-pink/30 mx-auto mb-4" />
              <p className="font-serif text-lg font-bold text-gem-ink mb-2">
                Your Cart is Empty
              </p>
              <p className="text-xs text-gem-muted max-w-xs mx-auto mb-6">
                Discover our latest luxury mom jeans, crop tops, dresses and
                heels catalogue.
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onContinueShopping();
                }}
                className="px-6 py-3 bg-gem-pink text-white text-xs font-bold  rounded-md "
              >
                Start Shopping
              </button>
            </div>
          )}
        </div>

        {/* Footer & Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gem-border bg-white space-y-4">
            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-gem-muted absolute left-3 top-3" />
                <input
                  aria-label="Promo code"
                  type="text"
                  placeholder="Promo Code (e.g. GEM10)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full bg-white border border-gem-border rounded-lg pl-9 pr-3 py-2 text-xs text-gem-ink placeholder-slate-500 focus:border-gem-pink focus:outline-none  font-mono font-bold"
                />
              </div>
              <button
                type="submit"
                disabled={isApplyingPromo}
                className="px-3.5 py-2 bg-gem-black hover:bg-gem-pink text-white border border-gem-border rounded-sm text-xs font-bold transition-colors"
              >
                {isApplyingPromo ? "Checking…" : "Apply"}
              </button>
            </form>

            {appliedCoupon && (
              <div className="flex justify-between items-center text-xs text-emerald-700 bg-emerald-50 p-2 border border-emerald-200">
                <span className="flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    Code <strong>{appliedCoupon.code}</strong> applied
                  </span>
                </span>
                <span>-KSh {appliedDiscount.toLocaleString()}</span>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-gem-muted">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-gem-ink font-semibold">
                  KSh {cartSubtotal.toLocaleString()}
                </span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-gem-pink">
                  <span>Discount</span>
                  <span>-KSh {appliedDiscount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Delivery</span>
                <span className="text-gem-muted">Arranged separately</span>
              </div>
              <p className="text-[10px] leading-relaxed text-gem-muted">
                Pay the delivery person directly after agreeing the cost. It is
                not included in this order total.
              </p>

              <div className="flex justify-between text-base font-extrabold text-gem-ink pt-2 border-t border-gem-border">
                <span>Order Total</span>
                <span className="text-gem-pink">
                  KSh {grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout CTA */}
            <button
              onClick={() => {
                setIsCartOpen(false);
                onProceedToCheckout();
              }}
              className="w-full py-4 bg-gem-pink hover:bg-gem-magenta text-white font-extrabold text-xs   rounded-sm  transition-all flex items-center justify-center space-x-2"
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
