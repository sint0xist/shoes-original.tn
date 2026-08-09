import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  subtotal: number;
  totalItemsCount: number;
  appliedPromoCode: string | null;
  discountPercent: number;
  discountAmount: number;
  applyPromo: (code: string, percent: number) => void;
  removePromo: () => void;
  quickBuy: (product: Product, size: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('amino_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem('amino_cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: Product, size: string, quantity = 1) => {
    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (i) => i.product.id === product.id && i.size === size
      );
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx].quantity += quantity;
        return updated;
      }
      return [...prev, { product, size, quantity }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.size === size ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromoCode(null);
    setDiscountPercent(0);
  };

  const applyPromo = (code: string, percent: number) => {
    setAppliedPromoCode(code);
    setDiscountPercent(percent);
  };

  const removePromo = () => {
    setAppliedPromoCode(null);
    setDiscountPercent(0);
  };

  const quickBuy = (product: Product, size: string) => {
    addToCart(product, size, 1);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.product.promoPrice ?? item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  const totalItemsCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const discountAmount = Math.round((subtotal * discountPercent) / 100);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        subtotal,
        totalItemsCount,
        appliedPromoCode,
        discountPercent,
        discountAmount,
        applyPromo,
        removePromo,
        quickBuy
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
};
