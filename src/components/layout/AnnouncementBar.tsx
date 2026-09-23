import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const { currency } = useStore();

  return (
    <div className="bg-[#1c1713] text-xs font-medium text-[#f5f0e8] py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Left spacer on desktop */}
        <div className="hidden md:block w-40" />

        {/* Center message */}
        <div className="flex-1 text-center text-[#f5f0e8] font-semibold tracking-[.12em] text-[10px] sm:text-xs">
          FAST NATIONWIDE DELIVERY ACROSS KENYA &nbsp;•&nbsp; SECURE ORDER SUPPORT
        </div>

        {/* Currency indicator */}
        <div className="flex items-center space-x-1 cursor-pointer hover:text-[#f4c99e] transition-colors">
          <span className="font-semibold text-[#fffaf2]">{currency}</span>
          <ChevronDown className="w-3 h-3 text-[#d9cbb9]" />
        </div>

      </div>
    </div>
  );
};
