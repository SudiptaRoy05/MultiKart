"use client";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Store,
  User,
  Building2,
  Tag,
  Text,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ShopSelector } from "./ShopSelector";
import { useShop } from "@/app/hooks/shopContext";

export default function SellerAside() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { selectedShop } = useShop();

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
      pathname === path
        ? "bg-primary/10 text-primary font-semibold"
        : "hover:bg-muted text-muted-foreground"
    }`;

  return (
    <aside className="w-64 border-r px-4 py-6 flex flex-col justify-between min-h-screen bg-white dark:bg-gray-900">
      <div>
        {/* Title */}
        <div className="mb-6">
          <div className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            Seller Dashboard
          </div>
          <ShopSelector />
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <Link href="/dashboard" className={linkClass("/dashboard")}>
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </Link>
          <Link href="/dashboard/product" className={linkClass("/dashboard/product")}>
            <Package className="w-5 h-5" />
            Products
          </Link>
          <Link href="/dashboard/order" className={linkClass("/dashboard/order")}>
            <ShoppingCart className="w-5 h-5" />
            Orders
          </Link>
          <Link href="/payments" className={linkClass("/payments")}>
            <CreditCard className="w-5 h-5" />
            Payments
          </Link>
          <Link href="/dashboard/createshop" className={linkClass("/dashboard/createshop")}>
            <Store className="w-5 h-5" />
            Create Shop
          </Link>
          <Link href="/dashboard/profile" className={linkClass("/dashboard/profile")}>
            <User className="w-5 h-5" />
            Profile
          </Link>
        </nav>
      </div>

      {/* Shop Card */}
      {selectedShop && (
        <div className="mt-8 border-t pt-4">
          <div className="rounded-xl bg-muted/10 p-4 shadow-sm border text-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base">{selectedShop.name}</p>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(selectedShop.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>{selectedShop.owner.email}</span>
              </div>
              {selectedShop.description && (
                <div className="flex items-center gap-2">
                  <Text className="w-4 h-4" />
                  <span className="truncate">{selectedShop.description}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
