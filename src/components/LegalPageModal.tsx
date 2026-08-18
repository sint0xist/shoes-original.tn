import React from 'react';
import { X, ShieldCheck, Truck, Store, Phone, Mail, MapPin } from 'lucide-react';
import { StoreSettings } from '../types';
import { DEFAULT_STORE_SETTINGS } from '../lib/initialData';

interface LegalPageModalProps {
  type: string | null;
  settings?: StoreSettings;
  onClose: () => void;
}

export const LegalPageModal: React.FC<LegalPageModalProps> = ({
  type,
  settings = DEFAULT_STORE_SETTINGS,
  onClose
}) => {
  if (!type) return null;

  const phone1 = settings?.phone1 || DEFAULT_STORE_SETTINGS.phone1;
  const phone2 = settings?.phone2 || DEFAULT_STORE_SETTINGS.phone2;
  const email = settings?.email || DEFAULT_STORE_SETTINGS.email;
  const address = settings?.address || DEFAULT_STORE_SETTINGS.address;
  const openingHours = settings?.openingHours || DEFAULT_STORE_SETTINGS.openingHours;
  const deliveryFee = settings?.deliveryFee ?? DEFAULT_STORE_SETTINGS.deliveryFee;
  const deliveryCompany = settings?.deliveryCompany || DEFAULT_STORE_SETTINGS.deliveryCompany;
  const deliveryTimeframe = settings?.deliveryTimeframe || DEFAULT_STORE_SETTINGS.deliveryTimeframe;

  const renderContent = () => {
    switch (type) {
      case 'delivery':
        return (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <h3 className="text-lg font-black text-slate-900">Modalités de Livraison & Retrait</h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
              <h4 className="font-bold text-blue-900 flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-blue-600" />
                Livraison à domicile en Tunisie ({deliveryFee} DT)
              </h4>
              <p>
                Vos commandes sont expédiées par notre partenaire <strong>{deliveryCompany}</strong> sur l'ensemble des 24 governorats tunisiens.
              </p>
              <p>
                <strong>Délai d'expédition estimé:</strong> {deliveryTimeframe}. Le paiement s'effectue en espèces lors de la réception du colis.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
              <h4 className="font-bold text-emerald-900 flex items-center gap-2 text-sm">
                <Store className="w-4 h-4 text-emerald-600" />
                Retrait gratuit au magasin (0 DT)
              </h4>
              <p>
                Vous pouvez venir récupérer votre commande directement dans notre boutique à l'adresse suivante:
              </p>
              <p className="font-bold text-slate-900">{address}</p>
              <p>
                <strong>Horaires d'ouverture:</strong> {openingHours}
              </p>
            </div>
          </div>
        );

      case 'cgv':
        return (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <h3 className="text-lg font-black text-slate-900">Conditions Générales de Vente (CGV)</h3>
            <p>
              Bienvenue sur <strong>Amino-Shoes (shoes-original.tn)</strong>. En passant commande sur notre site, vous acceptez sans réserve les présentes conditions générales.
            </p>
            <h4 className="font-bold text-slate-900 text-sm">1. Produits & Originalité</h4>
            <p>
              Tous les produits commercialisés par Amino-Shoes sont garantis 100% originaux. Le stock est géré en temps réel par pointure.
            </p>
            <h4 className="font-bold text-slate-900 text-sm">2. Prix & Modalités de Paiement</h4>
            <p>
              Les prix sont exprimés en Dinars Tunisiens (DT). Le paiement s'effectue uniquement à la livraison en espèces ou lors du retrait au magasin. Aucun paiement bancaire en ligne n'est exigé.
            </p>
            <h4 className="font-bold text-slate-900 text-sm">3. Confirmation par WhatsApp</h4>
            <p>
              Après validation de votre commande sur le site, une confirmation rapide par WhatsApp vous permet de suivre votre expédition avec notre équipe.
            </p>
          </div>
        );

      case 'returns':
        return (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <h3 className="text-lg font-black text-slate-900">Politique de Retour & Échange</h3>
            <p>
              Chez Amino-Shoes, votre satisfaction est notre priorité. Si la pointure ne vous convient pas ou si vous souhaitez procéder à un échange:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Vous disposez d'un délai d'échange de 48h après la réception de votre colis.</li>
              <li>Le produit doit être neuf, non porté et conservé dans son emballage d'origine.</li>
              <li>Les frais de renvoi pour échange sont à la charge du client sauf en cas d'erreur sur l'article.</li>
              <li>Pour initier un échange, contactez directement notre service client au {phone1}.</li>
            </ul>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <h3 className="text-lg font-black text-slate-900">Politique de Confidentialité</h3>
            <p>
              Amino-Shoes s'engage à protéger vos données personnelles. Les informations récoltées lors de la commande (nom, téléphone, adresse) servent exclusivement au traitement et à l'expedition de votre commande en Tunisie.
            </p>
            <p>
              Vos données ne sont ni vendues, ni louées, ni transmises à des tiers non autorisés.
            </p>
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4 text-xs text-slate-700 leading-relaxed">
            <h3 className="text-lg font-black text-slate-900">Contact & Support Service Client</h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900">Téléphone:</span>
                <span>{phone1} / {phone2}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900">Email:</span>
                <span>{email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900 block">Adresse Magasin:</span>
                  <span>{address}</span>
                  <span className="block text-slate-500">{openingHours}</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
      <div className="min-h-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-4 animate-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {renderContent()}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
