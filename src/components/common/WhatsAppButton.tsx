import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { API_BASE } from '../../api/client';

export const WhatsAppButton: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('254718796296');

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then(res => res.json())
      .then(data => {
        if (data?.whatsappNumber) {
          setWhatsappNumber(data.whatsappNumber.replace(/[^0-9]/g, ''));
        }
      })
      .catch(() => {/* fallback to default */});
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello Gem & Crystal Fashion Hub! I would like to inquire about your fashion products.')}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 max-sm:hidden bg-[#1c1713] hover:bg-gem-pink text-white p-3.5 rounded-full shadow-2xl shadow-[#1c1713]/30 flex items-center gap-2 font-bold text-xs uppercase tracking-wider transition-all transform hover:scale-105 active:scale-95 group border border-[#d9cbb9]/50"
      title="Chat with Gem & Crystal on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 fill-current shrink-0" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap text-[11px]">
        Chat on WhatsApp
      </span>
    </a>
  );
};
