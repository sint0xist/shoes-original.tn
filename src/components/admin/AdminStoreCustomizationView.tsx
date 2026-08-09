import React, { useState } from 'react';
import { Settings, Save, CheckCircle2, Phone, MapPin, Globe, Image as ImageIcon } from 'lucide-react';
import { StoreSettings } from '../../types';
import { updateStoreSettings } from '../../services/storeService';

interface AdminStoreCustomizationViewProps {
  settings: StoreSettings;
}

export const AdminStoreCustomizationView: React.FC<AdminStoreCustomizationViewProps> = ({
  settings
}) => {
  const [form, setForm] = useState<StoreSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      await updateStoreSettings(form);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating store settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900">Personnalisation du Magasin & Contenu</h2>
        <p className="text-xs text-slate-500 font-medium">
          Modifiez les coordonnées, numéros WhatsApp, bannières et sections sans toucher au code.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Brand Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            1. Informations Générales
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Nom de la boutique</label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">URL du Logo Officiel</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={form.logoUrl || ''}
                  placeholder="/logo.jpg"
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-medium"
                />
                <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-white p-0.5">
                  <img
                    src={form.logoUrl || '/logo.jpg'}
                    alt="Logo Preview"
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Slogan / Tagline</label>
              <input
                type="text"
                value={form.slogan}
                onChange={(e) => setForm({ ...form, slogan: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Téléphone / WhatsApp 1</label>
              <input
                type="text"
                value={form.phone1}
                onChange={(e) => setForm({ ...form, phone1: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Téléphone / WhatsApp 2</label>
              <input
                type="text"
                value={form.phone2}
                onChange={(e) => setForm({ ...form, phone2: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Contact</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Lien Google Maps Boutique</label>
              <input
                type="text"
                value={form.googleMapsUrl}
                onChange={(e) => setForm({ ...form, googleMapsUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-medium text-blue-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Adresse Physique</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Social Networks */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            2. Réseaux Sociaux
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Lien TikTok</label>
              <input
                type="text"
                value={form.tiktokUrl}
                onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Lien Instagram</label>
              <input
                type="text"
                value={form.instagramUrl}
                onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Lien Facebook</label>
              <input
                type="text"
                value={form.facebookUrl}
                onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Hero Section Customization */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            3. Bannière d'Accueil (Hero)
          </h3>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Titre Principal Hero</label>
              <input
                type="text"
                value={form.heroTitle}
                onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-black text-slate-900"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Sous-titre Hero</label>
              <input
                type="text"
                value={form.heroSubtitle}
                onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-medium"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Image Hero URL</label>
              <input
                type="url"
                value={form.heroImage}
                onChange={(e) => setForm({ ...form, heroImage: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Homepage Sections Visibility */}
        <div className="space-y-4">
          <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
            4. Affichage des Sections d'Accueil
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-bold text-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showNouveautes}
                onChange={(e) => setForm({ ...form, showNouveautes: e.target.checked })}
                className="rounded-md border-slate-300 text-blue-600"
              />
              <span>Section Nouveautés</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showBestSellers}
                onChange={(e) => setForm({ ...form, showBestSellers: e.target.checked })}
                className="rounded-md border-slate-300 text-blue-600"
              />
              <span>Section Meilleures Ventes</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showPromotions}
                onChange={(e) => setForm({ ...form, showPromotions: e.target.checked })}
                className="rounded-md border-slate-300 text-blue-600"
              />
              <span>Section Promotions</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showCommander3Clicks}
                onChange={(e) => setForm({ ...form, showCommander3Clicks: e.target.checked })}
                className="rounded-md border-slate-300 text-blue-600"
              />
              <span>Section Commander en 3 clics</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.showWholesale}
                onChange={(e) => setForm({ ...form, showWholesale: e.target.checked })}
                className="rounded-md border-slate-300 text-blue-600"
              />
              <span>Section Vente en Gros</span>
            </label>
          </div>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Modification du contenu enregistrée avec succès !</span>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center gap-2 shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
