import React, { useState } from 'react';
import { Plus, Tag, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { Promotion } from '../../types';
import { addPromotion, updatePromotion, deletePromotion } from '../../services/storeService';

interface AdminPromotionsViewProps {
  promotions: Promotion[];
}

export const AdminPromotionsView: React.FC<AdminPromotionsViewProps> = ({ promotions }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [code, setCode] = useState('AMINO10');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [minOrderAmount, setMinOrderAmount] = useState<number | undefined>(100);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || discountPercent <= 0) return;

    setLoading(true);
    try {
      await addPromotion({
        code: code.trim().toUpperCase(),
        discountPercent: Number(discountPercent),
        startDate,
        endDate,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : undefined,
        isActive: true
      });

      setIsFormOpen(false);
      setCode('');
    } catch (err) {
      console.error('Error adding promo:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (p: Promotion) => {
    await updatePromotion(p.id, { isActive: !p.isActive });
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePromotion(id);
    } catch (err) {
      console.error('Error deleting promotion:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Gestion des Codes Promo</h2>
          <p className="text-xs text-slate-500 font-medium">
            Créez des réductions en pourcentage pour vos clients lors de la commande.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-blue-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Code Promo</span>
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-extrabold text-slate-900">Nouveau Code Promo</h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Code Promo</label>
              <input
                type="text"
                required
                placeholder="ex: AMINO10"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Pourcentage %</label>
              <input
                type="number"
                required
                min="1"
                max="90"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Date Début</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Date Fin</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Montant Min Commande (DT)</label>
              <input
                type="number"
                placeholder="ex: 100"
                value={minOrderAmount || ''}
                onChange={(e) => setMinOrderAmount(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-md transition-all"
            >
              {loading ? 'Création...' : 'Créer le code'}
            </button>
          </div>
        </form>
      )}

      {/* Promotions List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Réduction</th>
                <th className="py-3 px-4">Période</th>
                <th className="py-3 px-4">Min Commande</th>
                <th className="py-3 px-4">Utilisations</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {promotions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucun code promo créé.
                  </td>
                </tr>
              ) : (
                promotions.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-black text-blue-600">{p.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">-{p.discountPercent}%</td>
                    <td className="py-3 px-4 text-slate-500">
                      {p.startDate} au {p.endDate}
                    </td>
                    <td className="py-3 px-4 font-semibold">
                      {p.minOrderAmount ? `${p.minOrderAmount} DT` : 'Aucun'}
                    </td>
                    <td className="py-3 px-4 font-bold">{p.timesUsed || 0} fois</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(p)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          p.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {p.isActive ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
