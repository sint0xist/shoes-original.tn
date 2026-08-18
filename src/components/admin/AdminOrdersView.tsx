import React, { useState } from 'react';
import { Search, Eye, MessageSquare, Phone, MapPin, CheckCircle2, XCircle, Clock, Truck, ShieldCheck, X } from 'lucide-react';
import { Order, OrderStatus, StoreSettings } from '../../types';
import { updateOrderStatus } from '../../services/storeService';

interface AdminOrdersViewProps {
  orders: Order[];
  settings: StoreSettings;
}

export const AdminOrdersView: React.FC<AdminOrdersViewProps> = ({ orders, settings }) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('Toutes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const statusOptions: (OrderStatus | 'Toutes')[] = [
    'Toutes',
    'Nouvelle',
    'Confirmée',
    'En préparation',
    'Expédiée',
    'Livrée',
    'Annulée',
    'Retournée'
  ];

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    if (selectedStatus !== 'Toutes' && o.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = o.orderNumber.toLowerCase().includes(q);
      const matchName = o.customer.name.toLowerCase().includes(q);
      const matchPhone = o.customer.phone.includes(q);
      const matchWilaya = o.customer.wilaya.toLowerCase().includes(q);
      if (!matchNum && !matchName && !matchPhone && !matchWilaya) return false;
    }
    return true;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  const getAdminWhatsAppUrl = (order: Order) => {
    const rawPhone = order.customer.phone.replace(/\D/g, '');
    const cleanPhone = rawPhone.startsWith('216') ? rawPhone : `216${rawPhone}`;

    const msg = `Bonjour ${order.customer.name}, nous faisons suite à votre commande ${order.orderNumber} sur Amino-Shoes. Total: ${order.total} DT.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900">Gestion des Commandes ({filteredOrders.length})</h2>
            <p className="text-xs text-slate-500 font-medium">
              Suivez et mettez à jour l'état de livraison des commandes clients.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Rechercher N° commande, nom, tél..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {statusOptions.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                selectedStatus === st
                  ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">N° Commande</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Montant</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-extrabold text-blue-600">{o.orderNumber}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {o.customer.name}
                      <span className="block text-slate-400 text-[10px] font-normal">{o.customer.phone}</span>
                    </td>
                    <td className="py-3 px-4">
                      {o.customer.wilaya}
                      <span className="block text-slate-400 text-[10px]">{o.customer.delegation}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          o.deliveryMethod === 'delivery'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {o.deliveryMethod === 'delivery' ? 'Domicile' : 'Retrait'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-slate-900">{o.total} DT</td>
                    <td className="py-3 px-4">
                      <select
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-hidden cursor-pointer"
                      >
                        <option value="Nouvelle">Nouvelle</option>
                        <option value="Confirmée">Confirmée</option>
                        <option value="En préparation">En préparation</option>
                        <option value="Expédiée">Expédiée</option>
                        <option value="Livrée">Livrée</option>
                        <option value="Annulée">Annulée</option>
                        <option value="Retournée">Retournée</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <a
                        href={getAdminWhatsAppUrl(o)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors"
                        title="Contacter sur WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-600 transition-colors"
                        title="Détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs">
          <div className="min-h-full flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold text-slate-400 block">Détails Commande</span>
                <h3 className="text-xl font-black text-blue-600">{selectedOrder.orderNumber}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Box */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2 text-slate-800">
              <span className="font-extrabold text-slate-900 block uppercase tracking-wider text-[11px]">
                Informations Destinataire
              </span>
              <div className="grid grid-cols-2 gap-2">
                <p>
                  <strong>Client:</strong> {selectedOrder.customer.name}
                </p>
                <p>
                  <strong>Téléphone:</strong> {selectedOrder.customer.phone}{' '}
                  {selectedOrder.customer.phone2 ? `/ ${selectedOrder.customer.phone2}` : ''}
                </p>
                <p>
                  <strong>Wilaya:</strong> {selectedOrder.customer.wilaya}
                </p>
                <p>
                  <strong>Délégation:</strong> {selectedOrder.customer.delegation}
                </p>
                <p className="col-span-2">
                  <strong>Adresse:</strong> {selectedOrder.customer.address}
                </p>
                {selectedOrder.customer.extraInfo && (
                  <p className="col-span-2 text-slate-500 italic">
                    <strong>Info supp:</strong> {selectedOrder.customer.extraInfo}
                  </p>
                )}
              </div>
            </div>

            {/* Items Breakdown */}
            <div className="space-y-3">
              <span className="font-black text-slate-900 text-xs uppercase tracking-wider block">
                Articles Commandés
              </span>
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-1">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 border"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{item.productName}</span>
                        <span className="text-slate-500">
                          Pointure: <strong className="text-blue-600">{item.size}</strong> • Qté: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900">{item.totalPrice} DT</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-baseline text-xs">
              <div>
                <span>Mode: <strong>{selectedOrder.deliveryMethod === 'delivery' ? 'Livraison 8 DT' : 'Retrait 0 DT'}</strong></span>
                {selectedOrder.promoCode && <span className="block text-emerald-600 font-bold">Code Promo: {selectedOrder.promoCode} (-{selectedOrder.discount} DT)</span>}
              </div>
              <span className="text-xl font-black text-blue-600">Total: {selectedOrder.total} DT</span>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <a
                href={getAdminWhatsAppUrl(selectedOrder)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs inline-flex items-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Contacter le client sur WhatsApp</span>
              </a>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
          </div>
        </div>
      )}
    </div>
  );
};
