export type Language = 'fr' | 'derja';

export type ProductBadge = 'Nouveau' | 'Promotion' | 'Meilleure vente' | 'Épuisé';

export interface SizeStock {
  size: string; // e.g. "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  price: number;
  promoPrice?: number; // Optional discounted price
  images: string[];
  videos?: string[]; // Optional video URLs or data URLs
  sizes: SizeStock[];
  isNew?: boolean;
  isBestSeller?: boolean;
  isPromo?: boolean;
  published: boolean;
  createdAt: string;
  updatedAt?: string;
  salesCount?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  order?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

export type DeliveryMethod = 'delivery' | 'pickup';

export type OrderStatus =
  | 'Nouvelle'
  | 'Confirmée'
  | 'En préparation'
  | 'Expédiée'
  | 'Livrée'
  | 'Annulée'
  | 'Retournée';

export interface CustomerInfo {
  name: string;
  phone: string;
  phone2?: string;
  email?: string;
  wilaya: string;
  delegation: string;
  address: string;
  extraInfo?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. #AMN-1048
  customer: CustomerInfo;
  items: {
    productId: string;
    productName: string;
    brandName: string;
    image: string;
    size: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }[];
  deliveryMethod: DeliveryMethod;
  deliveryFee: number;
  subtotal: number;
  promoCode?: string;
  discount: number;
  total: number;
  status: OrderStatus;
  isRead: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Promotion {
  id: string;
  code: string; // e.g. AMINO10
  discountPercent: number; // e.g. 10
  startDate: string;
  endDate: string;
  minOrderAmount?: number;
  usageLimit?: number;
  timesUsed: number;
  isActive: boolean;
  createdAt: string;
}

export interface OrderReturn {
  id: string;
  orderNumber: string;
  productName: string;
  size: string;
  reason: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface ManualRevenue {
  id: string;
  amount: number;
  date: string;
  reason: string;
  notes?: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  logoUrl?: string;
  slogan: string;
  email: string;
  phone1: string; // +216 90410540
  phone2: string; // +216 90042240
  tiktokUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  googleMapsUrl: string;
  address: string;
  openingHours: string;
  deliveryFee: number; // 8 DT
  deliveryCompany: string; // Leader Ecom
  deliveryTimeframe: string; // 48 heures à 6 jours
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  showNouveautes: boolean;
  showBestSellers: boolean;
  showPromotions: boolean;
  showCommander3Clicks: boolean;
  showWholesale: boolean;
}

// 24 Tunisian Wilayas (Governorates)
export const TUNISIAN_WILAYAS = [
  'Ariana',
  'Béja',
  'Ben Arous',
  'Bizerte',
  'Gabès',
  'Gafsa',
  'Jendouba',
  'Kairouan',
  'Kasserine',
  'Kébili',
  'Le Kef',
  'Mahdia',
  'La Manouba',
  'Médenine',
  'Monastir',
  'Nabeul',
  'Sfax',
  'Sidi Bouzid',
  'Siliana',
  'Sousse',
  'Tataouine',
  'Tozeur',
  'Tunis',
  'Zaghouan'
];
