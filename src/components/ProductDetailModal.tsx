import React, { useState } from 'react';
import { X, ShoppingBag, Zap, ShieldCheck, Truck, Store, Check, AlertCircle, Play, Video } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { addToCart, quickBuy } = useCart();
  const { t } = useLanguage();

  if (!product) return null;

  // Prepare combined media list (images + videos)
  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'];
  const videos = product.videos || [];

  const mediaList = [
    ...images.map((img) => ({ type: 'image' as const, url: img })),
    ...videos.map((vid) => ({ type: 'video' as const, url: vid }))
  ];

  const [activeMedia, setActiveMedia] = useState(mediaList[0] || { type: 'image' as const, url: images[0] });
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [errorMsg, setErrorMsg] = useState('');

  // Find size stock info
  const selectedSizeObj = product.sizes.find((s) => s.size === selectedSize);
  const isOutOfStock = product.sizes.every((s) => s.stock <= 0);

  // Discount %
  let discountPercent = 0;
  if (product.promoPrice && product.promoPrice < product.price) {
    discountPercent = Math.round(((product.price - product.promoPrice) / product.price) * 100);
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      setErrorMsg(t('select_size'));
      return;
    }
    setErrorMsg('');
    addToCart(product, selectedSize, quantity);
    onClose();
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setErrorMsg(t('select_size'));
      return;
    }
    setErrorMsg('');
    quickBuy(product, selectedSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image/Video Gallery */}
          <div className="p-6 bg-slate-50 flex flex-col justify-between">
            <div className="aspect-square rounded-2xl overflow-hidden bg-black border border-slate-200/80 mb-4 relative flex items-center justify-center">
              {activeMedia.type === 'video' ? (
                activeMedia.url.includes('youtube.com') || activeMedia.url.includes('youtu.be') ? (
                  <iframe
                    src={activeMedia.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    title={product.name}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={activeMedia.url}
                    controls
                    autoPlay
                    loop
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <img
                  src={activeMedia.url}
                  alt={product.name}
                  className="w-full h-full object-cover object-center bg-white"
                />
              )}

              {discountPercent > 0 && (
                <span className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-rose-600 text-white font-extrabold text-xs uppercase shadow-md">
                  -{discountPercent}% PROMO
                </span>
              )}

              {videos.length > 0 && (
                <span className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full bg-slate-900/80 text-white font-bold text-[10px] flex items-center gap-1 backdrop-blur-xs">
                  <Video className="w-3 h-3 text-indigo-400" />
                  <span>{videos.length} vidéo{videos.length > 1 ? 's' : ''}</span>
                </span>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {mediaList.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {mediaList.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveMedia(item)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all bg-slate-100 ${
                      activeMedia.url === item.url ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-white relative">
                        {item.url.includes('data:video') || item.url.endsWith('.mp4') ? (
                          <video src={item.url} className="w-full h-full object-cover opacity-60" />
                        ) : null}
                        <div className="absolute inset-0 flex items-center justify-center bg-indigo-900/40">
                          <Play className="w-5 h-5 text-white fill-white" />
                        </div>
                      </div>
                    ) : (
                      <img src={item.url} alt={`Aperçu ${i + 1}`} className="w-full h-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Info & Size Selection */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Brand & Category */}
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-blue-600">{product.brandName}</span>
                <span className="text-slate-400">{product.categoryName}</span>
              </div>

              {/* Title */}
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {product.name}
              </h2>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                {product.promoPrice && product.promoPrice < product.price ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-black text-rose-600">
                      {product.promoPrice} DT
                    </span>
                    <span className="text-base text-slate-400 line-through font-semibold">
                      {product.price} DT
                    </span>
                  </>
                ) : (
                  <span className="text-2xl sm:text-3xl font-black text-slate-900">
                    {product.price} DT
                  </span>
                )}
                <span className="text-xs text-slate-500 font-medium">Prix TTC (hors livraison)</span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                {product.description || 'Chaussures originales garanties. Modèle confortable et résistant pour une utilisation quotidienne.'}
              </p>

              {/* Size Selector */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                    <span>Pointure (Taille)</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  {selectedSizeObj && (
                    <span className="text-xs text-slate-500 font-semibold">
                      Stock: {selectedSizeObj.stock} disponible(s)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {product.sizes.map((s) => {
                    const disabled = s.stock <= 0;
                    const isSelected = selectedSize === s.size;
                    return (
                      <button
                        key={s.size}
                        disabled={disabled}
                        onClick={() => {
                          setSelectedSize(s.size);
                          setErrorMsg('');
                        }}
                        className={`py-3 rounded-xl text-xs font-black transition-all border flex flex-col items-center justify-center ${
                          disabled
                            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30 ring-2 ring-blue-500/20'
                            : 'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        <span>{s.size}</span>
                        {disabled && <span className="text-[9px] font-medium no-underline">Épuisé</span>}
                      </button>
                    );
                  })}
                </div>

                {errorMsg && (
                  <p className="text-xs font-bold text-rose-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quantité:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 text-sm font-extrabold text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>{t('add_to_cart')}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>{t('buy_now')}</span>
                </button>
              </div>

              {/* Guarantees list */}
              <div className="bg-slate-50 rounded-xl p-3 text-[11px] font-semibold text-slate-600 space-y-1.5 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Produit 100% Original garanti</span>
                </div>
                <div className="flex items-center gap-2 text-slate-800">
                  <Truck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Livraison à domicile (8 DT) ou Retrait Magasin (Gratuit)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
