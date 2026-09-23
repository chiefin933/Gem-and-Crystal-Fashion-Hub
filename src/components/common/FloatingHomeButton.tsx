import React from 'react';
import { Home } from 'lucide-react';

interface FloatingHomeButtonProps {
  currentTab: string;
  onGoHome: () => void;
}

export const FloatingHomeButton: React.FC<FloatingHomeButtonProps> = ({
  currentTab,
  onGoHome,
}) => {
  if (currentTab === 'home') return null;

  return (
    <button
      onClick={() => {
        onGoHome();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      aria-label="Return to home"
      title="Return to Home"
      // Stacked above the WhatsApp button on the RIGHT side.
      // bottom-20 = clears the WhatsApp pill (bottom-6 + ~3rem height).
      // z-50 ensures it sits above every other floating element.
      className="fixed bottom-20 right-6 z-50 max-sm:hidden bg-gem-pink hover:bg-gem-deepPink text-white p-3.5 rounded-full shadow-2xl shadow-gem-pink/40 flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 group border border-pink-300/50 animate-fade-in"
    >
      <Home className="w-5 h-5 shrink-0" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-[11px]">
        Back to Home
      </span>
    </button>
  );
};
