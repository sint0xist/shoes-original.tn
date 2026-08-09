import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CommanderIn3Clicks } from './components/CommanderIn3Clicks';
import { ProductCard } from './components/ProductCard';
import { ProductGridSection } from './components/ProductGridSection';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CatalogView } from './components/CatalogView';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WholesaleSection } from './components/WholesaleSection';
import { Footer } from './components/Footer';
import { FloatingWhatsapp } from './components/FloatingWhatsapp';
import { LegalPageModal } from './components/LegalPageModal';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { AdminDashboardView } from './components/admin/AdminDashboardView';
import { AdminProductsView } from './components/admin/AdminProductsView';
import { AdminCategoriesBrandsView } from './components/admin/AdminCategoriesBrandsView';
import { AdminOrdersView } from './components/admin/AdminOrdersView';
import { AdminReturnsView } from './components/admin/AdminReturnsView';
import { AdminPromotionsView } from './components/admin/AdminPromotionsView';
import { AdminStatisticsView } from './components/admin/AdminStatisticsView';
import { AdminManualRevenueView } from './components/admin/AdminManualRevenueView';
import { AdminDeliveryView } from './components/admin/AdminDeliveryView';
import { AdminStoreCustomizationView } from './components/admin/AdminStoreCustomizationView';

// Store Services
import {
  subscribeProducts,
  subscribeCategories,
  subscribeBrands,
  subscribePromotions,
  subscribeOrders,
  subscribeReturns,
  subscribeManualRevenues,
  subscribeStoreSettings,
  seedDatabaseIfEmpty,
  markOrdersAsRead,
  DEFAULT_STORE_SETTINGS
} from './services/storeService';
import {
  Product,
  Category,
  Brand,
  Promotion,
  Order,
  OrderReturn,
  ManualRevenue,
  StoreSettings
} from './types';

