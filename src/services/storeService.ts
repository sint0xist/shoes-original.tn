import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import {
  Product,
  Category,
  Brand,
  Order,
  Promotion,
  OrderReturn,
  ManualRevenue,
  StoreSettings,
  OrderStatus,
  CustomerInfo,
  DeliveryMethod
} from '../types';
export { DEFAULT_STORE_SETTINGS } from '../lib/initialData';
import {
  INITIAL_CATEGORIES,
  INITIAL_BRANDS,
  DEFAULT_STORE_SETTINGS,
  INITIAL_PROMOTIONS,
  SAMPLE_PRODUCTS
} from '../lib/initialData';

const PRODUCTS_COL = 'products';
const CATEGORIES_COL = 'categories';
const BRANDS_COL = 'brands';
const ORDERS_COL = 'orders';
const PROMOTIONS_COL = 'promotions';
const RETURNS_COL = 'returns';
const MANUAL_REVENUE_COL = 'manual_revenues';
const SETTINGS_COL = 'settings';
const STORE_SETTINGS_DOC = 'store';

// Helper to strip undefined values so Firestore does not throw errors
function cleanData<T extends Record<string, any>>(obj: T): T {
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        result[key] = cleanData(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// Auto-seed Firestore if empty
export async function seedDatabaseIfEmpty(): Promise<boolean> {
  try {
    const seedCheckDoc = await getDoc(doc(db, SETTINGS_COL, 'store_seeded'));
    if (seedCheckDoc.exists()) {
      return false; // Already seeded in the past
    }

    const productsSnap = await getDocs(collection(db, PRODUCTS_COL));
    if (!productsSnap.empty) {
      await setDoc(doc(db, SETTINGS_COL, 'store_seeded'), { seededAt: new Date().toISOString() });
      return false; // Already populated
    }

    const batch = writeBatch(db);

    // Seed Categories
    INITIAL_CATEGORIES.forEach((cat) => {
      batch.set(doc(db, CATEGORIES_COL, cat.id), cleanData(cat));
    });

    // Seed Brands
    INITIAL_BRANDS.forEach((brand) => {
      batch.set(doc(db, BRANDS_COL, brand.id), cleanData(brand));
    });

    // Seed Store Settings
    batch.set(doc(db, SETTINGS_COL, STORE_SETTINGS_DOC), cleanData(DEFAULT_STORE_SETTINGS));

    // Seed Promotions
    INITIAL_PROMOTIONS.forEach((promo) => {
      batch.set(doc(db, PROMOTIONS_COL, promo.id), cleanData(promo));
    });

    // Seed Products
    SAMPLE_PRODUCTS.forEach((prod) => {
      const pDoc = doc(collection(db, PRODUCTS_COL));
      batch.set(pDoc, cleanData({
        ...prod,
        id: pDoc.id
      }));
    });

    batch.set(doc(db, SETTINGS_COL, 'store_seeded'), { seededAt: new Date().toISOString() });

    await batch.commit();
    console.log('Database successfully seeded with initial Amino-Shoes data!');
    return true;
  } catch (err) {
    console.warn('Unable to seed database:', err);
    return false;
  }
}

// Store Settings
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const d = await getDoc(doc(db, SETTINGS_COL, STORE_SETTINGS_DOC));
    if (d.exists()) {
      return { ...DEFAULT_STORE_SETTINGS, ...d.data() } as StoreSettings;
    }
  } catch (err) {
    console.error('Error getting settings:', err);
  }
  return DEFAULT_STORE_SETTINGS;
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<void> {
  const ref = doc(db, SETTINGS_COL, STORE_SETTINGS_DOC);
  await setDoc(ref, cleanData(settings), { merge: true });
}

export function subscribeStoreSettings(callback: (settings: StoreSettings) => void) {
  return onSnapshot(
    doc(db, SETTINGS_COL, STORE_SETTINGS_DOC),
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (!data.address || data.address.includes('Liberté') || data.address.includes('Tunis, Tunisie')) {
          data.address = DEFAULT_STORE_SETTINGS.address;
          data.googleMapsUrl = DEFAULT_STORE_SETTINGS.googleMapsUrl;
          updateStoreSettings({ address: data.address, googleMapsUrl: data.googleMapsUrl }).catch(() => {});
        }
        callback({ ...DEFAULT_STORE_SETTINGS, ...data } as StoreSettings);
      } else {
        callback(DEFAULT_STORE_SETTINGS);
      }
    },
    (error) => {
      console.warn('Store settings snapshot error:', error.message);
    }
  );
}

