import React, { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { API_BASE } from "../../api/client";

export const WhatsAppButton: React.FC = () => {
  const [whatsappNumber, setWhatsappNumber] = useState("254718796296");

  useEffect(() => {
    fetch(`${API_BASE}/settings`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.whatsappNumber) {
          setWhatsappNumber(data.whatsappNumber.replace(/[^0-9]/g, ""));
        }
      })
      .catch(() => {
        /* fallback to default */
      });
  }, []);

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello Gem & Crystal Fashion Hub! I would like to inquire about your fashion products.")}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-support-whatsapp"
      aria-label="Chat with the boutique on WhatsApp"
      title="Chat with Gem & Crystal on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 fill-current shrink-0" />
    </a>
  );
};
