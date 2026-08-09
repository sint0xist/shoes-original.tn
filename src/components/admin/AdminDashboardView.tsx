import React from 'react';
import { ShoppingBag, PackageCheck, AlertTriangle, DollarSign, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';
import { Product, Order, OrderReturn } from '../../types';

interface AdminDashboardViewProps {
  products: Product[];
  orders: Order[];
  returns: OrderReturn[];
  onNavigate: (tab: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  products,
  orders,
  returns,
  onNavigate
}) => {
  // Metrics
  const totalRevenue = orders.reduce((sum, o) => (o.status !== 'Annulée' ? sum + o.total : sum), 0);
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'Nouvelle' || o.status === 'En préparation').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'Livrée').length;

  // Low stock calculation (products with sizes having stock < 2)
  const lowStockProducts = products.filter((p) =>
    p.sizes.some((s) => s.stock <= 2 && s.stock >= 0)
  );

  return (
    <div className="space-y-6">
      {/* Top Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Chiffre d'affaires</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalRevenue} DT</p>
          <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Paiements à la livraison & retrait
          </span>
        </div>

        {/* Total Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-2 cursor-pointer hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Commandes</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalOrdersCount}</p>
          <span className="text-[11px] font-semibold text-blue-600">
            {pendingOrdersCount} en attente de traitement
          </span>
        </div>

        {/* Total Products */}
        <div
          onClick={() => onNavigate('products')}
          className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-2 cursor-pointer hover:border-blue-300 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Produits en Catalogue</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{products.length}</p>
          <span className="text-[11px] font-semibold text-slate-500">
            {products.filter((p) => p.published).length} publiés en ligne
          </span>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Alerte Stock Bas</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{lowStockProducts.length}</p>
          <span className="text-[11px] font-semibold text-amber-600">
            Pointures en rupture ou stock ≤ 2
          </span>
        </div>
      </div>

      {/* Recent Orders & Stock Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm">Dernières Commandes</h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Voir tout
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">N° Commande</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Wilaya</th>
                  <th className="py-2.5 px-3">Montant</th>
                  <th className="py-2.5 px-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      Aucune commande enregistrée pour le moment.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 5).map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-bold text-blue-600">{o.orderNumber}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{o.customer.name}</td>
                      <td className="py-3 px-3">{o.customer.wilaya}</td>
                      <td className="py-3 px-3 font-black text-slate-900">{o.total} DT</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            o.status === 'Livrée'
                              ? 'bg-emerald-100 text-emerald-800'
                              : o.status === 'Nouvelle'
                              ? 'bg-blue-100 text-blue-800'
                              : o.status === 'Annulée'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning List */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Alerte Réapprovisionnement</span>
            </h3>
            <button
              onClick={() => onNavigate('products')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Gérer
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">
                Tous les stocks sont à jour !
              </p>
            ) : (
              lowStockProducts.map((p) => (
                <div key={p.id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span className="truncate">{p.name}</span>
                    <span className="text-amber-700 font-extrabold">{p.brandName}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.sizes
                      .filter((s) => s.stock <= 2)
                      .map((s) => (
                        <span
                          key={s.size}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            s.stock === 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          T. {s.size}: {s.stock === 0 ? 'Épuisé' : `${s.stock} restants`}
                        </span>
                      ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
