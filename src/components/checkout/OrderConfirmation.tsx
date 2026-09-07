import React from 'react';
import { CheckCircle2, ArrowRight, MapPin } from 'lucide-react';
import { Order } from '../../types/ecommerce';

interface OrderConfirmationProps {
  order: Order;
  onContinueShopping: () => void;
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  order,
  onContinueShopping,
}) => {
  return (
    <div className="py-16 bg-[#09090b]">
      <div className="max-w-3xl mx-auto px-4">
        
        {/* Receipt Container */}
        <div className="crystal-card p-8 rounded-2xl border border-gem-pink/40 shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-8 pb-6 border-b border-gem-border">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-bold uppercase tracking-widest text-gem-pink block mb-1">
              Order Received
            </span>
            <h1 className="font-serif text-3xl font-bold text-white">
              THANK YOU — WE’LL CONFIRM PAYMENT
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Order Reference: <strong className="text-white font-mono">{order.orderNumber}</strong>
            </p>
          </div>

          {/* Key Info Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#121215] border border-gem-border text-xs mb-8">
            <div>
              <span className="text-slate-400 block mb-0.5">Payment Method</span>
              <strong className="text-emerald-400 font-bold">
                {order.paymentMethod === 'MPESA' ? 'Safaricom M-PESA' : 'Credit Card'}
              </strong>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Payment confirmation</span>
              <strong className="text-white font-mono">{order.mpesaReceipt || 'Pending'}</strong>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Status</span>
              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 font-bold border border-blue-800/40">
                {order.fulfillmentStatus}
              </span>
            </div>
          </div>

          {/* Items Summary */}
          <div className="mb-8">
            <h3 className="font-serif text-lg font-bold text-white mb-4">
              Purchased Items
            </h3>
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#141419] border border-gem-border/50 text-xs">
                  <div className="flex items-center space-x-3">
                    <img src={item.image} alt={item.title} className="w-12 h-14 rounded object-cover" />
                    <div>
                      <h4 className="font-bold text-white">{item.title}</h4>
                      <span className="text-slate-400">
                        Size: <strong className="text-gem-pink">{item.size}</strong> | Color: {item.color} | Qty: {item.quantity}
                      </span>
                    </div>
                  </div>
                  <span className="font-extrabold text-white">
                    KSh {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Breakdown */}
          <div className="p-4 rounded-xl bg-[#121215] border border-gem-border/80 text-xs space-y-2 mb-8">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal</span>
              <span className="text-white">KSh {order.subtotal.toLocaleString()}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-gem-pink">
                <span>Discount Applied</span>
                <span>-KSh {order.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-400">
              <span>Kenya Delivery</span>
              <span>KSh {order.deliveryFee}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-gem-border">
              <span>Total Paid</span>
              <span className="text-gem-pink">KSh {order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-8 text-xs text-slate-300">
            <h4 className="font-bold text-white uppercase mb-2 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-gem-pink" />
              <span>Delivery Destination</span>
            </h4>
            <p className="font-semibold text-white">{order.customer.fullName}</p>
            <p>{order.customer.address}, {order.customer.townCity}, {order.customer.county}</p>
            <p className="text-slate-400 font-mono mt-1">Phone: {order.customer.phone}</p>
          </div>

          {/* Action CTAs */}
          <div className="flex justify-center pt-4 border-t border-gem-border">
            <button
              onClick={onContinueShopping}
              className="px-8 py-3.5 bg-gem-pink hover:bg-gem-magenta text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-pink-glow transition-all flex items-center space-x-2"
            >
              <span>CONTINUE SHOPPING</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
