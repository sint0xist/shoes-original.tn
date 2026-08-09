import React from 'react';
import { MessageSquare } from 'lucide-react';
import { StoreSettings } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../lib/initialData';

interface FloatingWhatsappProps {
  settings?: StoreSettings;
}

export const FloatingWhatsapp: React.FC<FloatingWhatsappProps> = ({ settings = DEFAULT_STORE_SETTINGS }) => {
  const getWhatsAppUrl = () => {
    const phone = settings?.phone1 || DEFAULT_STORE_SETTINGS.phone1;
    const rawPhone = phone.replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('216') ? rawPhone : `216${rawPhone}`;
    const msg = 'Bonjour Amino-Shoes, j\'ai une question concernant un produit.';
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <a
      href={getWhatsAppUrl()}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white shadow-2xl shadow-emerald-600/50 flex items-center justify-center transition-transform hover:scale-110 group focus:outline-hidden"
      aria-label="Contactez-nous sur WhatsApp"
    >
      <MessageSquare className="w-6 h-6 fill-white" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap text-xs font-black tracking-wide group-hover:ml-2">
        WhatsApp Chat
      </span>
    </a>
  );
};
