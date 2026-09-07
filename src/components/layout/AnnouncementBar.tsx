import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const { currency } = useStore();

  return (
    <div className="bg-[#09090b] text-xs font-medium text-slate-300 border-b border-gem-border/60 py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Left spacer on desktop */}
        <div className="hidden md:block w-40" />

        {/* Center message */}
        <div className="flex-1 text-center text-slate-200 font-semibold tracking-wide text-[11px] sm:text-xs">
          FAST NATIONWIDE DELIVERY ACROSS KENYA &nbsp;•&nbsp; SECURE ORDER SUPPORT
        </div>

        {/* Currency indicator */}
        <div className="flex items-center space-x-1 cursor-pointer hover:text-gem-pink transition-colors">
          <span className="font-semibold text-white">{currency}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </div>

      </div>
    </div>
  );
};
