import React from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    setIsCheckoutOpen,
    appliedPromoCode,
    discountAmount
  } = useCart();
  const { t } = useLanguage();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-black text-slate-900">{t('cart')}</h2>
            <span className="text-xs bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-slate-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Votre panier est vide</h3>
              <p className="text-xs text-slate-500 max-w-xs">
                Découvrez nos modèles 100% originaux au meilleur prix en Tunisie.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold hover:bg-blue-700 transition-colors"
              >
                {t('discover_catalog')}
              </button>
            </div>
          ) : (
            items.map((item) => {
              const itemPrice = item.product.promoPrice ?? item.product.price;
              return (
                <div key={`${item.product.id}-${item.size}`} className="pt-3 flex gap-3 items-center">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-50 border border-slate-200 shrink-0"
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider block">
                      {item.product.brandName}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                      {item.product.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-500">
                        {t('size')}: <strong className="text-slate-900">{item.size}</strong>
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="font-black text-slate-900">{itemPrice} DT</span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 pt-1">
                      <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 text-xs font-bold">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 rounded-l-lg"
                        >
                          -
                        </button>
                        <span className="px-2.5 py-0.5 text-slate-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 rounded-r-lg"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id, item.size)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary & Checkout CTA */}
        {items.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between font-semibold">
                <span>{t('subtotal')}</span>
                <span className="text-slate-900 font-bold">{subtotal} DT</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Réduction ({appliedPromoCode}):</span>
                  <span>-{discountAmount} DT</span>
                </div>
              )}
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Livraison:</span>
                <span>Calculée à l'étape suivante</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-black text-slate-900 text-sm">Total estimé:</span>
              <span className="font-black text-blue-600 text-xl">
                {subtotal - discountAmount} DT
              </span>
            </div>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30"
            >
              <span>{t('order')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('no_payment_notice')}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
