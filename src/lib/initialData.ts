import { Product, Category, Brand, StoreSettings, Promotion } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-hommes', name: 'Hommes', slug: 'hommes', order: 1 },
  { id: 'cat-femmes', name: 'Femmes', slug: 'femmes', order: 2 },
  { id: 'cat-enfants', name: 'Enfants', slug: 'enfants', order: 3 },
  { id: 'cat-sport', name: 'Sport', slug: 'sport', order: 4 },
  { id: 'cat-casual', name: 'Casual', slug: 'casual', order: 5 },
];

export const INITIAL_BRANDS: Brand[] = [
  { id: 'brand-nike', name: 'Nike', slug: 'nike' },
  { id: 'brand-adidas', name: 'Adidas', slug: 'adidas' },
  { id: 'brand-puma', name: 'Puma', slug: 'puma' },
  { id: 'brand-nb', name: 'New Balance', slug: 'new-balance' },
  { id: 'brand-jordan', name: 'Jordan', slug: 'jordan' },
];

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Amino-Shoes',
  logoUrl: '/logo.jpg',
  slogan: 'Le meilleur rapport qualité-prix en Tunisie — 100% Original',
  email: 'amineadem@gmail.com',
  phone1: '+216 90410540',
  phone2: '+216 90042240',
  tiktokUrl: 'https://tiktok.com/@aminoshoes',
  instagramUrl: 'https://instagram.com/aminoshoes.tn',
  facebookUrl: 'https://facebook.com/aminoshoes.tn',
  googleMapsUrl: 'https://maps.google.com/?q=Hay+Tadhamen+Rue+De+Chorbane+2041',
  address: 'Hay Tadhamen, Rue De Chorbane, 2041',
  openingHours: 'Lun - Sam: 09:00 - 19:30',
  deliveryFee: 8,
  deliveryCompany: 'Leader Ecom',
  deliveryTimeframe: '48 heures à 6 jours',
  deliveryEnabled: true,
  pickupEnabled: true,
  heroTitle: 'Des chaussures originales. Des prix qui font la différence.',
  heroSubtitle: 'Le meilleur des marques 100% originales livrées directement chez vous ou à retirer en magasin.',
  heroImage: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=1200',
  showNouveautes: true,
  showBestSellers: true,
  showPromotions: true,
  showCommander3Clicks: true,
  showWholesale: true,
};

export const INITIAL_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-amino10',
    code: 'AMINO10',
    discountPercent: 10,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    minOrderAmount: 100,
    timesUsed: 0,
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

export const SAMPLE_PRODUCTS: Omit<Product, 'id'>[] = [
  {
    name: 'Nike Air Max 270 Black & Red',
    brandId: 'brand-nike',
    brandName: 'Nike',
    categoryId: 'cat-hommes',
    categoryName: 'Hommes',
    description: 'Baskets confortables avec unité Max Air 270 pour un amorti optimal au quotidien. Structure respirante et design agressif original.',
    price: 189,
    promoPrice: 149,
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: [
      { size: '40', stock: 2 },
      { size: '41', stock: 5 },
      { size: '42', stock: 7 },
      { size: '43', stock: 3 },
      { size: '44', stock: 0 }
    ],
    isNew: true,
    isBestSeller: true,
    isPromo: true,
    published: true,
    createdAt: new Date().toISOString(),
    salesCount: 34
  },
  {
    name: 'Adidas Ultraboost 1.0 Cloud White',
    brandId: 'brand-adidas',
    brandName: 'Adidas',
    categoryId: 'cat-sport',
    categoryName: 'Sport',
    description: 'La référence du running et du streetwear. Semelle Boost dynamique et tige Primeknit ultra douce.',
    price: 210,
    promoPrice: 179,
    images: [
      'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: [
      { size: '39', stock: 4 },
      { size: '40', stock: 6 },
      { size: '41', stock: 8 },
      { size: '42', stock: 4 },
      { size: '43', stock: 2 }
    ],
    isNew: true,
    isBestSeller: true,
    isPromo: true,
    published: true,
    createdAt: new Date().toISOString(),
    salesCount: 28
  },
  {
    name: 'New Balance 550 White Grey',
    brandId: 'brand-nb',
    brandName: 'New Balance',
    categoryId: 'cat-casual',
    categoryName: 'Casual',
    description: 'Silhouette rétro basketball emblématique des années 80. Cuir véritable de haute qualité et confort incomparable.',
    price: 195,
    images: [
      'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: [
      { size: '38', stock: 3 },
      { size: '39', stock: 5 },
      { size: '40', stock: 6 },
      { size: '41', stock: 9 },
      { size: '42', stock: 12 },
      { size: '43', stock: 4 }
    ],
    isNew: false,
    isBestSeller: true,
    isPromo: false,
    published: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    salesCount: 42
  },
  {
    name: 'Puma RS-X Triple Black',
    brandId: 'brand-puma',
    brandName: 'Puma',
    categoryId: 'cat-hommes',
    categoryName: 'Hommes',
    description: 'Design futuriste et volumineux avec amorti Running System breveté. Finitions impeccables et semelle épaisse.',
    price: 165,
    promoPrice: 129,
    images: [
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: [
      { size: '40', stock: 3 },
      { size: '41', stock: 5 },
      { size: '42', stock: 6 },
      { size: '43', stock: 0 }
    ],
    isNew: false,
    isBestSeller: false,
    isPromo: true,
    published: true,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    salesCount: 19
  },
  {
    name: 'Air Jordan 1 Retro High Chicago',
    brandId: 'brand-jordan',
    brandName: 'Jordan',
    categoryId: 'cat-hommes',
    categoryName: 'Hommes',
    description: 'Le classique légendaire en cuir rouge, blanc et noir. Matériaux premium et finitions soignées.',
    price: 249,
    images: [
      'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: [
      { size: '41', stock: 3 },
      { size: '42', stock: 4 },
      { size: '43', stock: 2 },
      { size: '44', stock: 1 }
    ],
    isNew: true,
    isBestSeller: true,
    isPromo: false,
    published: true,
    createdAt: new Date().toISOString(),
    salesCount: 31
  },
  {
    name: 'Nike Dunk Low Rose Whisper (Femme)',
    brandId: 'brand-nike',
    brandName: 'Nike',
    categoryId: 'cat-femmes',
    categoryName: 'Femmes',
    description: 'Couleurs douces et silhouette élégante. Idéale pour les tenues casual tendance et stylées.',
    price: 175,
    promoPrice: 139,
    images: [
      'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800'
    ],
    sizes: [
      { size: '36', stock: 4 },
      { size: '37', stock: 6 },
      { size: '38', stock: 8 },
      { size: '39', stock: 3 },
      { size: '40', stock: 0 }
    ],
    isNew: true,
    isBestSeller: true,
    isPromo: true,
    published: true,
    createdAt: new Date().toISOString(),
    salesCount: 25
  }
];
