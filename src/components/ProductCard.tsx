import React, { useState } from 'react';
import { ShoppingBag, Eye, Zap, Sparkles, Tag, Flame, Video } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onSelectProduct?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  onProductClick
}) => {
  const { addToCart, quickBuy } = useCart();
  const { t } = useLanguage();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showSizePicker, setShowSizePicker] = useState(false);

  const handleCardClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (typeof onSelectProduct === 'function') {
      onSelectProduct(product);
    } else if (typeof onProductClick === 'function') {
      onProductClick(product);
    }
  };

  // Available in-stock sizes
  const availableSizes = product.sizes.filter((s) => s.stock > 0);
  const isOutOfStock = availableSizes.length === 0;

  // Calculate discount percentage
  let discountPercent = 0;
  if (product.promoPrice && product.promoPrice < product.price) {
    discountPercent = Math.round(((product.price - product.promoPrice) / product.price) * 100);
  }

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    if (availableSizes.length === 1) {
      addToCart(product, availableSizes[0].size, 1);
      return;
    }
    setShowSizePicker(!showSizePicker);
  };

  const handleSelectSizeAndAdd = (e: React.MouseEvent, size: string) => {
    e.stopPropagation();
    addToCart(product, size, 1);
    setShowSizePicker(false);
  };

  return (
    <div
      onClick={() => handleCardClick()}
      className="group relative bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/3 bg-slate-50 overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-white text-[11px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
              {t('out_of_stock')}
            </span>
          ) : (
            <>
              {discountPercent > 0 && (
                <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Tag className="w-3 h-3" />
                  -{discountPercent}%
                </span>
              )}

              {product.isNew && (
                <span className="px-2.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  Nouveau
                </span>
              )}

              {product.isBestSeller && !product.isNew && (
                <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Flame className="w-3 h-3" />
                  Top Vente
                </span>
              )}
            </>
          )}
        </div>

        {/* Video Badge Overlay */}
        {product.videos && product.videos.length > 0 && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2 py-1 rounded-lg bg-slate-900/80 text-white font-bold text-[10px] flex items-center gap-1 backdrop-blur-xs shadow-md">
              <Video className="w-3 h-3 text-indigo-400" />
              <span>Vidéo</span>
            </span>
          </div>
        )}

        {/* Quick Action Overlay Buttons */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => handleCardClick(e)}
            className="p-2.5 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs transition-transform hover:scale-110"
            title="Aperçu rapide"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Brand & Stock status */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold">
            <span className="uppercase tracking-wider text-blue-600">{product.brandName}</span>
            <span className={isOutOfStock ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
              {isOutOfStock ? t('out_of_stock') : t('in_stock')}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>

          {/* Sizes Badges */}
          <div className="flex flex-wrap gap-1 pt-2">
            {product.sizes.map((s) => (
              <span
                key={s.size}
                className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md border ${
                  s.stock > 0
                    ? 'bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
                }`}
              >
                {s.size}
              </span>
            ))}
          </div>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            {product.promoPrice && product.promoPrice < product.price ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-rose-600">
                  {product.promoPrice} DT
                </span>
                <span className="text-xs text-slate-400 line-through font-semibold">
                  {product.price} DT
                </span>
              </div>
            ) : (
              <span className="text-lg font-black text-slate-900">
                {product.price} DT
              </span>
            )}
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={isOutOfStock}
            className={`px-3 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-md'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('add_to_cart')}</span>
          </button>
        </div>

        {/* Inline Quick Size Picker Popover */}
        {showSizePicker && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="mt-2 p-3 bg-slate-900 text-white rounded-xl space-y-2 animate-in fade-in duration-200"
          >
            <p className="text-[11px] font-bold text-slate-300">{t('select_size')}:</p>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map((s) => (
                <button
                  key={s.size}
                  onClick={(e) => handleSelectSizeAndAdd(e, s.size)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 text-white rounded-lg text-xs font-extrabold transition-colors border border-slate-700"
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
