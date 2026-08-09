import React from 'react';
import { Zap, CheckCircle2, UserCheck, ShoppingBag, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface CommanderIn3ClicksProps {
  onOrderClick: () => void;
}

export const CommanderIn3Clicks: React.FC<CommanderIn3ClicksProps> = ({ onOrderClick }) => {
  const { t } = useLanguage();

  return (
    <section className="py-12 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-3.5 h-3.5 fill-amber-300" />
            <span>{t('order_in_3_clicks')}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Commander en toute simplicité sans compte
          </h2>
          <p className="text-sm sm:text-base text-blue-100 font-medium">
            3 étapes rapides sur votre téléphone — Livraison à domicile ou retrait au magasin
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Step 1 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 hover:bg-white/15 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg">
              01
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              {t('step1_title')}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {t('step1_desc')}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 hover:bg-white/15 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg">
              02
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-300" />
              {t('step2_title')}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {t('step2_desc')}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/15 hover:bg-white/15 transition-all space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 font-black text-lg flex items-center justify-center shadow-lg">
              03
            </div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
              {t('step3_title')}
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
              {t('step3_desc')}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button
            onClick={onOrderClick}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm sm:text-base tracking-wide shadow-xl shadow-amber-500/30 transition-all hover:scale-105"
          >
            <Zap className="w-5 h-5 fill-slate-950" />
            <span>{t('order_in_3_clicks')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
