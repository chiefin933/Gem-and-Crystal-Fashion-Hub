import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/useStore';

export const Newsletter: React.FC = () => {
  const { showToast } = useStore();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      showToast('Thank you for joining the VIP Gem & Crystal list!', 'success');
      setEmail('');
    }
  };

  return (
    <section className="py-20 bg-[#09090b] relative overflow-hidden border-t border-gem-border/50">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gem-pink/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <div className="crystal-card p-8 sm:p-12 rounded-3xl border border-gem-pink/30 shadow-2xl space-y-6">
          <div className="w-12 h-12 rounded-full bg-gem-pink/20 text-gem-pink flex items-center justify-center mx-auto border border-gem-pink/40 shadow-pink-glow">
            <Mail className="w-6 h-6" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-gem-pink">
              JOIN THE VIP INSIDERS CLUB
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Dress to Elevate Your Mood.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
              Subscribe to get exclusive early access to drop collections, flash shoe sales, and secret luxury discounts directly to your inbox.
            </p>
          </div>

          {subscribed ? (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center justify-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>You're subscribed! Check your inbox for exclusive updates.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <div className="relative w-full">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121215] border border-gem-border rounded-xl py-3.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-gem-pink transition-colors"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3.5 bg-gem-pink hover:bg-gem-magenta text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-pink-glow transition-all shrink-0"
              >
                SUBSCRIBE
              </button>
            </form>
          )}

          <p className="text-[10px] text-slate-500">
            We respect your privacy. Unsubscribe at any time with one click.
          </p>
        </div>
      </div>
    </section>
  );
};
