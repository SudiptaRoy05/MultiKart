"use client";

import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  CreditCard,
  Store,
  Building2,
  Text,
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ShopSelector from "./ShopSelector";
import { useShop } from "@/app/hooks/shopContext";

export default function SellerAside() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { selectedShop, isLoading } = useShop();

  const linkClass = (path: string) =>
    `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
      pathname === path
        ? "bg-primary/10 text-primary font-semibold"
        : "hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-300"
    }`;

  return (
    <aside className="w-64 border-r border-gray-200 dark:border-neutral-800 px-4 py-6 flex flex-col justify-between min-h-screen bg-white dark:bg-black">
      <div>
        {/* Title and Shop Selector */}
        <div className="mb-6">
          <div className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
            Seller Dashboard
          </div>
          <ShopSelector />
        </div>

        {/* Navigation - Only show if a shop is selected and not loading */}
        {selectedShop && !isLoading && (
          <nav className="space-y-2">
            <Link href="/dashboard" className={linkClass("/dashboard")}>
              <LayoutDashboard className="w-5 h-5" />
              Overview
            </Link>
            <Link href="/dashboard/product" className={linkClass("/dashboard/product")}>
              <Package className="w-5 h-5" />
              Products
            </Link>
            <Link href="/dashboard/sellerOrder" className={linkClass("/dashboard/sellerOrder")}>
              <ShoppingCart className="w-5 h-5" />
              Orders
            </Link>
            <Link href="/dashboard/payments" className={linkClass("/dashboard/payments")}>
              <CreditCard className="w-5 h-5" />
              Payments
            </Link>
          </nav>
        )}

        {/* Create Shop Link - Only show if no shop is selected and not loading */}
        {!selectedShop && !isLoading && (
          <div className="mt-4">
            <Link href="/dashboard/createshop" className={linkClass("/dashboard/createshop")}>
              <Store className="w-5 h-5" />
              Create Shop
            </Link>
          </div>
        )}
      </div>

      {/* Shop Card */}
      {selectedShop && (
        <div className="mt-8 border-t border-gray-200 dark:border-neutral-800 pt-4">
          <div className="rounded-xl bg-gray-100 dark:bg-neutral-900 p-4 shadow-sm border border-gray-200 dark:border-neutral-800 text-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Store className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-base">
                  {selectedShop.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Created {new Date(selectedShop.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
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
