import React, { useState } from 'react';
import { Plus, DollarSign, Calendar, FileText } from 'lucide-react';
import { ManualRevenue } from '../../types';
import { addManualRevenue } from '../../services/storeService';

interface AdminManualRevenueViewProps {
  manualRevenues: ManualRevenue[];
}

export const AdminManualRevenueView: React.FC<AdminManualRevenueViewProps> = ({ manualRevenues }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [amount, setAmount] = useState<number>(250);
  const [reason, setReason] = useState('Vente en magasin / Espèces');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const totalManualRevenue = manualRevenues.reduce((sum, r) => sum + r.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !reason.trim()) return;

    setLoading(true);
    try {
      await addManualRevenue({
        amount: Number(amount),
        reason: reason.trim(),
        notes: notes.trim(),
        date: new Date().toISOString().split('T')[0]
      });

      setIsFormOpen(false);
      setAmount(250);
      setNotes('');
    } catch (err) {
      console.error('Error adding manual revenue:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Entrées de Revenu Manuel (Hors Ligne)</h2>
          <p className="text-xs text-slate-500 font-medium">
            Enregistrez les ventes physiques en magasin séparément des commandes en ligne.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une Entrée Manuelle</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
          Total Revenu Manuel Enregistré
        </span>
        <p className="text-3xl font-black text-emerald-600">{totalManualRevenue} DT</p>
        <p className="text-[11px] text-slate-400 font-medium">
          Ce montant est conservé indépendamment du chiffre d'affaires des commandes en ligne.
        </p>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-extrabold text-slate-900">Nouvelle Entrée de Revenu Manuel</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Montant (DT)</label>
              <input
                type="number"
                required
                min="1"
                placeholder="250"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-extrabold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Motif / Source</label>
              <input
                type="text"
                required
                placeholder="ex: Vente magasin direct"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Notes (Optionnel)</label>
              <input
                type="text"
                placeholder="Notes supplémentaires..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer la vente'}
            </button>
          </div>
        </form>
      )}

      {/* Manual Revenues Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Motif / Source</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {manualRevenues.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400">
                    Aucune entrée manuelle enregistrée.
                  </td>
                </tr>
              ) : (
                manualRevenues.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-slate-500">{m.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{m.reason}</td>
                    <td className="py-3 px-4 text-slate-500">{m.notes || '-'}</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600">+{m.amount} DT</td>
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
