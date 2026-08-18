import React, { useState } from 'react';
import { X, CheckCircle2, Truck, Store, Tag, ShieldCheck, AlertCircle, Phone, MapPin, Send, ExternalLink } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { TUNISIAN_WILAYAS, CustomerInfo, DeliveryMethod, Order, StoreSettings } from '../types';
import { createOrder, validatePromoCode } from '../services/storeService';

interface CheckoutModalProps {
  settings: StoreSettings;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ settings, onClose }) => {
  const {
    items,
    subtotal,
    clearCart,
    appliedPromoCode,
    discountPercent,
    discountAmount,
    applyPromo,
    removePromo
  } = useCart();
  const { t } = useLanguage();

  const [customer, setCustomer] = useState<CustomerInfo>({
    name: '',
    phone: '',
    phone2: '',
    email: '',
    wilaya: TUNISIAN_WILAYAS[0],
    delegation: '',
    address: '',
    extraInfo: ''
  });

  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Created Order state upon completion
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  // Delivery fee calculation
  const deliveryFee = deliveryMethod === 'delivery' ? settings.deliveryFee : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);

  // Validate Promo Code
  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoError('');
    setPromoSuccess('');

    const res = await validatePromoCode(promoInput, subtotal);
    if (res.valid) {
      applyPromo(promoInput.trim().toUpperCase(), res.discountPercent);
      setPromoSuccess(`Code appliqué ! ${res.discountPercent}% de réduction`);
    } else {
      setPromoError(res.message || 'Code promo invalide');
    }
  };

  // Submit Order
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Validations
    if (!customer.name.trim()) {
      setFormError('Veuillez saisir votre nom et prénom.');
      return;
    }
    if (!customer.phone.trim() || customer.phone.length < 8) {
      setFormError('Veuillez saisir un numéro de téléphone valide.');
      return;
    }
    if (!customer.wilaya) {
      setFormError('Veuillez choisir votre Wilaya.');
      return;
    }
    if (!customer.delegation.trim()) {
      setFormError('Veuillez saisir votre délégation / معتمدية.');
      return;
    }
    if (!customer.address.trim()) {
      setFormError('Veuillez saisir votre adresse complète.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer,
        deliveryMethod,
        promoCode: appliedPromoCode || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          size: i.size,
          quantity: i.quantity
        }))
      };

      const newOrder = await createOrder(orderPayload);
      setCompletedOrder(newOrder);
      clearCart();
    } catch (err: any) {
      console.error('Error creating order:', err);
      setFormError(err.message || 'Impossible de traiter la commande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build WhatsApp pre-filled message
  const getWhatsAppUrl = () => {
    if (!completedOrder) return '#';

    // Format phone clean
    const phone = settings?.phone1 || '+216 90410540';
    const rawPhone = phone.replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('216') ? rawPhone : `216${rawPhone}`;

    const itemsText = completedOrder.items
      .map(
        (i) =>
          `• *${i.productName}* (${i.brandName}) - Pointure: *${i.size}* x${i.quantity} = ${i.totalPrice} DT`
      )
      .join('\n');

    const msg = `🛍️ *NOUVELLE COMMANDE AMINO-SHOES*
----------------------------------------
*N° de Commande:* ${completedOrder.orderNumber}
*Mode:* ${completedOrder.deliveryMethod === 'delivery' ? '🚚 Livraison à domicile' : '🏪 Retrait au magasin'}

*Client:* ${completedOrder.customer.name}
*Tél:* ${completedOrder.customer.phone} ${completedOrder.customer.phone2 ? `/ ${completedOrder.customer.phone2}` : ''}
*Wilaya:* ${completedOrder.customer.wilaya}
*Délégation:* ${completedOrder.customer.delegation}
*Adresse:* ${completedOrder.customer.address}
${completedOrder.customer.extraInfo ? `*Info Supp:* ${completedOrder.customer.extraInfo}` : ''}

*Produit(s):*
${itemsText}

----------------------------------------
Sous-total: ${completedOrder.subtotal} DT
Frais livraison: ${completedOrder.deliveryFee} DT
${completedOrder.discount > 0 ? `Réduction: -${completedOrder.discount} DT\n` : ''}*TOTAL À PAYER:* *${completedOrder.total} DT*

Merci pour votre confiance ! 👟`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
      <div className="min-h-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              {completedOrder ? 'Commande Confirmée !' : t('confirm_order')}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {completedOrder
                ? 'Votre commande a été enregistrée avec succès.'
                : 'Formulaire rapide de livraison en Tunisie'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {completedOrder ? (
          /* SUCCESS VIEW */
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Numéro de commande
              </span>
              <span className="text-3xl font-black text-blue-600 tracking-tight">
                {completedOrder.orderNumber}
              </span>
              <p className="text-sm font-semibold text-slate-700 max-w-md mx-auto">
                {t('whatsapp_success_msg')}
              </p>
            </div>

            {/* Order Details Summary Box */}
            <div className="bg-slate-50 rounded-2xl p-4 text-left text-xs text-slate-700 space-y-2 border border-slate-200/80">
              <div className="flex justify-between font-bold border-b border-slate-200 pb-2 text-slate-900">
                <span>Client: {completedOrder.customer.name}</span>
                <span>Tél: {completedOrder.customer.phone}</span>
              </div>
              <p>
                <strong>Adresse:</strong> {completedOrder.customer.address}, {completedOrder.customer.delegation}, {completedOrder.customer.wilaya}
              </p>
              <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-sm">
                <span>Total à payer (Paiement à la livraison):</span>
                <span className="text-blue-600">{completedOrder.total} DT</span>
              </div>
            </div>

            {/* BIG WHATSAPP BUTTON */}
            <div className="space-y-3 pt-2">
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/30 transition-all transform hover:scale-102"
              >
                <Send className="w-5 h-5" />
                <span>{t('send_whatsapp')}</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
              >
                Retourner à la boutique
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW */
          <form onSubmit={handleSubmitOrder} className="p-6 sm:p-8 space-y-6">
            {/* Delivery Method Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                1. Mode de réception <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    deliveryMethod === 'delivery'
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="delivery"
                    checked={deliveryMethod === 'delivery'}
                    onChange={() => setDeliveryMethod('delivery')}
                    className="mt-1 text-blue-600"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-sm">
                      <Truck className="w-4 h-4 text-blue-600" />
                      <span>Livraison à domicile</span>
                    </div>
                    <span className="text-xs text-blue-600 font-bold block">
                      +8 DT ({settings.deliveryCompany || 'Leader Ecom'})
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Délai estimé: {settings.deliveryTimeframe || '48h à 6 jours'}
                    </span>
                  </div>
                </label>

                <label
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                    deliveryMethod === 'pickup'
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={() => setDeliveryMethod('pickup')}
                    className="mt-1 text-blue-600"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-sm">
                      <Store className="w-4 h-4 text-emerald-600" />
                      <span>Retrait au magasin</span>
                    </div>
                    <span className="text-xs text-emerald-600 font-bold block">
                      Gratuit (0 DT)
                    </span>
                    <a
                      href={settings.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Voir la localisation Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </label>
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                2. Vos informations de livraison
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Nom et Prénom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Mohamed Ali"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Numéro de Téléphone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="ex: 90410540"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Second Phone */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    2ème Téléphone (Optionnel)
                  </label>
                  <input
                    type="tel"
                    placeholder="ex: 90042240"
                    value={customer.phone2}
                    onChange={(e) => setCustomer({ ...customer, phone2: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Wilaya Select */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Wilaya <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={customer.wilaya}
                    onChange={(e) => setCustomer({ ...customer, wilaya: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    {TUNISIAN_WILAYAS.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delegation */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Délégation / معتمدية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ex: Ennasr, Menzah 5..."
                    value={customer.delegation}
                    onChange={(e) => setCustomer({ ...customer, delegation: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email (Optionnel)
                  </label>
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Adresse de livraison <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rue, N° d'immeuble, appartement..."
                  value={customer.address}
                  onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              {/* Extra Info */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Informations supplémentaires (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Exemple : près de la mosquée, 2ème étage, point de repère..."
                  value={customer.extraInfo}
                  onChange={(e) => setCustomer({ ...customer, extraInfo: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Promo Code Input */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Possédez-vous un code promo ?</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="ex: AMINO10"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                >
                  {t('apply')}
                </button>
              </div>

              {promoSuccess && <p className="text-[11px] font-bold text-emerald-600">{promoSuccess}</p>}
              {promoError && <p className="text-[11px] font-bold text-rose-600">{promoError}</p>}
            </div>

            {/* Total Breakdown & Payment Notice */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Sous-total articles:</span>
                <span>{subtotal} DT</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-400 font-bold">
                  <span>Réduction code promo:</span>
                  <span>-{discountAmount} DT</span>
                </div>
              )}

              <div className="flex justify-between text-xs text-slate-300">
                <span>Mode de livraison ({deliveryMethod === 'delivery' ? 'Domicile' : 'Retrait'}):</span>
                <span>{deliveryFee === 0 ? 'GRATUIT' : `${deliveryFee} DT`}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="font-extrabold text-sm text-white">TOTAL À PAYER:</span>
                <span className="font-black text-2xl text-amber-400">{finalTotal} DT</span>
              </div>

              <p className="text-[11px] text-slate-400 font-medium text-center pt-1">
                💳 Paiement en espèces uniquement à la livraison ou au retrait.
              </p>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-blue-600/30 transition-all"
            >
              {isSubmitting ? (
                <span>Enregistrement de la commande...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirmer la commande ({finalTotal} DT)</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
      </div>
    </div>
  );
};
