"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth-context";
import CartService, { UserCart, CartItem, StallCart } from "@/services/cart";
import { Food } from "@/services/food";

interface CartContextType {
  cart: UserCart | null;
  loading: boolean;
  addToCart: (food: Food, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  removeStallFromCart: (stallId: string) => void;
  clearCart: () => void;
  getCartItemCount: () => number;
  getCartTotal: () => number;
  isInCart: (foodId: string) => boolean;
  getItemQuantity: (foodId: string) => number;
  refreshCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<UserCart | null>(null);
  const [loading, setLoading] = useState(false);

  // Load cart khi user đăng nhập
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [isAuthenticated, user?.id]);

  // Refresh cart từ localStorage
  const refreshCart = () => {
    if (!user?.id) return;
    
    try {
      const userCart = CartService.getCart(user.id);
      setCart(userCart);
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  // Thêm món ăn vào cart
  const addToCart = async (food: Food, quantity: number = 1): Promise<boolean> => {
    if (!isAuthenticated || !user?.id) {
      return false;
    }

    try {
      setLoading(true);
      const updatedCart = CartService.addToCart(user.id, food, quantity);
      setCart(updatedCart);
      return true;
    } catch (error) {
      console.error("Error adding to cart:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật số lượng
  const updateQuantity = (itemId: string, quantity: number) => {
    if (!user?.id) return;

    try {
      const updatedCart = CartService.updateQuantity(user.id, itemId, quantity);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Xóa món ăn khỏi cart
  const removeFromCart = (itemId: string) => {
    if (!user?.id) return;

    try {
      const updatedCart = CartService.removeFromCart(user.id, itemId);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  // Xóa toàn bộ cart của một stall
  const removeStallFromCart = (stallId: string) => {
    if (!user?.id) return;

    try {
      const updatedCart = CartService.removeStallFromCart(user.id, stallId);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error removing stall from cart:", error);
    }
  };

  // Xóa toàn bộ cart
  const clearCart = () => {
    if (!user?.id) return;

    try {
      const updatedCart = CartService.clearCart(user.id);
      setCart(updatedCart);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  // Lấy số lượng items trong cart
  const getCartItemCount = (): number => {
    return cart?.total_items || 0;
  };

  // Lấy tổng tiền trong cart
  const getCartTotal = (): number => {
    return cart?.total_amount || 0;
  };

  // Kiểm tra món ăn có trong cart không
  const isInCart = (foodId: string): boolean => {
    if (!cart) return false;
    
    for (const stall of cart.stalls) {
      if (stall.items.some(item => item.food_id === foodId)) {
        return true;
      }
    }
    
    return false;
  };

  // Lấy quantity của món ăn trong cart
  const getItemQuantity = (foodId: string): number => {
    if (!cart) return 0;
    
    for (const stall of cart.stalls) {
      const item = stall.items.find(item => item.food_id === foodId);
      if (item) {
        return item.quantity;
      }
    }
    
    return 0;
  };

  const value: CartContextType = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    removeStallFromCart,
    clearCart,
    getCartItemCount,
    getCartTotal,
    isInCart,
    getItemQuantity,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
