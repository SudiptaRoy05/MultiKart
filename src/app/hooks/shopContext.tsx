// context/ShopContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

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
    setIsLoading: (loading: boolean) => void;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider = ({ children }: { children: ReactNode }) => {
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    return (
        <ShopContext.Provider value={{ 
            selectedShop, 
            setSelectedShop,
            isLoading,
            setIsLoading
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
