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

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
    const { data: session } = useSession();
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shops, setShops] = useState<Shop[]>([]);

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
            
            // If there's only one shop, select it automatically
            if (data.length === 1 && !selectedShop) {
                setSelectedShop(data[0]);
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
            setSelectedShop,
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
