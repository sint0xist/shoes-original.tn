import React from 'react';
import { ArrowRight, Sparkles, Flame, Tag } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { useLanguage } from '../context/LanguageContext';

interface ProductGridSectionProps {
  title: string;
  subtitle?: string;
  iconType?: 'new' | 'bestseller' | 'promo';
  products: Product[];
  onSelectProduct?: (product: Product) => void;
  onProductClick?: (product: Product) => void;
  onViewAll?: () => void;
}

export const ProductGridSection: React.FC<ProductGridSectionProps> = ({
  title,
  subtitle,
  iconType = 'new',
  products,
  onSelectProduct,
  onProductClick,
  onViewAll
}) => {
  const { t } = useLanguage();

  if (products.length === 0) return null;

  const renderIcon = () => {
    switch (iconType) {
      case 'new':
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'bestseller':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'promo':
        return <Tag className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <section className="py-10 border-b border-slate-100 last:border-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {renderIcon()}
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                {subtitle}
              </p>
            )}
          </div>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
            >
              <span>{t('discover_catalog')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelectProduct={onSelectProduct}
              onProductClick={onProductClick}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
