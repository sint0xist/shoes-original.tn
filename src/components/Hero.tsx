import React from 'react';
import { ShoppingBag, Zap, ShieldCheck, Truck, Store, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { StoreSettings } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../lib/initialData';

interface HeroProps {
  settings?: StoreSettings;
  onExploreCatalog?: () => void;
  onQuickOrderClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings = DEFAULT_STORE_SETTINGS,
  onExploreCatalog,
  onQuickOrderClick
}) => {
  const { t } = useLanguage();

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden py-12 lg:py-20">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-bold tracking-wide uppercase">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>100% Original • shoes-original.tn</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
              {settings.heroTitle || t('hero_title')}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {settings.heroSubtitle || t('hero_subtitle')}
            </p>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={onExploreCatalog}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-blue-600/30 hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2 group"
              >
                <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>{t('discover_catalog')}</span>
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onQuickOrderClick}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5 fill-slate-950" />
                <span>{t('order_in_3_clicks')}</span>
              </button>
            </div>

            {/* Value Props Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-700/60 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-200">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-blue-400" />
                </div>
                <span>Livraison 8 DT ({settings.deliveryCompany || 'Leader Ecom'})</span>
              </div>

              <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-200">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-emerald-400" />
                </div>
                <span>Retrait Magasin Gratuit</span>
              </div>

              <div className="col-span-2 sm:col-span-1 flex items-center gap-2.5 text-xs font-semibold text-slate-200">
                <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>
                <span>Paiement à la livraison</span>
              </div>
            </div>
          </div>

          {/* Right Hero Image Frame */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-amber-500 rounded-3xl blur-2xl opacity-30 transform -rotate-3" />
              
              <div className="relative rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-800 group">
                <img
                  src={settings.heroImage || 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=1200'}
                  alt="Amino-Shoes Collection"
                  className="w-full h-80 sm:h-96 lg:h-[420px] object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                  <div>
                    <span className="text-xs font-bold text-blue-400 tracking-wider uppercase block">Collection 2026</span>
                    <span className="text-lg font-black tracking-tight">Qualité. Originalité. Prix juste.</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-xs font-extrabold text-amber-300">
                    100% Original
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
