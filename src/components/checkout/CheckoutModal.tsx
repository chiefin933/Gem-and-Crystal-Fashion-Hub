import React, { useState, useEffect, useRef } from "react";
import {
  X,
  ShieldCheck,
  Smartphone,
  CreditCard,
  ArrowRight,
  Loader2,
  Clock,
} from "lucide-react";
import { useStore } from "../../context/useStore";
import {
  createCheckoutSession,
  pollCheckoutSession,
  CheckoutSessionResponse,
} from "../../api/client";
import { Order } from "../../types/ecommerce";
import { useModalDialog } from "../../utils/useModalDialog";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

const PENDING_CHECKOUT_KEY = "gem.pendingCheckout.v1";
function readPendingCheckout(): CheckoutSessionResponse | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(PENDING_CHECKOUT_KEY) || "null",
    );
    return value &&
      typeof value.sessionRef === "string" &&
      typeof value.trackingToken === "string" &&
      typeof value.total === "number"
      ? value
      : null;
  } catch {
    return null;
  }
}
function savePendingCheckout(value: CheckoutSessionResponse | null) {
  try {
    if (value)
      sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(value));
    else sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
  } catch {
    /* The in-memory session still works when browser storage is disabled. */
  }
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { cart, cartSubtotal, clearCart, showToast, appliedCoupon } =
    useStore();
  useModalDialog(isOpen, "checkout", onClose);

  const [step, setStep] = useState<"info" | "payment" | "awaiting">(() =>
    readPendingCheckout() ? "awaiting" : "info",
  );

  // Guest Customer Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [county, setCounty] = useState("Nairobi");
  const [townCity, setTownCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [requestedDeliveryDate, setRequestedDeliveryDate] = useState("");

  // Payment Selection State — CARD is disabled until a payment gateway is integrated
  const paymentMethod = "MPESA" as const;

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Session state — returned after successful session creation
  const [session, setSession] = useState<CheckoutSessionResponse | null>(
    readPendingCheckout,
  );
  const submittingRef = useRef(false);
  const [paymentStatus, setPaymentStatus] = useState("AWAITING_PAYMENT");
  const [pollError, setPollError] = useState("");
  const callbacks = useRef({ onOrderSuccess, clearCart });
  useEffect(() => {
    callbacks.current = { onOrderSuccess, clearCart };
  }, [onOrderSuccess, clearCart]);

  const appliedDiscount = appliedCoupon?.discount || 0;
  const grandTotal = Math.max(0, cartSubtotal - appliedDiscount);

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !townCity || !address) {
      showToast("Please fill in all required shipping fields.", "error");
      return;
    }
    setStep("payment");
  };

  const handleStartPayment = async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const sess = await createCheckoutSession({
        customer: { fullName, email, phone, county, townCity, address, notes },
        items: cart.map(({ variantId, quantity }) => ({ variantId, quantity })),
        paymentMethod,
        couponCode: appliedCoupon?.code,
        requestedDeliveryDate: requestedDeliveryDate || undefined,
      });
      savePendingCheckout(sess);
      setSession(sess);
      setPaymentStatus("AWAITING_PAYMENT");
      setStep("awaiting");
    } catch (err: unknown) {
      showToast(
        err instanceof Error
          ? err.message
          : "Failed to create checkout session.",
        "error",
      );
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // One request at a time; resume the same payment after reopening or refreshing.
  useEffect(() => {
    if (!isOpen || step !== "awaiting" || !session) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        const status = await pollCheckoutSession(
          session.sessionRef,
          session.trackingToken,
        );
        if (cancelled) return;
        setPollError("");
        setPaymentStatus(status.status);
        if (status.status === "PAID" && status.order) {
          savePendingCheckout(null);
          setSession(null);
          setStep("info");
          callbacks.current.clearCart();
          callbacks.current.onOrderSuccess(status.order);
          return;
        }
      } catch {
        if (cancelled) return;
        setPollError(
          "Connection interrupted. We will keep checking. Do not pay again.",
        );
      }
      if (!cancelled) timer = setTimeout(() => void poll(), 3000);
    };
    void poll();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isOpen, session, step]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div
        data-dialog="checkout"
        role="dialog"
        aria-modal="true"
        aria-label="Checkout"
        className="checkout-panel relative w-full max-w-2xl bg-white border border-gem-border overflow-hidden shadow-xl z-10 p-6 md:p-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          aria-label="Close checkout"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gem-muted hover:text-gem-ink hover:bg-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pb-4 border-b border-gem-border">
          <div className="flex items-center space-x-2 text-gem-pink mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold">Guest checkout</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-gem-ink">
            {step === "info"
              ? "1. Shipping & Delivery Address"
              : step === "payment"
                ? "2. Confirm Your Order"
                : "3. Complete Your M-PESA Payment"}
          </h2>
        </div>

        {/* STEP 1: INFO FORM */}
        {step === "info" && (
          <form
            onSubmit={handleInfoSubmit}
            className="space-y-4 text-xs text-gem-ink"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="checkout-name"
                  className="font-bold text-gem-ink block mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="checkout-name"
                  autoComplete="name"
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white border border-gem-border rounded-lg px-3.5 py-2.5 text-gem-ink focus:border-gem-pink focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-email"
                  className="font-bold text-gem-ink block mb-1"
                >
                  Email Address *
                </label>
                <input
                  id="checkout-email"
                  autoComplete="email"
                  type="email"
                  required
                  placeholder="e.g. jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-gem-border rounded-lg px-3.5 py-2.5 text-gem-ink focus:border-gem-pink focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="checkout-phone"
                  className="font-bold text-gem-ink block mb-1"
                >
                  Phone Number (For Delivery & M-PESA) *
                </label>
                <input
                  id="checkout-phone"
                  autoComplete="tel"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-gem-border rounded-lg px-3.5 py-2.5 text-gem-ink focus:border-gem-pink focus:outline-none font-mono"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-county"
                  className="font-bold text-gem-ink block mb-1"
                >
                  County (Kenya) *
                </label>
                <select
                  id="checkout-county"
                  autoComplete="address-level1"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  required
                  className="w-full bg-white border border-gem-border rounded-lg px-3.5 py-2.5 text-gem-ink focus:border-gem-pink focus:outline-none cursor-pointer"
                >
                  {[
                    "Baringo",
                    "Bomet",
                    "Bungoma",
                    "Busia",
                    "Elgeyo-Marakwet",
                    "Embu",
                    "Garissa",
                    "Homa Bay",
                    "Isiolo",
                    "Kajiado",
                    "Kakamega",
                    "Kericho",
                    "Kiambu",
                    "Kilifi",
                    "Kirinyaga",
                    "Kisii",
                    "Kisumu",
                    "Kitui",
                    "Kwale",
                    "Laikipia",
                    "Lamu",
                    "Machakos",
                    "Makueni",
                    "Mandera",
                    "Marsabit",
                    "Meru",
                    "Migori",
                    "Mombasa",
                    "Murang'a",
                    "Nairobi",
                    "Nakuru",
                    "Nandi",
                    "Narok",
                    "Nyamira",
                    "Nyandarua",
                    "Nyeri",
                    "Samburu",
                    "Siaya",
                    "Taita-Taveta",
                    "Tana River",
                    "Tharaka-Nithi",
                    "Trans-Nzoia",
                    "Turkana",
                    "Uasin Gishu",
                    "Vihiga",
                    "Wajir",
                    "West Pokot",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="checkout-town"
                  className="font-bold text-gem-ink block mb-1"
                >
                  Town / Area *
                </label>
                <input
                  id="checkout-town"
                  autoComplete="address-level2"
                  type="text"
                  required
                  placeholder="e.g. Roysambu, TRM Drive"
                  value={townCity}
                  onChange={(e) => setTownCity(e.target.value)}
                  className="w-full bg-white border border-gem-border rounded-lg px-3.5 py-2.5 text-gem-ink focus:border-gem-pink focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-address"
                  className="font-bold text-gem-ink block mb-1"
                >
                  Delivery Address *
                </label>
                <input
                  id="checkout-address"
                  autoComplete="street-address"
                  type="text"
                  required
                  placeholder="Enter the location where you want your order delivered"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-gem-border rounded-lg px-3.5 py-2.5 text-gem-ink focus:border-gem-pink focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-sm border border-gem-border bg-white p-4">
              <div>
                <p className="font-bold text-gem-ink mb-1">Date Ordered</p>
                <p className="text-gem-ink">
                  {new Date().toLocaleDateString("en-KE", {
                    dateStyle: "full",
                  })}
                </p>
                <p className="text-gem-muted mt-1">
                  Set automatically when you place the order.
                </p>
              </div>
              <div>
                <label
                  htmlFor="checkout-date"
                  className="font-bold text-gem-ink block mb-1"
                >
                  Requested Delivery Date{" "}
                  <span className="text-gem-muted">(Optional)</span>
                </label>
                <input
                  id="checkout-date"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  value={requestedDeliveryDate}
                  onChange={(e) => setRequestedDeliveryDate(e.target.value)}
                  className="w-full bg-white border border-gem-border rounded-lg px-3.5 py-2.5 text-gem-ink focus:border-gem-pink focus:outline-none"
                />
                <p className="text-gem-muted mt-1">
                  Leave blank for the earliest available delivery.
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="checkout-notes"
                className="font-bold text-gem-ink block mb-1"
              >
                Special Delivery Instructions (Optional)
              </label>
              <textarea
                id="checkout-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Gate color, landmark, or specific delivery instructions..."
                className="w-full bg-white border border-gem-border rounded-lg px-3.5 py-2 text-gem-ink focus:border-gem-pink focus:outline-none"
              />
            </div>

            {/* MANDATORY DELIVERY NOTICE */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <strong>Delivery arrangement:</strong> Delivery is arranged and
              paid directly between you and the delivery person. It is not
              included in the product order total. Orders originate from our
              Roysambu, Nairobi hub.
            </div>
            <div className="pt-4 border-t border-gem-border flex items-center justify-between">
              <span className="text-sm font-extrabold text-gem-ink">
                Total:{" "}
                <span className="text-gem-pink">
                  KSh {grandTotal.toLocaleString()}
                </span>
              </span>

              <button
                type="submit"
                className="px-6 py-3.5 bg-gem-pink hover:bg-gem-magenta text-white font-extrabold text-xs   rounded-sm  transition-all flex items-center space-x-2"
              >
                <span>PROCEED TO PAYMENT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PAYMENT SELECTION */}
        {step === "payment" && (
          <div className="space-y-6 text-xs text-gem-ink">
            {/* Payment Method Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* M-PESA Option */}
              <div
                className={`p-4 rounded-sm border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === "MPESA"
                    ? "bg-emerald-50 border-emerald-500 shadow-lg"
                    : "bg-white border-gem-border opacity-70 hover:opacity-100"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 bg-emerald-600 text-white font-extrabold rounded text-[11px]">
                    Safaricom M-PESA
                  </span>
                  <Smartphone className="w-5 h-5 text-emerald-700" />
                </div>
                <p className="text-[11px] text-gem-ink font-light mb-3">
                  Pay via M-PESA Buy Goods. Keep your checkout reference and
                  contact the shop to link your confirmed payment.
                </p>
                <span className="text-xs font-bold text-emerald-700">
                  Recommended for Kenya
                </span>
              </div>

              {/* Card Option — disabled until card gateway is integrated */}
              <div
                className="p-4 rounded-sm border-2 border-gem-border bg-white opacity-40 cursor-not-allowed flex flex-col justify-between"
                title="Card payments are not yet available"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 bg-slate-800 text-gem-muted font-extrabold rounded text-[11px]">
                    Credit / Debit Card
                  </span>
                  <CreditCard className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-[11px] text-gem-muted font-light mb-3">
                  Card payments are coming soon. Please use M-PESA for now.
                </p>
                <span className="text-xs font-bold text-gem-muted">
                  Coming soon
                </span>
              </div>
            </div>

            {/* M-PESA Till Payment Instructions */}
            {paymentMethod === "MPESA" && (
              <div className="p-4 rounded-sm bg-white border border-emerald-800/60 space-y-3">
                <p className="font-bold text-emerald-700 text-sm">
                  How to pay via M-PESA
                </p>

                <p className="text-[11px] text-gem-muted border-t border-gem-border pt-2">
                  Create your checkout first to receive the Till number and
                  reference. The shop will verify your payment and this page
                  will show your confirmed order.
                </p>
              </div>
            )}

            {/* CTAs */}
            <div className="pt-4 border-t border-gem-border flex items-center justify-between">
              <button
                onClick={() => setStep("info")}
                className="text-gem-muted hover:text-gem-ink font-bold"
              >
                Back to Address
              </button>

              <button
                onClick={() => void handleStartPayment()}
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-extrabold text-xs   rounded-sm shadow-lg transition-all flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                <span>
                  {isSubmitting
                    ? "PREPARING CHECKOUT…"
                    : `CONFIRM & PAY • KSh ${grandTotal.toLocaleString()}`}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: AWAITING PAYMENT */}
        {step === "awaiting" && session && (
          <div className="space-y-6 text-xs text-gem-ink text-center">
            <div className="flex flex-col items-center space-y-4 py-4">
              <Clock className="w-12 h-12 text-emerald-700 animate-pulse" />
              <h3 className="font-serif text-xl font-bold text-gem-ink">
                {paymentStatus === "EXPIRED" || paymentStatus === "FAILED"
                  ? "Payment needs shop assistance"
                  : "Waiting for payment confirmation"}
              </h3>
              <p className="text-gem-muted max-w-sm">
                {paymentStatus === "EXPIRED" || paymentStatus === "FAILED"
                  ? "If you have paid, do not pay again. Contact the shop with your checkout reference and M-PESA receipt so they can verify the payment or arrange a refund."
                  : "After paying, share your checkout reference with the shop. This page updates when your payment has been verified and linked."}
              </p>
            </div>

            <div className="p-5 rounded-sm bg-emerald-50 border border-emerald-700/60 space-y-3 text-left">
              <p className="font-bold text-emerald-700 text-sm">
                Payment Instructions
              </p>
              <ol className="text-[12px] text-gem-ink space-y-1.5 list-decimal list-inside">
                <li>
                  Open <strong className="text-gem-ink">M-PESA</strong> → Lipa
                  na M-PESA → Buy Goods
                </li>
                <li>
                  Till Number:{" "}
                  <strong className="text-gem-ink font-mono text-base">
                    {session.tillNumber ?? "(see cashier)"}
                  </strong>
                </li>
                <li>
                  Amount:{" "}
                  <strong className="text-emerald-700 font-mono text-base">
                    KSh {session.total.toLocaleString()}
                  </strong>
                </li>
                <li>
                  Keep this checkout reference for the shop:{" "}
                  <strong className="text-gem-ink font-mono">
                    {session.sessionRef}
                  </strong>
                  . Buy Goods does not ask you to enter it.
                </li>
                <li>Enter your PIN and confirm</li>
              </ol>
            </div>

            <div className="p-3 rounded-sm bg-white border border-gem-border text-[11px] text-gem-muted flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-700 shrink-0" />
              <span>
                {pollError ||
                  "Checking payment status. Keep your checkout reference; do not pay twice."}
              </span>
            </div>

            <p className="text-[11px] text-gem-muted">
              Leaving this checkout does not cancel or refund a payment. If you
              have paid, contact the shop before starting again.
            </p>
            <button
              onClick={() => {
                savePendingCheckout(null);
                setStep("payment");
                setSession(null);
              }}
              className="text-gem-muted hover:text-gem-ink text-xs font-bold"
            >
              Leave this checkout and go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
