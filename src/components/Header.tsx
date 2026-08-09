import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, ShieldCheck, Globe, Phone, User, Check, Tag, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { StoreSettings } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../lib/initialData';

interface HeaderProps {
  settings?: StoreSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings = DEFAULT_STORE_SETTINGS,
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { totalItemsCount, setIsCartOpen } = useCart();
  const { isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const phone1 = settings?.phone1 || DEFAULT_STORE_SETTINGS.phone1;
  const phone2 = settings?.phone2 || DEFAULT_STORE_SETTINGS.phone2;
  const address = settings?.address || DEFAULT_STORE_SETTINGS.address;

  const handleNavClick = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-200">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
            <span className="font-medium text-center sm:text-left">{t('store_tagline')}</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <a
              href={`tel:${phone1.replace(/\s+/g, '')}`}
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>{phone1}</span>
            </a>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline text-blue-300 font-medium">shoes-original.tn</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left: Mobile Menu Trigger + Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo */}
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-left group"
            >
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-slate-200 bg-white shadow-xs group-hover:scale-105 transition-transform shrink-0 flex items-center justify-center p-0.5">
                <img
                  src={settings?.logoUrl || '/logo.jpg'}
                  alt={settings?.storeName || 'AMINO-SHOES'}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 block leading-tight">
                  AMINO<span className="text-blue-600">-SHOES</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 block">
                  100% Original • Tunisia
                </span>
              </div>
            </button>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold">
            <button
              onClick={() => handleNavClick('home')}
              className={`transition-colors hover:text-blue-600 ${
                activeTab === 'home' ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-1' : 'text-slate-700'
              }`}
            >
              {t('home')}
            </button>
            <button
              onClick={() => handleNavClick('catalog')}
              className={`transition-colors hover:text-blue-600 ${
                activeTab === 'catalog' ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-1' : 'text-slate-700'
              }`}
            >
              {t('catalog')}
            </button>
            <button
              onClick={() => handleNavClick('nouveautes')}
              className={`transition-colors hover:text-blue-600 flex items-center gap-1 ${
                activeTab === 'nouveautes' ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-1' : 'text-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              {t('new_arrivals')}
            </button>
            <button
              onClick={() => handleNavClick('promotions')}
              className={`transition-colors hover:text-blue-600 flex items-center gap-1 ${
                activeTab === 'promotions' ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-1' : 'text-slate-700'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-rose-500" />
              {t('promotions')}
            </button>
            <button
              onClick={() => handleNavClick('marques')}
              className={`transition-colors hover:text-blue-600 ${
                activeTab === 'marques' ? 'text-blue-600 font-bold border-b-2 border-blue-600 pb-1' : 'text-slate-700'
              }`}
            >
              {t('brands')}
            </button>
          </nav>

          {/* Right Controls: Search, Lang, Cart, Admin */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Input Bar (Desktop or Expandable) */}
            <div className="relative hidden md:block w-48 lg:w-64">
              <input
                type="text"
                placeholder={t('search_placeholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'catalog') setActiveTab('catalog');
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-full py-2 pl-9 pr-4 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all ${
                  language === 'fr' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Français"
              >
                🇫🇷 <span className="hidden sm:inline">FR</span>
              </button>
              <button
                onClick={() => setLanguage('derja')}
                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-all ${
                  language === 'derja' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Derja Tunisienne"
              >
                🇹🇳 <span className="hidden sm:inline">Derja</span>
              </button>
            </div>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors focus:outline-hidden"
              aria-label="Voir le panier"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Admin Quick Button */}
            <button
              onClick={() => handleNavClick('admin')}
              className="p-2.5 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors focus:outline-hidden"
              title="Espace Administration"
              aria-label="Espace Administration"
            >
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Always visible on mobile) */}
        <div className="md:hidden pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'catalog') setActiveTab('catalog');
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-full py-2.5 pl-10 pr-4 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <button
            onClick={() => handleNavClick('home')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'home' ? 'bg-blue-50 text-blue-600' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            {t('home')}
          </button>
          <button
            onClick={() => handleNavClick('catalog')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'catalog' ? 'bg-blue-50 text-blue-600' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            {t('catalog')}
          </button>
          <button
            onClick={() => handleNavClick('nouveautes')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'nouveautes' ? 'bg-blue-50 text-blue-600' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            {t('new_arrivals')}
          </button>
          <button
            onClick={() => handleNavClick('promotions')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
              activeTab === 'promotions' ? 'bg-blue-50 text-blue-600' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            <Tag className="w-4 h-4 text-rose-500" />
            {t('promotions')}
          </button>
          <button
            onClick={() => handleNavClick('marques')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'marques' ? 'bg-blue-50 text-blue-600' : 'text-slate-800 hover:bg-slate-50'
            }`}
          >
            {t('brands')}
          </button>
          <button
            onClick={() => handleNavClick('admin')}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 text-slate-800 hover:bg-slate-50"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>{t('admin_login')}</span>
          </button>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-1.5 px-3">
            <p className="font-semibold text-slate-900">Besoin d'aide ?</p>
            <p>WhatsApp: {phone1} / {phone2}</p>
            <p>Magasin: {address}</p>
          </div>
        </div>
      )}
    </header>
  );
};
