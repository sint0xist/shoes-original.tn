import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Product, Order, OrderReturn } from '../../types';

interface AdminStatisticsViewProps {
  products: Product[];
  orders: Order[];
  returns: OrderReturn[];
}

export const AdminStatisticsView: React.FC<AdminStatisticsViewProps> = ({
  products,
  orders,
  returns
}) => {
  // Aggregate Sales by Size (Pointure)
  const sizeSalesData = useMemo(() => {
    const sizeMap: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.status !== 'Annulée') {
        o.items.forEach((item) => {
          sizeMap[item.size] = (sizeMap[item.size] || 0) + item.quantity;
        });
      }
    });

    return Object.entries(sizeMap)
      .map(([size, sales]) => ({ size: `Pointure ${size}`, sales, rawSize: size }))
      .sort((a, b) => b.sales - a.sales);
  }, [orders]);

  // Aggregate Sales by Brand
  const brandSalesData = useMemo(() => {
    const brandMap: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.status !== 'Annulée') {
        o.items.forEach((item) => {
          brandMap[item.brandName] = (brandMap[item.brandName] || 0) + item.totalPrice;
        });
      }
    });

    return Object.entries(brandMap).map(([brand, revenue]) => ({ name: brand, value: revenue }));
  }, [orders]);

  // Orders status distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return Object.entries(counts).map(([status, count]) => ({ name: status, value: count }));
  }, [orders]);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#64748b'];

  const totalDeliveredRevenue = orders
    .filter((o) => o.status === 'Livrée')
    .reduce((sum, o) => sum + o.total, 0);

  const totalReturnLoss = returns.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">Statistiques & Ventes</h2>
          <p className="text-xs text-slate-500 font-medium">
            Analyse détaillée des ventes par pointure, marque, statut et chiffre d'affaires.
          </p>
        </div>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Chiffre d'affaires Commandes Livrées
          </span>
          <p className="text-2xl font-black text-emerald-600">{totalDeliveredRevenue} DT</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Montant Total des Retours Clients
          </span>
          <p className="text-2xl font-black text-rose-600">-{totalReturnLoss} DT</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Taux de Conversion des Commandes
          </span>
          <p className="text-2xl font-black text-blue-600">
            {orders.length > 0
              ? `${Math.round(
                  (orders.filter((o) => o.status === 'Livrée').length / orders.length) * 100
                )}%`
              : '0%'}
          </p>
        </div>
      </div>

      {/* Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Most Sold Sizes (Pointures) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">
            Pointures les plus vendues (Nombre de paires)
          </h3>

          <div className="h-64">
            {sizeSalesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Aucune donnée de vente par pointure enregistrée.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sizeSalesData}>
                  <XAxis dataKey="rawSize" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip formatter={(val) => [`${val} paires`, 'Ventes']} />
                  <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Table representation */}
          <div className="pt-2 border-t border-slate-100">
            <div className="grid grid-cols-4 gap-2 text-xs text-slate-700">
              {sizeSalesData.map((s) => (
                <div key={s.rawSize} className="p-2 bg-slate-50 rounded-lg text-center font-bold">
                  <span className="text-slate-500 block text-[10px]">Pointure {s.rawSize}</span>
                  <span className="text-blue-600 text-sm font-black">{s.sales} ventes</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Brand Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-sm">Répartition par Marque (DT)</h3>

          <div className="h-64">
            {brandSalesData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                Aucune donnée par marque.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={brandSalesData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}DT`}
                  >
                    {brandSalesData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
