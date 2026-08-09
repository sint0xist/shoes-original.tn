import React from 'react';
import { Phone, Mail, MapPin, ExternalLink, ShieldCheck, Heart } from 'lucide-react';
import { StoreSettings } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../lib/initialData';
import { useLanguage } from '../context/LanguageContext';

interface FooterProps {
  settings?: StoreSettings;
  onNavigate: (tab: string) => void;
  onOpenLegal: (type: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings = DEFAULT_STORE_SETTINGS,
  onNavigate,
  onOpenLegal
}) => {
  const { t } = useLanguage();
  const phone1 = settings?.phone1 || DEFAULT_STORE_SETTINGS.phone1;
  const phone2 = settings?.phone2 || DEFAULT_STORE_SETTINGS.phone2;
  const email = settings?.email || DEFAULT_STORE_SETTINGS.email;
  const address = settings?.address || DEFAULT_STORE_SETTINGS.address;

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-700 bg-white p-0.5 shrink-0 flex items-center justify-center">
                <img
                  src={settings?.logoUrl || '/logo.jpg'}
                  alt={settings?.storeName || 'AMINO-SHOES'}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                AMINO<span className="text-blue-500">-SHOES</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              {settings.slogan || t('store_tagline')}
            </p>

            <div className="pt-2 flex items-center gap-3">
              {/* TikTok */}
              {settings.tiktokUrl && (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="TikTok"
                >
                  <span className="text-xs font-black">TT</span>
                </a>
              )}
              {/* Instagram */}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Instagram"
                >
                  <span className="text-xs font-black">IG</span>
                </a>
              )}
              {/* Facebook */}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Facebook"
                >
                  <span className="text-xs font-black">FB</span>
                </a>
              )}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-blue-400 transition-colors">
                  {t('home')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('catalog')} className="hover:text-blue-400 transition-colors">
                  {t('catalog')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('nouveautes')} className="hover:text-blue-400 transition-colors">
                  {t('new_arrivals')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('promotions')} className="hover:text-blue-400 transition-colors">
                  {t('promotions')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('marques')} className="hover:text-blue-400 transition-colors">
                  {t('brands')}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('admin')} className="hover:text-blue-400 transition-colors text-slate-400 hover:text-white pt-1 flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t('admin_login')}</span>
                </button>
              </li>

            </ul>
          </div>

          {/* Information Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Informations
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <button onClick={() => onOpenLegal('delivery')} className="hover:text-blue-400 transition-colors">
                  Livraison & Retrait
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('cgv')} className="hover:text-blue-400 transition-colors">
                  Conditions Générales
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('privacy')} className="hover:text-blue-400 transition-colors">
                  Politique de Confidentialité
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('returns')} className="hover:text-blue-400 transition-colors">
                  Politique de Retour / Échange
                </button>
              </li>
              <li>
                <button onClick={() => onOpenLegal('contact')} className="hover:text-blue-400 transition-colors">
                  Contact & Support
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-3">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
              Boutique & Contact
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{phone1}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{phone2}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{email}</span>
              </p>
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </p>

              <div className="pt-2">
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs font-bold hover:bg-blue-600 hover:text-white transition-all"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Voir notre magasin sur Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Amino-Shoes — shoes-original.tn. Tous droits réservés.</p>
          <div className="flex items-center gap-1">
            <span>Le meilleur rapport qualité-prix en Tunisie — 100% Original</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