// Products
export function subscribeProducts(callback: (products: Product[]) => void) {
  return onSnapshot(
    collection(db, PRODUCTS_COL),
    (snapshot) => {
      const prods = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Product));
      callback(prods);
    },
    (error) => {
      console.warn('Products snapshot error:', error.message);
    }
  );
}

export async function addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, PRODUCTS_COL), cleanData({
    ...product,
    createdAt: new Date().toISOString()
  }));
  return ref.id;
}

export async function updateProduct(id: string, updates: Partial<Product>): Promise<void> {
  await updateDoc(doc(db, PRODUCTS_COL, id), cleanData({
    ...updates,
    updatedAt: new Date().toISOString()
  }));
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, PRODUCTS_COL, id));
}

// Categories
export function subscribeCategories(callback: (categories: Category[]) => void) {
  return onSnapshot(
    collection(db, CATEGORIES_COL),
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Category));
      items.sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(items);
    },
    (error) => {
      console.warn('Categories snapshot error:', error.message);
    }
  );
}

export async function addCategory(category: Omit<Category, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, CATEGORIES_COL), cleanData(category));
  return ref.id;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  await updateDoc(doc(db, CATEGORIES_COL, id), cleanData(updates));
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db, CATEGORIES_COL, id));
}

// Brands
export function subscribeBrands(callback: (brands: Brand[]) => void) {
  return onSnapshot(
    collection(db, BRANDS_COL),
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Brand));
      callback(items);
    },
    (error) => {
      console.warn('Brands snapshot error:', error.message);
    }
  );
}

export async function addBrand(brand: Omit<Brand, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, BRANDS_COL), cleanData(brand));
  return ref.id;
}

export async function updateBrand(id: string, updates: Partial<Brand>): Promise<void> {
  await updateDoc(doc(db, BRANDS_COL, id), cleanData(updates));
}

export async function deleteBrand(id: string): Promise<void> {
  await deleteDoc(doc(db, BRANDS_COL, id));
}

// Orders
export function subscribeOrders(callback: (orders: Order[]) => void) {
  return onSnapshot(
    collection(db, ORDERS_COL),
    (snapshot) => {
      const orders = snapshot.docs.map((d) => ({ ...d.data(), id: d.id } as Order));
      orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(orders);
    },
    (error) => {
      console.warn('Orders snapshot error:', error.message);
    }
  );
}

export interface CreateOrderParams {
  customer: CustomerInfo;
  deliveryMethod: DeliveryMethod;
  promoCode?: string;
  items: Array<{
    productId: string;
    size: number;
    quantity: number;
  }>;
}

export async function createOrder(params: CreateOrderParams): Promise<Order> {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Impossible de créer la commande');
  }

  return data.order as Order;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, ORDERS_COL, id), {
    status,
    updatedAt: new Date().toISOString()
  });
}

export async function markOrdersAsRead(orderIds: string[]): Promise<void> {
  const batch = writeBatch(db);
  orderIds.forEach((id) => {
    batch.update(doc(db, ORDERS_COL, id), { isRead: true });
  });
  await batch.commit();
}