function MainApp() {
  const { t } = useLanguage();
  const { isCartOpen, setIsCartOpen, isCheckoutOpen, setIsCheckoutOpen } = useCart();
  const { user, isAdmin, loading: authLoading, logoutAdmin } = useAuth();

  // App Routing State - Derived synchronously from URL
  const getInitialPath = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (hash === '#admin' || hash === '#/admin') return '/admin';
      return path;
    }
    return '/accueil';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath);
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [legalModalType, setLegalModalType] = useState<string | null>(null);

  // Firestore Realtime Data
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<OrderReturn[]>([]);
  const [manualRevenues, setManualRevenues] = useState<ManualRevenue[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);

  // Admin Sub-tab
  const [adminTab, setAdminTab] = useState('dashboard');

  const isAdminRoute =
    currentPath === '/admin' ||
    currentPath === '/admin/' ||
    currentPath.startsWith('/admin/');

  // Clean URL and navigate to home (/accueil)
  const cleanUrlToHome = () => {
    setActiveTab('home');
    setCurrentPath('/accueil');
    try {
      if (window.location.pathname !== '/accueil') {
        window.history.pushState({}, '', '/accueil');
      }
    } catch (e) {
      console.warn('URL rewrite failed:', e);
    }
  };

  const handleTabChange = (tab: string) => {
    if (tab === 'admin') {
      setCurrentPath('/admin');
      try {
        if (window.location.pathname !== '/admin') {
          window.history.pushState({}, '', '/admin');
        }
      } catch (e) {
        console.warn('URL rewrite failed:', e);
      }
    } else {
      setActiveTab(tab);
      const targetPath = tab === 'home' ? '/accueil' : `/${tab}`;
      setCurrentPath(targetPath);
      try {
        if (window.location.pathname !== targetPath) {
          window.history.pushState({}, '', targetPath);
        }
      } catch (e) {
        console.warn('URL rewrite failed:', e);
      }
    }
  };

  // URL listener: sync currentPath on popstate and hashchange
  useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      let effectivePath = path;
      if (hash === '#admin' || hash === '#/admin') {
        effectivePath = '/admin';
      }

      if (effectivePath === '/' || effectivePath === '' || effectivePath === '/index.html') {
        effectivePath = '/accueil';
        try {
          window.history.replaceState({}, '', '/accueil');
        } catch (e) {
          console.warn('URL rewrite failed:', e);
        }
      }

      setCurrentPath(effectivePath);
      if (effectivePath !== '/admin' && effectivePath !== '/admin/') {
        const tabName = effectivePath.startsWith('/') ? effectivePath.slice(1) : effectivePath;
        if (tabName && tabName !== 'accueil') {
          setActiveTab(tabName);
        } else {
          setActiveTab('home');
        }
      }
    };

    syncRoute();

    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, []);

  // Load Realtime Firestore Data & Initial Seed
  useEffect(() => {
    seedDatabaseIfEmpty();

    const unsubProducts = subscribeProducts((data) => setProducts(data));
    const unsubCat = subscribeCategories((data) => setCategories(data));
    const unsubBrands = subscribeBrands((data) => setBrands(data));
    const unsubPromo = subscribePromotions((data) => setPromotions(data));
    const unsubSettings = subscribeStoreSettings((data) => setSettings(data));

    let unsubOrders = () => {};
    let unsubReturns = () => {};
    let unsubRevenues = () => {};

    if (isAdmin) {
      unsubOrders = subscribeOrders((data) => setOrders(data));
      unsubReturns = subscribeReturns((data) => setReturns(data));
      unsubRevenues = subscribeManualRevenues((data) => setManualRevenues(data));
    }

    return () => {
      unsubProducts();
      unsubCat();
      unsubBrands();
      unsubPromo();
      unsubSettings();
      unsubOrders();
      unsubReturns();
      unsubRevenues();
    };
  }, [isAdmin]);

  // Filtered views
  const publishedProducts = products.filter((p) => p.published);
  const newArrivals = publishedProducts.filter((p) => p.isNew);
  const bestSellers = publishedProducts.filter((p) => p.isBestSeller);
  const promoProducts = publishedProducts.filter(
    (p) => p.isPromo || (p.promoPrice && p.promoPrice < p.price)
  );

  const handleMarkOrdersRead = async () => {
    const unreadIds = orders.filter((o) => !o.isRead).map((o) => o.id);
    if (unreadIds.length > 0) {
      await markOrdersAsRead(unreadIds);
    }
  };

  // Render Admin Layout if in Admin Route
  if (isAdminRoute) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-400">Vérification de l'accès Administrateur...</span>
          </div>
        </div>
      );
    }

    if (!isAdmin) {
      if (user) {
        return (
          <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto font-black text-xl">
                ✕
              </div>
              <h2 className="text-xl font-black text-slate-900">Accès Refusé</h2>
              <p className="text-xs font-medium text-slate-600">
                Vous êtes connecté avec <span className="font-bold text-slate-900">{user.email || user.uid}</span>, mais ce compte n'a pas les droits d'administration.
              </p>
              <div className="pt-2 space-y-2">
                <button
                  onClick={logoutAdmin}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer"
                >
                  Se déconnecter
                </button>
                <button
                  onClick={cleanUrlToHome}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md cursor-pointer"
                >
                  Retour au Magasin (Accueil)
                </button>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <AdminLoginModal isEmbedded onClose={cleanUrlToHome} />
        </div>
      );
    }

    return (
      <AdminLayout
        activeTab={adminTab}
        setActiveTab={setAdminTab}
        orders={orders}
        onMarkOrdersRead={handleMarkOrdersRead}
        onExitAdmin={() => {
          cleanUrlToHome();
        }}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboardView
            products={products}
            orders={orders}
            returns={returns}
            onNavigate={(tab) => setAdminTab(tab)}
          />
        )}
        {adminTab === 'products' && (
          <AdminProductsView products={products} categories={categories} brands={brands} />
        )}
        {adminTab === 'categories' && (
          <AdminCategoriesBrandsView categories={categories} brands={brands} />
        )}
        {adminTab === 'orders' && <AdminOrdersView orders={orders} settings={settings} />}
        {adminTab === 'returns' && <AdminReturnsView returns={returns} />}
        {adminTab === 'promotions' && <AdminPromotionsView promotions={promotions} />}
        {adminTab === 'stats' && (
          <AdminStatisticsView products={products} orders={orders} returns={returns} />
        )}
        {adminTab === 'manual_revenue' && (
          <AdminManualRevenueView manualRevenues={manualRevenues} />
        )}
        {adminTab === 'delivery' && <AdminDeliveryView settings={settings} />}
        {adminTab === 'customization' && <AdminStoreCustomizationView settings={settings} />}
      </AdminLayout>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* Main Header */}
      <Header
        settings={settings}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Body Routing */}
      <main className="pb-20">
        {activeTab === 'home' && (
          <div className="space-y-16">
            {/* Hero Banner */}
            <Hero
              settings={settings}
              onExploreCatalog={() => setActiveTab('catalog')}
              onQuickOrderClick={() => setActiveTab('catalog')}
            />

            {/* Commander en 3 Clics Explanation */}
            {settings.showCommander3Clicks && <CommanderIn3Clicks />}

            {/* Nouveautés Section */}
            {settings.showNouveautes && newArrivals.length > 0 && (
              <ProductGridSection
                title={t('new_arrivals')}
                subtitle="Derniers arrivages de baskets 100% originales en Tunisie."
                iconType="new"
                products={newArrivals}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onProductClick={(p) => setSelectedProduct(p)}
              />
            )}

            {/* Meilleures Ventes Section */}
            {settings.showBestSellers && bestSellers.length > 0 && (
              <ProductGridSection
                title={t('bestsellers')}
                subtitle="Les modèles les plus demandés par nos clients."
                iconType="bestseller"
                products={bestSellers}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onProductClick={(p) => setSelectedProduct(p)}
              />
            )}

            {/* Promotions Section */}
            {settings.showPromotions && promoProducts.length > 0 && (
              <ProductGridSection
                title={t('promotions')}
                subtitle="Profitez de réductions exclusives sur une sélection de paires."
                iconType="promo"
                products={promoProducts}
                onSelectProduct={(p) => setSelectedProduct(p)}
                onProductClick={(p) => setSelectedProduct(p)}
              />
            )}

            {/* Brands Showcase Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="text-center space-y-2">
                <span className="text-xs font-black text-blue-600 uppercase tracking-widest">
                  {t('brands')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                  Marques Originales Disponibles
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {brands.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      setActiveTab('catalog');
                    }}
                    className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 cursor-pointer text-center space-y-2 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-white font-black text-lg flex items-center justify-center mx-auto group-hover:bg-blue-600 transition-colors">
                      {b.name.charAt(0)}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm">{b.name}</h3>
                  </div>
                ))}
              </div>
            </section>

            {/* Wholesale Info */}
            {settings.showWholesale && <WholesaleSection settings={settings} />}
          </div>
        )}

        {/* Full Catalog Page */}
        {(activeTab === 'catalog' ||
          activeTab === 'nouveautes' ||
          activeTab === 'promotions' ||
          activeTab === 'marques') && (
          <CatalogView
            products={publishedProducts}
            categories={categories}
            brands={brands}
            initialTab={activeTab}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onProductClick={(p) => setSelectedProduct(p)}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        settings={settings}
        onNavigate={(tab) => handleTabChange(tab)}
        onOpenLegal={(type) => setLegalModalType(type)}
      />

      {/* Floating WhatsApp Quick Chat */}
      <FloatingWhatsapp settings={settings} />

      {/* Product Quick View / Select Size Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onOpenCheckout={() => {
            setSelectedProduct(null);
            setIsCheckoutOpen(true);
          }}
        />
      )}

      {/* Cart Drawer Slide-Over */}
      <CartDrawer
        settings={settings}
        promotions={promotions}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <CheckoutModal
          settings={settings}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}

      {/* Legal & Informations Modal */}
      <LegalPageModal
        type={legalModalType}
        settings={settings}
        onClose={() => setLegalModalType(null)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </CartProvider>
    </LanguageProvider>
  );
}
