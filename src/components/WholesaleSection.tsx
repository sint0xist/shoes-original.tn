import React from 'react';
import { MessageSquare, Store, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { StoreSettings } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../lib/initialData';

interface WholesaleSectionProps {
  settings?: StoreSettings;
}

export const WholesaleSection: React.FC<WholesaleSectionProps> = ({ settings = DEFAULT_STORE_SETTINGS }) => {
  const { t } = useLanguage();

  const getWholesaleWhatsAppUrl = () => {
    const phone = settings?.phone1 || DEFAULT_STORE_SETTINGS.phone1;
    const rawPhone = phone.replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('216') ? rawPhone : `216${rawPhone}`;
    const msg = 'Bonjour Amino-Shoes, je suis intéressé par vos commandes en gros.';
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section className="py-12 bg-slate-900 text-white relative overflow-hidden border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-r from-blue-900/80 to-slate-800 rounded-3xl p-8 sm:p-12 border border-slate-700/80 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>Espace Revendeurs & Gros</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              {t('wholesale_title')}
            </h2>

            <p className="text-sm sm:text-base text-slate-300 font-medium max-w-xl">
              {t('wholesale_desc')} Tarifs préférentiels pour les boutiques et revendeurs partout en Tunisie.
            </p>
          </div>

          <div className="shrink-0">
            <a
              href={getWholesaleWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-emerald-600/30 transition-all hover:scale-105"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              <span>{t('contact_whatsapp')}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