// Delete every document in a collection, in batches of 400 (Firestore batch limit is 500).
async function deleteAllDocsInCollection(colName: string): Promise<void> {
  const snap = await getDocs(collection(db, colName));
  const docs = snap.docs;
  for (let i = 0; i < docs.length; i += 400) {
    const batch = writeBatch(db);
    docs.slice(i, i + 400).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

// Danger zone: wipe all orders (resets "Chiffre d'affaires" and "Commandes" counters to 0)
export async function deleteAllOrders(): Promise<void> {
  await deleteAllDocsInCollection(ORDERS_COL);
}

// Danger zone: wipe all returns (resets "Retours" counter to 0)
export async function deleteAllReturns(): Promise<void> {
  await deleteAllDocsInCollection(RETURNS_COL);
}

// Danger zone: wipe all manual revenue entries
export async function deleteAllManualRevenues(): Promise<void> {
  await deleteAllDocsInCollection(MANUAL_REVENUE_COL);
}

// Resets all testing data at once: orders, returns and manual revenue entries.
export async function resetStoreStatistics(): Promise<void> {
  await Promise.all([deleteAllOrders(), deleteAllReturns(), deleteAllManualRevenues()]);
}

// Promotions
export function subscribePromotions(callback: (promos: Promotion[]) => void) {
  return onSnapshot(
    collection(db, PROMOTIONS_COL),
    (snapshot) => {
      const promos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Promotion));
      callback(promos);
    },
    (error) => {
      console.warn('Promotions snapshot error:', error.message);
    }
  );
}

export async function addPromotion(promo: Omit<Promotion, 'id' | 'timesUsed' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, PROMOTIONS_COL), cleanData({
    ...promo,
    timesUsed: 0,
    createdAt: new Date().toISOString()
  }));
  return ref.id;
}

export async function updatePromotion(id: string, updates: Partial<Promotion>): Promise<void> {
  await updateDoc(doc(db, PROMOTIONS_COL, id), cleanData(updates));
}

export async function deletePromotion(id: string): Promise<void> {
  await deleteDoc(doc(db, PROMOTIONS_COL, id));
}

export async function validatePromoCode(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discountPercent: number; message?: string }> {
  try {
    const q = query(
      collection(db, PROMOTIONS_COL),
      where('code', '==', code.trim().toUpperCase()),
      where('isActive', '==', true)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return { valid: false, discountPercent: 0, message: 'Code promotionnel invalide' };
    }

    const promo = snap.docs[0].data() as Promotion;
    const now = new Date().toISOString().split('T')[0];

    if (promo.startDate && now < promo.startDate) {
      return { valid: false, discountPercent: 0, message: 'Ce code n\'est pas encore actif' };
    }
    if (promo.endDate && now > promo.endDate) {
      return { valid: false, discountPercent: 0, message: 'Ce code promotionnel a expiré' };
    }
    if (promo.minOrderAmount && subtotal < promo.minOrderAmount) {
      return {
        valid: false,
        discountPercent: 0,
        message: `Montant minimum requis : ${promo.minOrderAmount} DT`
      };
    }
    if (promo.usageLimit && promo.timesUsed >= promo.usageLimit) {
      return { valid: false, discountPercent: 0, message: 'Limite d\'utilisation atteinte' };
    }

    return { valid: true, discountPercent: promo.discountPercent };
  } catch (err) {
    console.error('Promo code check error:', err);
    return { valid: false, discountPercent: 0, message: 'Erreur lors de la vérification du code' };
  }
}

// Returns
export function subscribeReturns(callback: (returns: OrderReturn[]) => void) {
  return onSnapshot(
    collection(db, RETURNS_COL),
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as OrderReturn));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (error) => {
      console.warn('Returns snapshot error:', error.message);
    }
  );
}

export async function addReturn(data: Omit<OrderReturn, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, RETURNS_COL), {
    ...data,
    createdAt: new Date().toISOString()
  });
  return ref.id;
}

// Manual Revenue Entries
export function subscribeManualRevenues(callback: (items: ManualRevenue[]) => void) {
  return onSnapshot(
    collection(db, MANUAL_REVENUE_COL),
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ManualRevenue));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (error) => {
      console.warn('Manual revenues snapshot error:', error.message);
    }
  );
}

export async function addManualRevenue(data: Omit<ManualRevenue, 'id' | 'createdAt'>): Promise<string> {
  const ref = await addDoc(collection(db, MANUAL_REVENUE_COL), {
    ...data,
    createdAt: new Date().toISOString()
  });
  return ref.id;
}
