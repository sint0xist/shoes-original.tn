import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Check, Search, RotateCcw } from 'lucide-react';
import { Product, Category, Brand } from '../types';
import { ProductCard } from './ProductCard';
import { useLanguage } from '../context/LanguageContext';
import { sortSizeLabels } from '../lib/sizeUtils';

interface CatalogViewProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  initialTab?: string;
  initialBrand?: string | null;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  selectedCategory?: string | null;
  setSelectedCategory?: (catId: string | null) => void;
  onSelectProduct?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  categories,
  brands,
  initialTab,
  initialBrand,
  searchQuery: searchQueryProp,
  setSearchQuery: setSearchQueryProp,
  selectedCategory: selectedCategoryProp,
  setSelectedCategory: setSelectedCategoryProp,
  onSelectProduct,
  onProductClick
}) => {
  const { t } = useLanguage();

  // Internal category state if not controlled externally
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<string | null>(null);
  const selectedCategory = selectedCategoryProp !== undefined ? selectedCategoryProp : internalSelectedCategory;

  const handleSetSelectedCategory = (catId: string | null) => {
    if (typeof setSelectedCategoryProp === 'function') {
      setSelectedCategoryProp(catId);
    } else {
      setInternalSelectedCategory(catId);
    }
  };

  // Internal search query state if not controlled externally
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const searchQuery = searchQueryProp !== undefined ? searchQueryProp : internalSearchQuery;

  const handleSetSearchQuery = (q: string) => {
    if (typeof setSearchQueryProp === 'function') {
      setSearchQueryProp(q);
    } else {
      setInternalSearchQuery(q);
    }
  };

  // Handle product click
  const handleSelectProduct = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else if (onProductClick) {
      onProductClick(product);
    }
  };

  const [selectedBrand, setSelectedBrand] = useState<string | null>(initialBrand ?? null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [onlyPromo, setOnlyPromo] = useState(initialTab === 'promotions');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<string>(initialTab === 'nouveautes' ? 'nouveautes' : 'pertinence');
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Closes the mobile filter drawer and scrolls back to the top of the results.
  // Without this, the page stayed at whatever scroll position it had before the
  // drawer opened, which could be past the end of a newly (shorter) filtered list —
  // making it look like the page "loads at the bottom" until you scroll up manually.
  const closeMobileFilter = () => {
    setMobileFilterOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Same problem also happens on desktop: picking a brand/size/etc. from the sidebar
  // filters doesn't open/close any drawer, so nothing used to reset the scroll position.
  // If the page was scrolled down when a filter was applied, the (now shorter) filtered
  // grid rendered below the current scroll position — looking like it "loads at the
  // bottom". Scroll back to the top whenever a discrete filter or the sort order changes.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedCategory, selectedBrand, selectedSize, onlyPromo, onlyInStock, sortBy]);

  // Available Sizes list — built dynamically from every size configured on any product
  // (so custom pointures added in l'admin, e.g. 46, 47, 43 1/2, 46 1/2, show up automatically here)
  const availableSizes = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((p) => p.sizes.forEach((s) => unique.add(s.size)));
    return sortSizeLabels(Array.from(unique));
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Published check
      if (!p.published) return false;

      // Category filter
      if (selectedCategory && p.categoryId !== selectedCategory && p.categoryName?.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }

      // Brand filter
      if (selectedBrand && p.brandId !== selectedBrand && p.brandName !== selectedBrand) {
        return false;
      }

      // Size filter
      if (selectedSize) {
        const hasSize = p.sizes.some((s) => s.size === selectedSize && s.stock > 0);
        if (!hasSize) return false;
      }

      // Promo filter
      if (onlyPromo && (!p.promoPrice || p.promoPrice >= p.price)) {
        return false;
      }

      // In Stock filter
      if (onlyInStock) {
        const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
        if (totalStock <= 0) return false;
      }

      // Price filter
      const effectivePrice = p.promoPrice || p.price;
      if (effectivePrice > maxPrice) return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchBrand = p.brandName.toLowerCase().includes(q);
        const matchCat = p.categoryName.toLowerCase().includes(q);
        const matchDesc = p.description?.toLowerCase().includes(q) || false;
        if (!matchName && !matchBrand && !matchCat && !matchDesc) return false;
      }

      return true;
    }).sort((a, b) => {
      const priceA = a.promoPrice || a.price;
      const priceB = b.promoPrice || b.price;

      if (sortBy === 'nouveautes') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'price_asc') {
        return priceA - priceB;
      }
      if (sortBy === 'price_desc') {
        return priceB - priceA;
      }
      if (sortBy === 'bestsellers') {
        return (b.salesCount || 0) - (a.salesCount || 0);
      }
      return 0; // Pertinence
    });
  }, [products, selectedCategory, selectedBrand, selectedSize, onlyPromo, onlyInStock, maxPrice, searchQuery, sortBy]);

  const resetFilters = () => {
    handleSetSelectedCategory(null);
    setSelectedBrand(null);
    setSelectedSize(null);
    setOnlyPromo(false);
    setOnlyInStock(false);
    setMaxPrice(3000);
    handleSetSearchQuery('');
  };

  const hasActiveFilters =
    selectedCategory !== null ||
    selectedBrand !== null ||
    selectedSize !== null ||
    onlyPromo ||
    onlyInStock ||
    maxPrice < 3000 ||
    searchQuery.length > 0;

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Catalog Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Catalogue Amino-Shoes
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {searchQuery
                  ? t('products_count', { count: filteredProducts.length })
                  : `${filteredProducts.length} modèles originaux en stock`}
              </p>
            </div>

            {/* Top Bar Sort & Mobile Filter Trigger */}
            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle Button */}
              <button
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filtres</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-2 rounded-xl text-xs font-bold text-slate-700">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>{t('sort_by')}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent font-extrabold text-blue-600 focus:outline-hidden cursor-pointer"
                >
                  <option value="pertinence">{t('relevance')}</option>
                  <option value="nouveautes">{t('new_arrivals')}</option>
                  <option value="price_asc">{t('price_asc')}</option>
                  <option value="price_desc">{t('price_desc')}</option>
                  <option value="bestsellers">{t('best_sellers')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 pt-2 scrollbar-none">
            <button
              onClick={() => handleSetSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                selectedCategory === null
                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              Tous les produits
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSetSelectedCategory(cat.id === selectedCategory ? null : cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Grid: Left Filters Sidebar (Desktop) + Right Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sidebar Filters (Desktop) */}
          <div className="hidden lg:block lg:col-span-3 space-y-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Filtres de recherche
              </span>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Réinitialiser
                </button>
              )}
            </div>

            {/* Brand Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Marque
              </label>
              <select
                value={selectedBrand || ''}
                onChange={(e) => setSelectedBrand(e.target.value || null)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="">Toutes les marques</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Size Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Pointure
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {availableSizes.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(selectedSize === sz ? null : sz)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                      selectedSize === sz
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Max Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Prix max:</span>
                <span className="text-blue-600 font-extrabold">{maxPrice} DT</span>
              </div>
              <input
                type="range"
                min="20"
                max="3000"
                step="20"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyPromo}
                  onChange={(e) => setOnlyPromo(e.target.checked)}
                  className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>En Promotion uniquement</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={onlyInStock}
                  onChange={(e) => setOnlyInStock(e.target.checked)}
                  className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>En Stock uniquement</span>
              </label>
            </div>
          </div>

          {/* Right Product Grid */}
          <div className="col-span-1 lg:col-span-9 space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Aucun produit trouvé
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                  Essayez de modifier vos critères de recherche ou de réinitialiser vos filtres.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-extrabold hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onSelectProduct={handleSelectProduct}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal Overlay */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-xs bg-white h-full p-6 flex flex-col justify-between overflow-y-auto space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                  Filtres de recherche
                </span>
                <button
                  onClick={closeMobileFilter}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Brand Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Marque
                </label>
                <select
                  value={selectedBrand || ''}
                  onChange={(e) => setSelectedBrand(e.target.value || null)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs font-semibold focus:bg-white focus:outline-hidden"
                >
                  <option value="">Toutes les marques</option>
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Size Filter */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Pointure
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {availableSizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(selectedSize === sz ? null : sz)}
                      className={`py-2 rounded-lg text-xs font-bold border transition-colors ${
                        selectedSize === sz
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Max Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Prix max:</span>
                  <span className="text-blue-600 font-extrabold">{maxPrice} DT</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="3000"
                  step="20"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyPromo}
                    onChange={(e) => setOnlyPromo(e.target.checked)}
                    className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>En Promotion uniquement</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>En Stock uniquement</span>
                </label>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-100">
              <button
                onClick={closeMobileFilter}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-extrabold text-xs text-center shadow-xs"
              >
                Voir {filteredProducts.length} résultat(s)
              </button>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="w-full py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs text-center hover:bg-slate-200"
                >
                  Réinitialiser tous les filtres
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
