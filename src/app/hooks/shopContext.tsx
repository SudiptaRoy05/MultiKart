// context/ShopContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Shop {
    _id: string;
    name: string;
    owner: {
        email: string;
    };
    description?: string;
    createdAt: string;
    // Add any other shop fields you need
}

interface ShopContextType {
    selectedShop: Shop | null;
    setSelectedShop: (shop: Shop | null) => void;
    isLoading: boolean;
    error: string | null;
    shops: Shop[];
    refreshShops: () => Promise<void>;
}

const SELECTED_SHOP_KEY = 'selectedShopId';

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
    const { data: session } = useSession();
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shops, setShops] = useState<Shop[]>([]);

    // Function to handle shop selection with localStorage persistence
    const handleShopSelection = (shop: Shop | null) => {
        setSelectedShop(shop);
        if (shop) {
            localStorage.setItem(SELECTED_SHOP_KEY, shop._id);
        } else {
            localStorage.removeItem(SELECTED_SHOP_KEY);
        }
    };

    const fetchShops = async () => {
        if (!session?.user?.email) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const response = await fetch(`/api/shop?email=${encodeURIComponent(session.user.email)}`);
            if (!response.ok) throw new Error('Failed to fetch shops');
            
            const data = await response.json();
            setShops(data);
            
            // Get the previously selected shop ID from localStorage
            const savedShopId = localStorage.getItem(SELECTED_SHOP_KEY);
            
            // If there's a saved shop ID and it exists in the fetched shops, select it
            if (savedShopId) {
                const savedShop = data.find((shop: Shop) => shop._id === savedShopId);
                if (savedShop) {
                    handleShopSelection(savedShop);
                    return;
                }
            }
            
            // If there's only one shop, select it automatically
            if (data.length === 1) {
                handleShopSelection(data[0]);
                return;
            }
            
            // If there are shops but none selected, select the first one
            if (data.length > 0 && !selectedShop) {
                handleShopSelection(data[0]);
            }
        } catch (err) {
            console.error('Error fetching shops:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch shops');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchShops();
    }, [session?.user?.email]);

    return (
        <ShopContext.Provider value={{ 
            selectedShop, 
            setSelectedShop: handleShopSelection,
            isLoading,
            error,
            shops,
            refreshShops: fetchShops
        }}>
            {children}
        </ShopContext.Provider>
    );
};

export const useShop = () => {
    const context = useContext(ShopContext);
    if (!context) throw new Error("useShop must be used within a ShopProvider");
    return context;
};
