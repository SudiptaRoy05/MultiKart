"use client";

import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    CreditCard,
    Store,
    User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SellerAside() {
    const pathname = usePathname();

    const linkClass = (path: string) =>
        `flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            pathname === path
                ? "bg-primary/10 text-primary font-semibold"
                : "hover:bg-muted text-muted-foreground"
        }`;

    return (
        <aside className="w-64 border-r px-4 py-6">
            {/* Static Sidebar Title */}
            <div className="mb-6 text-lg font-semibold text-gray-700 dark:text-gray-200">
                Seller Dashboard
            </div>

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
        </aside>
    );
}
