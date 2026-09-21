import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Gem, Headphones } from 'lucide-react';

export const BenefitsStrip: React.FC = () => {
  const benefits = [
    {
      icon: ShieldCheck,
      title: 'M-PESA Payments',
      subtitle: 'Payment verified before fulfillment',
    },
    {
      icon: Truck,
      title: 'Delivery Arrangements',
      subtitle: 'Agree availability and cost with the shop',
    },
    {
      icon: RotateCcw,
      title: 'Order Support',
      subtitle: 'Contact us about returns or exchanges',
    },
    {
      icon: Gem,
      title: 'Premium Quality',
      subtitle: 'Handpicked Just for You',
    },
    {
      icon: Headphones,
      title: 'Contact the Boutique',
      subtitle: 'Send your questions on WhatsApp',
    },
  ];

  return (
    <section className="bg-[#121215] border-b border-gem-border/60 py-6 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 min-[380px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 text-slate-200">
        {benefits.map((b, idx) => {
          const Icon = b.icon;
          return (
            <div key={idx} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gem-card transition-colors group">
              <div className="w-10 h-10 rounded-full bg-gem-pink/15 border border-gem-pink/40 flex items-center justify-center text-gem-pink shrink-0 group-hover:scale-110 transition-transform">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">{b.title}</h4>
                <p className="text-[10px] text-slate-400 font-medium">{b.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
