"use client";

import { useEffect, useState } from "react";
import { useShop } from "@/app/hooks/shopContext";
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

  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/shop");
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
    };

    fetchShops();
  }, []); // Remove selectedShop and setSelectedShop from dependencies

  const handleShopChange = (shopId: string) => {
    const shop = shops.find((s) => s._id === shopId);
    if (shop) {
      setSelectedShop(shop);
    }
  };

  if (shops.length === 0 && !isLoading) {
    return null;
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