import React, { useState } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  PackageCheck,
  Tag,
  BarChart3,
  Truck,
  Settings,
  LogOut,
  Bell,
  ArrowLeft,
  RotateCcw,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Order, StoreSettings } from '../../types';

interface AdminLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  orders: Order[];
  onMarkOrdersRead: () => void;
  onExitAdmin: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  setActiveTab,
  orders,
  onMarkOrdersRead,
  onExitAdmin,
  children
}) => {
  const { user, logoutAdmin } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadOrders = orders.filter((o) => !o.isRead);

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'products', label: 'Produits', icon: ShoppingBag },
    { id: 'categories', label: 'Catégories & Marques', icon: Layers },
    { id: 'orders', label: 'Commandes', icon: PackageCheck, badge: unreadOrders.length },
    { id: 'returns', label: 'Retours', icon: RotateCcw },
    { id: 'promotions', label: 'Promotions', icon: Tag },
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'manual_revenue', label: 'Revenu Manuel', icon: DollarSign },
    { id: 'delivery', label: 'Livraison', icon: Truck },
    { id: 'customization', label: 'Magasin & Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen md:h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="w-full md:w-64 md:h-screen md:overflow-y-auto bg-slate-900 text-white flex-shrink-0 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-700 bg-white p-0.5 shrink-0 flex items-center justify-center">
                <img
                  src="/logo.jpg"
                  alt="AMINO-SHOES Admin"
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-black text-sm block leading-tight">AMINO-SHOES</span>
                <span className="text-[10px] text-blue-400 font-bold block uppercase">Admin Panel</span>
              </div>
            </div>

            <button
              onClick={onExitAdmin}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Retour à la boutique"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {user?.email || 'amineadem@gmail.com'}
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold block">En ligne</span>
            </div>
            <button
              onClick={logoutAdmin}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:overflow-hidden">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-900 capitalize">
              {menuItems.find((m) => m.id === activeTab)?.label || 'Administration'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (unreadOrders.length > 0) onMarkOrdersRead();
                }}
                className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadOrders.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center border-2 border-white animate-pulse">
                    {unreadOrders.length}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 space-y-3 z-50">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-900">Notifications</span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {unreadOrders.length} nouvelle(s) commande(s)
                    </span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {unreadOrders.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">
                        Aucune nouvelle notification
                      </p>
                    ) : (
                      unreadOrders.map((o) => (
                        <div
                          key={o.id}
                          onClick={() => {
                            setActiveTab('orders');
                            setShowNotifications(false);
                          }}
                          className="p-2.5 rounded-xl bg-blue-50/60 hover:bg-blue-100/80 cursor-pointer transition-colors space-y-1 border border-blue-100"
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                            <span>🔔 Nouvelle commande {o.orderNumber}</span>
                            <span className="text-blue-600">{o.total} DT</span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-1">
                            {o.customer.name} • {o.customer.wilaya}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={onExitAdmin}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Voir la boutique</span>
            </button>
          </div>
        </header>

        {/* Body View */}
        <main className="flex-1 md:overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
};
