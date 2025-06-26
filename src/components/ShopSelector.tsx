"use client";

import { useShop } from "@/app/hooks/shopContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function ShopSelector() {
  const { selectedShop, setSelectedShop, isLoading, error, shops } = useShop();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading shops...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive">
        Failed to load shops
      </div>
    );
  }

  if (!shops.length) {
    return (
      <div className="text-sm text-muted-foreground">
        No shops found
      </div>
    );
  }

  return (
    <Select
      value={selectedShop?._id}
      onValueChange={(value) => {
        const shop = shops.find((s) => s._id === value);
        setSelectedShop(shop || null);
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a shop" />
      </SelectTrigger>
      <SelectContent>
        {shops.map((shop) => (
          <SelectItem key={shop._id} value={shop._id}>
            {shop.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 