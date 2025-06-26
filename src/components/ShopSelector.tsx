"use client";

import { useEffect, useState, useCallback } from "react";
import { useShop } from "@/app/hooks/shopContext";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface Shop {
  _id: string;
  name: string;
  owner: {
    email: string;
  };
  description?: string;
  createdAt: string;
}

export function ShopSelector() {
  const [shops, setShops] = useState<Shop[]>([]);
  const { selectedShop, setSelectedShop, isLoading, setIsLoading } = useShop();
  const { data: session } = useSession();

  const fetchShops = useCallback(async () => {
    if (!session?.user?.email) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/shop?email=${encodeURIComponent(session.user.email)}`);
      const data = await response.json();
      if (data.shops) {
        setShops(data.shops);
        // If no shop is selected and we have shops, select the first one
        if (!selectedShop && data.shops.length > 0) {
          setSelectedShop(data.shops[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch shops:", error);
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading, selectedShop, setSelectedShop, session?.user?.email]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleShopChange = (shopId: string) => {
    const shop = shops.find((s) => s._id === shopId);
    if (shop) {
      setSelectedShop(shop);
    }
  };

  if (shops.length === 0 && !isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        No shops found. Create your first shop!
      </div>
    );
  }

  return (
    <div className="relative">
      <Select
        value={selectedShop?._id}
        onValueChange={handleShopChange}
        disabled={isLoading}
      >
        <SelectTrigger className="w-[200px]">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select a shop" />
          )}
        </SelectTrigger>
        <SelectContent>
          {shops.map((shop) => (
            <SelectItem key={shop._id} value={shop._id}>
              {shop.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 