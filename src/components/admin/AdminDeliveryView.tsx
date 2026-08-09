import React, { useState } from 'react';
import { Truck, Store, Save, CheckCircle2 } from 'lucide-react';
import { StoreSettings } from '../../types';
import { updateStoreSettings } from '../../services/storeService';

interface AdminDeliveryViewProps {
  settings: StoreSettings;
}

export const AdminDeliveryView: React.FC<AdminDeliveryViewProps> = ({ settings }) => {
  const [deliveryFee, setDeliveryFee] = useState(settings.deliveryFee);
  const [deliveryCompany, setDeliveryCompany] = useState(settings.deliveryCompany);
  const [deliveryTimeframe, setDeliveryTimeframe] = useState(settings.deliveryTimeframe);
  const [deliveryEnabled, setDeliveryEnabled] = useState(settings.deliveryEnabled);
  const [pickupEnabled, setPickupEnabled] = useState(settings.pickupEnabled);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      await updateStoreSettings({
        deliveryFee: Number(deliveryFee),
        deliveryCompany: deliveryCompany.trim(),
        deliveryTimeframe: deliveryTimeframe.trim(),
        deliveryEnabled,
        pickupEnabled
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating delivery settings:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900">Paramètres de Livraison & Retrait</h2>
        <p className="text-xs text-slate-500 font-medium">
          Modifiez le tarif de livraison, la société de transport et les délais d'expédition.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-slate-700 block mb-1">Frais de Livraison à Domicile (DT)</label>
          <input
            type="number"
            required
            min="0"
            value={deliveryFee}
            onChange={(e) => setDeliveryFee(Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-extrabold focus:bg-white"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Société de Transport Partner</label>
          <input
            type="text"
            required
            value={deliveryCompany}
            onChange={(e) => setDeliveryCompany(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold focus:bg-white"
          />
        </div>

        <div>
          <label className="font-bold text-slate-700 block mb-1">Délai d'expédition estimé</label>
          <input
            type="text"
            required
            value={deliveryTimeframe}
            onChange={(e) => setDeliveryTimeframe(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold focus:bg-white"
          />
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3 font-bold text-slate-800">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={deliveryEnabled}
              onChange={(e) => setDeliveryEnabled(e.target.checked)}
              className="rounded-md border-slate-300 text-blue-600"
            />
            <span>Activer l'option Livraison à domicile</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pickupEnabled}
              onChange={(e) => setPickupEnabled(e.target.checked)}
              className="rounded-md border-slate-300 text-emerald-600"
            />
            <span>Activer l'option Retrait au magasin (Gratuit)</span>
          </label>
        </div>

        {savedSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-700 font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Paramètres de livraison enregistrés avec succès !</span>
          </div>
        )}

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold flex items-center gap-2 shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
