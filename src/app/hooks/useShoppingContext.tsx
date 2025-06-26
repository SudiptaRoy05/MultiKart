"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { useCurrentUser } from "./useCurrentUser";

interface CartItem {
  _id: string;
  productId: string;
  quantity: number;
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
    quantity: number;
  };
}

interface WishlistItem {
  _id: string;
  productId: string;
  product: {
    _id: string;
    name: string;
    price: number;
    imageUrl: string;
  };
}

interface ShoppingContextType {
  cartItems: CartItem[];
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  isCartUpdating: boolean;
  isWishlistUpdating: boolean;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateCartQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  cartTotal: number;
  cartCount: number;
  error: string | null;
  refreshCart: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const ShoppingContext = createContext<ShoppingContextType | undefined>(undefined);

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { user } = useCurrentUser();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCartUpdating, setIsCartUpdating] = useState(false);
  const [isWishlistUpdating, setIsWishlistUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart and wishlist when session is ready
  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (session) {
      fetchCartItems();
      refreshWishlist();
    } else {
      setCartItems([]);
      setWishlistItems([]);
      setIsLoading(false);
    }
  }, [session, status]);

  const fetchCartItems = async () => {
    if (!session?.user?.email) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/cart');
      if (!response.ok) throw new Error('Failed to fetch cart items');
      
      const data = await response.json();
      setCartItems(data.cartItems || []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cart items');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      const data = await res.json();
      setCartItems(data.cartItems);
    } catch (error) {
      console.error("Fetch cart error:", error);
      toast.error("Failed to fetch cart");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      const data = await res.json();
      setWishlistItems(data.wishlistItems);
    } catch (error) {
      console.error("Fetch wishlist error:", error);
      toast.error("Failed to fetch wishlist");
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    if (status !== 'authenticated') {
      toast.error("Please login to add items to cart");
      return;
    }

    setIsCartUpdating(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add to cart");
      }

      await refreshCart();
      toast.success("Added to cart successfully");
    } catch (error: any) {
      console.error("Add to cart error:", error);
      toast.error(error.message || "Failed to add to cart");
      throw error;
    } finally {
      setIsCartUpdating(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    if (status !== 'authenticated') return;

    setIsCartUpdating(true);
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove from cart");
      }
      
      await refreshCart();
      toast.success("Removed from cart");
    } catch (error: any) {
      console.error("Remove from cart error:", error);
      toast.error(error.message || "Failed to remove from cart");
      throw error;
    } finally {
      setIsCartUpdating(false);
    }
  };

  const updateCartQuantity = async (cartItemId: string, quantity: number) => {
    if (status !== 'authenticated') return;

    setIsCartUpdating(true);
    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update cart");
      }
      
      await refreshCart();
    } catch (error: any) {
      console.error("Update cart error:", error);
      toast.error(error.message || "Failed to update cart");
      throw error;
    } finally {
      setIsCartUpdating(false);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (status !== 'authenticated') {
      toast.error("Please login to manage wishlist");
      return;
    }

    setIsWishlistUpdating(true);
    try {
      const isInWishlist = wishlistItems.some(item => item.product._id === productId);

      const res = await fetch("/api/wishlist", {
        method: isInWishlist ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || (isInWishlist ? "Failed to remove from wishlist" : "Failed to add to wishlist"));
      }

      await refreshWishlist();
      toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist");
    } catch (error: any) {
      console.error("Toggle wishlist error:", error);
      toast.error(error.message || "Failed to update wishlist");
      throw error;
    } finally {
      setIsWishlistUpdating(false);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.product._id === productId);
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const cartCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <ShoppingContext.Provider
      value={{
        cartItems,
        wishlistItems,
        isLoading,
        isCartUpdating,
        isWishlistUpdating,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        toggleWishlist,
        isInWishlist,
        cartTotal,
        cartCount,
        error,
        refreshCart,
        refreshWishlist,
      }}
    >
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShopping() {
  const context = useContext(ShoppingContext);
  if (!context) {
    throw new Error('useShopping must be used within a ShoppingProvider');
  }
  return context;
} 