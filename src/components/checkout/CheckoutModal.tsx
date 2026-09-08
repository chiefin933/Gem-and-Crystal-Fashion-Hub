import React, { useState } from 'react';
import { X, ShieldCheck, Smartphone, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { useStore } from '../../context/useStore';
import { dataService } from '../../utils/dataService';
import { Order } from '../../types/ecommerce';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { cart, cartSubtotal, clearCart, showToast, appliedCoupon } = useStore();

  const [step, setStep] = useState<'info' | 'payment'>('info');

  // Guest Customer Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [county, setCounty] = useState('Nairobi');
  const [townCity, setTownCity] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Payment Selection State — CARD is disabled until a payment gateway is integrated
  const [paymentMethod, setPaymentMethod] = useState<'MPESA'>('MPESA');
  const [mpesaPhone, setMpesaPhone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const deliveryFee = cartSubtotal >= 10000 ? 0 : 350;
  const appliedDiscount = appliedCoupon?.discount || 0;
  const grandTotal = Math.max(0, cartSubtotal - appliedDiscount + deliveryFee);

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !townCity || !address) {
      showToast('Please fill in all required shipping fields.', 'error');
      return;
    }
    setStep('payment');
  };

  const handleStartPayment = async () => {
    setIsSubmitting(true);
    const result = await dataService.createOrderAsync({
      customer: {
        fullName,
        email,
        phone,
        county,
        townCity,
        address,
        notes,
      },
      items: cart,
      paymentMethod,
      couponCode: appliedCoupon?.code,
      mpesaPhone: paymentMethod === 'MPESA' ? mpesaPhone : undefined,
    });
    setIsSubmitting(false);

    if (!result.success || !result.order) {
      showToast(result.error || 'Failed to place order. Stock may have changed.', 'error');
      return;
    }

    clearCart();
    onOrderSuccess(result.order);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />

      {/* Modal Box */}
      <div className="relative w-full max-w-2xl bg-[#09090b] border border-gem-pink/40 rounded-2xl overflow-hidden shadow-2xl z-10 p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-[#121215]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pb-4 border-b border-gem-border">
          <div className="flex items-center space-x-2 text-gem-pink mb-1">
            <ShieldCheck className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Guest Checkout • Safe Encrypted</span>
          </div>
          <h2 className="font-serif text-2xl font-bold text-white">
            {step === 'info' ? '1. Shipping & Delivery Address' : '2. Confirm Your Order'}
          </h2>
        </div>

        {/* STEP 1: INFO FORM */}
        {step === 'info' && (
          <form onSubmit={handleInfoSubmit} className="space-y-4 text-xs text-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2.5 text-white focus:border-gem-pink focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2.5 text-white focus:border-gem-pink focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Phone Number (For Delivery & M-PESA) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setMpesaPhone(e.target.value);
                  }}
                  className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2.5 text-white focus:border-gem-pink focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">County (Kenya) *</label>
                <select
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2.5 text-white focus:border-gem-pink focus:outline-none cursor-pointer"
                >
                  <option value="Nairobi">Nairobi County</option>
                  <option value="Mombasa">Mombasa County</option>
                  <option value="Kisumu">Kisumu County</option>
                  <option value="Nakuru">Nakuru County</option>
                  <option value="Uasin Gishu">Eldoret / Uasin Gishu</option>
                  <option value="Kiambu">Kiambu County</option>
                  <option value="Kajiado">Kajiado / Kitengela</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-300 block mb-1">Town / Area (e.g. Roysambu, Kilimani, Westlands) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Roysambu, TRM Drive"
                  value={townCity}
                  onChange={(e) => setTownCity(e.target.value)}
                  className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2.5 text-white focus:border-gem-pink focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">Delivery Address (Location / Estate / Apartment) *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter the location where you want your order delivered"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2.5 text-white focus:border-gem-pink focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-300 block mb-1">Special Delivery Instructions (Optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Gate color, landmark, or specific delivery instructions..."
                className="w-full bg-[#121215] border border-gem-border rounded-lg px-3.5 py-2 text-white focus:border-gem-pink focus:outline-none"
              />
            </div>

            {/* MANDATORY DELIVERY NOTICE */}
            <div className="p-3.5 bg-amber-950/40 border border-amber-800/60 rounded-xl text-[11px] text-amber-200 leading-relaxed font-medium">
              <strong>Delivery Fee Notice:</strong> Delivery is calculated in the total shown here. Free delivery applies to orders from KSh 10,000. Orders originate from our Roysambu, Nairobi hub.
            </div>

            <div className="pt-4 border-t border-gem-border flex items-center justify-between">
              <span className="text-sm font-extrabold text-white">
                Total: <span className="text-gem-pink">KSh {grandTotal.toLocaleString()}</span>
              </span>

              <button
                type="submit"
                className="px-6 py-3.5 bg-gem-pink hover:bg-gem-magenta text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-pink-glow transition-all flex items-center space-x-2"
              >
                <span>PROCEED TO PAYMENT</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: PAYMENT SELECTION */}
        {step === 'payment' && (
          <div className="space-y-6 text-xs text-slate-200">
            
            {/* Payment Method Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* M-PESA Option */}
              <div
                onClick={() => setPaymentMethod('MPESA')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  paymentMethod === 'MPESA'
                    ? 'bg-emerald-950/30 border-emerald-500 shadow-lg'
                    : 'bg-[#121215] border-gem-border opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 bg-emerald-600 text-white font-extrabold rounded text-[11px]">
                    Safaricom M-PESA
                  </span>
                  <Smartphone className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-300 font-light mb-3">
                  Enter your registered number. Once M-PESA is connected, we will send a secure payment prompt and confirm it automatically.
                </p>
                <span className="text-xs font-bold text-emerald-400">Recommended for Kenya</span>
              </div>

              {/* Card Option — disabled until card gateway is integrated */}
              <div
                className="p-4 rounded-xl border-2 border-gem-border bg-[#121215] opacity-40 cursor-not-allowed flex flex-col justify-between"
                title="Card payments are not yet available"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-400 font-extrabold rounded text-[11px]">
                    Credit / Debit Card
                  </span>
                  <CreditCard className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-[11px] text-slate-500 font-light mb-3">
                  Card payments are coming soon. Please use M-PESA for now.
                </p>
                <span className="text-xs font-bold text-slate-500">Coming soon</span>
              </div>

            </div>

            {/* M-PESA Specific Input */}
            {paymentMethod === 'MPESA' && (
              <div className="p-4 rounded-xl bg-[#121215] border border-gem-border space-y-3">
                <label className="font-bold text-white block">M-PESA Registered Phone Number</label>
                <input
                  type="tel"
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                  placeholder="e.g. 0712345678"
                  className="w-full bg-[#09090b] border border-gem-border rounded-lg px-4 py-2.5 text-white font-mono font-bold text-sm focus:border-emerald-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400">
                  We will use this number for the secure M-PESA prompt for <strong className="text-emerald-400">KSh {grandTotal.toLocaleString()}</strong>. Payment is confirmed only after M-PESA responds to our backend.
                </p>
              </div>
            )}

            {/* CTAs */}
            <div className="pt-4 border-t border-gem-border flex items-center justify-between">
              <button
                onClick={() => setStep('info')}
                className="text-slate-400 hover:text-white font-bold"
              >
                Back to Address
              </button>

              <button
                onClick={() => void handleStartPayment()}
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center space-x-2"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{isSubmitting ? 'PLACING ORDER…' : `PLACE ORDER • KSh ${grandTotal.toLocaleString()}`}</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
