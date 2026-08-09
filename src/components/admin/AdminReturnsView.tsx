import React, { useState } from 'react';
import { Plus, RotateCcw, AlertCircle, DollarSign, Calendar } from 'lucide-react';
import { OrderReturn } from '../../types';
import { addReturn } from '../../services/storeService';

interface AdminReturnsViewProps {
  returns: OrderReturn[];
}

export const AdminReturnsView: React.FC<AdminReturnsViewProps> = ({ returns }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [productName, setProductName] = useState('');
  const [size, setSize] = useState('42');
  const [reason, setReason] = useState('Problème de pointure / Taille');
  const [amount, setAmount] = useState(159);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const totalReturnAmount = returns.reduce((sum, r) => sum + r.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !productName.trim()) return;

    setLoading(true);
    try {
      await addReturn({
        orderNumber: orderNumber.trim(),
        productName: productName.trim(),
        size,
        reason: reason.trim(),
        amount: Number(amount),
        notes: notes.trim(),
        date: new Date().toISOString().split('T')[0]
      });

      setIsFormOpen(false);
      setOrderNumber('');
      setProductName('');
      setNotes('');
    } catch (err) {
      console.error('Error adding return:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Gestion Manuelle des Retours</h2>
          <p className="text-xs text-slate-500 font-medium">
            Enregistrez les retours d'articles et suivez le montant d'impact financier.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center gap-2 shadow-lg transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Enregistrer un Retour</span>
        </button>
      </div>

      {/* Summary Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Total des Retours Enregistrés
          </span>
          <p className="text-2xl font-black text-rose-600">{returns.length} retour(s)</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Montant Total des Articles Retournés
          </span>
          <p className="text-2xl font-black text-rose-600">{totalReturnAmount} DT</p>
        </div>
      </div>

      {/* Add Return Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-extrabold text-slate-900">Nouveau Retour Client</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">N° Commande</label>
              <input
                type="text"
                required
                placeholder="ex: #AMN-1048"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Produit</label>
              <input
                type="text"
                required
                placeholder="ex: Nike Air Max 270"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Pointure</label>
              <input
                type="text"
                required
                placeholder="ex: 42"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Motif du retour</label>
              <input
                type="text"
                required
                placeholder="ex: Problème de pointure"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Montant (DT)</label>
              <input
                type="number"
                required
                min="0"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
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
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md transition-all"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer le retour'}
            </button>
          </div>
        </form>
      )}

      {/* Returns List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">N° Commande</th>
                <th className="py-3 px-4">Produit</th>
                <th className="py-3 px-4">Pointure</th>
                <th className="py-3 px-4">Motif</th>
                <th className="py-3 px-4">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {returns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Aucun retour enregistré.
                  </td>
                </tr>
              ) : (
                returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 text-slate-500">{r.date}</td>
                    <td className="py-3 px-4 font-bold text-rose-600">{r.orderNumber}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{r.productName}</td>
                    <td className="py-3 px-4 font-bold text-blue-600">{r.size}</td>
                    <td className="py-3 px-4">{r.reason}</td>
                    <td className="py-3 px-4 font-black text-rose-600">-{r.amount} DT</td>
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
