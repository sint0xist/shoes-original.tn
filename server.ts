import express from 'express';
import path from 'path';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  runTransaction
} from 'firebase/firestore';
import config from './firebase-applet-config.json' with { type: 'json' };

const SERVER_KEY = process.env.SERVER_KEY || 'AMINO_SECURE_SERVER_KEY_V2_89f3a21e4b9017c6d5e12a';

function generateOrderNumber(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomChars = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `#AMN-${dateStr}-${randomChars}`;
}

async function startServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '100kb' }));
  const PORT = 3000;

  // Rate limiter for checkout endpoint
  const checkoutLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 checkout requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Trop de tentatives de commande. Veuillez réessayer dans quelques minutes.' }
  });

  // Firebase initialization on server
  const fbApp = getApps().length === 0 ? initializeApp(config) : getApp();
  const db = getFirestore(fbApp, config.firestoreDatabaseId || undefined);

  // Authoritative Checkout API Endpoint
  app.post('/api/checkout', checkoutLimiter, async (req, res) => {
    try {
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ error: 'Données de commande invalides.' });
      }

      const { customer, deliveryMethod, promoCode, items } = req.body;

      // 1. Customer & Delivery Input Validation
      if (
        !customer ||
        typeof customer !== 'object' ||
        !customer.name || typeof customer.name !== 'string' || !customer.name.trim() || customer.name.length > 100 ||
        !customer.phone || typeof customer.phone !== 'string' || !customer.phone.trim() || customer.phone.length > 20 ||
        !customer.wilaya || typeof customer.wilaya !== 'string' || customer.wilaya.length > 50 ||
        !customer.delegation || typeof customer.delegation !== 'string' || !customer.delegation.trim() || customer.delegation.length > 100 ||
        !customer.address || typeof customer.address !== 'string' || !customer.address.trim() || customer.address.length > 200
      ) {
        return res
          .status(400)
          .json({ error: 'Veuillez remplir toutes les informations de livraison requises.' });
      }

      const phone2 = typeof customer.phone2 === 'string' ? customer.phone2.trim().slice(0, 20) : '';
      const email = typeof customer.email === 'string' ? customer.email.trim().slice(0, 100) : '';
      const extraInfo = typeof customer.extraInfo === 'string' ? customer.extraInfo.trim().slice(0, 300) : '';

      if (deliveryMethod !== 'delivery' && deliveryMethod !== 'pickup') {
        return res.status(400).json({ error: 'Mode de livraison invalide.' });
      }

      if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
        return res.status(400).json({ error: 'Votre panier est invalide ou contient trop d\'articles.' });
      }

      for (const item of items) {
        const sizeStr = String(item?.size || '').trim();
        if (
          !item ||
          typeof item !== 'object' ||
          typeof item.productId !== 'string' || !item.productId.trim() || item.productId.length > 100 ||
          !sizeStr || sizeStr.length > 20 ||
          typeof item.quantity !== 'number' || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 50
        ) {
          return res.status(400).json({ error: 'Un ou plusieurs articles dans le panier sont invalides.' });
        }
      }

      // 2. Fetch Store Settings for Delivery Fee
      let deliveryFee = 0;
      if (deliveryMethod === 'delivery') {
        try {
          const settingsSnap = await getDoc(doc(db, 'settings', 'store'));
          if (settingsSnap.exists()) {
            const data = settingsSnap.data();
            deliveryFee = typeof data.deliveryFee === 'number' ? data.deliveryFee : 8;
          } else {
            deliveryFee = 8;
          }
        } catch (e) {
          deliveryFee = 8;
        }
      }

      // 3. Validate Promo Code
      let discountPercent = 0;
      const cleanPromoCode = typeof promoCode === 'string' && promoCode.trim() ? promoCode.toUpperCase().trim().slice(0, 30) : null;
      if (cleanPromoCode) {
        try {
          const q = query(
            collection(db, 'promotions'),
            where('code', '==', cleanPromoCode),
            where('active', '==', true)
          );
          const promoSnap = await getDocs(q);
          if (!promoSnap.empty) {
            const promoData = promoSnap.docs[0].data();
            discountPercent = typeof promoData.discountPercent === 'number' ? promoData.discountPercent : 0;
          }
        } catch (e) {
          console.warn('Error validating promo code:', e);
        }
      }

      // 4. Execute Atomic Firestore Transaction
      let resultOrder: any = null;

      try {
        await runTransaction(db, async (transaction) => {
          // A. ALL READS FIRST (Firestore Transaction requirement)
          const productSnapshots = new Map<string, any>();
          for (const item of items) {
            if (!productSnapshots.has(item.productId)) {
              const prodRef = doc(db, 'products', item.productId);
              const prodSnap = await transaction.get(prodRef);
              if (!prodSnap.exists()) {
                throw new Error("Un des produits commandés n'existe plus.");
              }
              productSnapshots.set(item.productId, prodSnap);
            }
          }

          // B. VERIFY STOCK, CALCULATE AUTHORITATIVE PRICES
          const orderItems = [];
          let subtotal = 0;

          const productUpdatesMap = new Map<string, { ref: any; sizes: any[]; salesCount: number }>();

          for (const item of items) {
            const prodSnap = productSnapshots.get(item.productId);
            const product = { id: prodSnap.id, ...prodSnap.data() } as any;

            if (product.published === false) {
              throw new Error(`Le produit "${product.name}" n'est plus disponible.`);
            }

            const targetSizeStr = String(item.size).trim();

            const currentSizes = productUpdatesMap.has(item.productId)
              ? productUpdatesMap.get(item.productId)!.sizes
              : (Array.isArray(product.sizes) ? JSON.parse(JSON.stringify(product.sizes)) : []);

            const sizeObj = currentSizes.find((s: any) => {
              const sStr = String(s?.size || '').trim();
              if (sStr === targetSizeStr) return true;
              const sNum = Number(sStr);
              const tNum = Number(targetSizeStr);
              return !isNaN(sNum) && !isNaN(tNum) && sNum === tNum;
            });

            if (!sizeObj) {
              throw new Error(`La pointure ${targetSizeStr} n'est pas disponible pour ${product.name}.`);
            }

            if (typeof sizeObj.stock !== 'number' || sizeObj.stock < item.quantity) {
              throw new Error(`Stock insuffisant pour ${product.name} (Pointure ${targetSizeStr}). Stock restant: ${sizeObj.stock || 0}`);
            }

            const unitPrice = typeof product.promoPrice === 'number' && product.promoPrice > 0
              ? product.promoPrice
              : product.price;
            const itemTotalPrice = unitPrice * item.quantity;
            subtotal += itemTotalPrice;

            orderItems.push({
              productId: product.id,
              productName: product.name,
              brandName: product.brandName || '',
              image: (product.images && product.images[0]) || '',
              size: sizeObj.size || targetSizeStr,
              unitPrice,
              quantity: item.quantity,
              totalPrice: itemTotalPrice
            });

            // Deduct stock safely
            sizeObj.stock = Math.max(0, sizeObj.stock - item.quantity);

            const currentSales = productUpdatesMap.has(item.productId)
              ? productUpdatesMap.get(item.productId)!.salesCount
              : (product.salesCount || 0);

            productUpdatesMap.set(item.productId, {
              ref: doc(db, 'products', item.productId),
              sizes: currentSizes,
              salesCount: currentSales + item.quantity
            });
          }

          // C. COMPUTE TOTALS
          const discountAmount = discountPercent > 0 ? Math.round((subtotal * discountPercent) / 100) : 0;
          const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee);
          const orderNumber = generateOrderNumber();

          const orderRef = doc(collection(db, 'orders'));

          const fullOrderDoc = {
            orderNumber,
            customer: {
              name: customer.name.trim(),
              phone: customer.phone.trim(),
              phone2,
              email,
              wilaya: customer.wilaya,
              delegation: customer.delegation.trim(),
              address: customer.address.trim(),
              extraInfo
            },
            items: orderItems,
            deliveryMethod,
            deliveryFee,
            subtotal,
            promoCode: cleanPromoCode,
            discount: discountAmount,
            total: finalTotal,
            status: 'Nouvelle',
            isRead: false,
            serverKey: SERVER_KEY,
            createdAt: new Date().toISOString()
          };

          // D. WRITES INSIDE TRANSACTION
          for (const [_, update] of productUpdatesMap.entries()) {
            transaction.update(update.ref, {
              sizes: update.sizes,
              salesCount: update.salesCount
            });
          }

          transaction.set(orderRef, fullOrderDoc);

          // Construct customer-safe response object (EXCLUDES serverKey)
          resultOrder = {
            id: orderRef.id,
            orderNumber,
            customer: fullOrderDoc.customer,
            items: orderItems,
            deliveryMethod,
            deliveryFee,
            subtotal,
            promoCode: cleanPromoCode,
            discount: discountAmount,
            total: finalTotal,
            status: 'Nouvelle',
            createdAt: fullOrderDoc.createdAt
          };
        });

        return res.status(200).json({
          success: true,
          order: resultOrder
        });

      } catch (txError: any) {
        console.error('Checkout transaction error:', txError);
        return res.status(400).json({
          error: txError.message || "Impossible de finaliser votre commande. Veuillez vérifier votre panier."
        });
      }
    } catch (error) {
      console.error('Checkout API error:', error);
      return res
        .status(500)
        .json({ error: "Une erreur interne s'est produite lors du traitement de votre commande." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
