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

interface Shop {
  id: string;
  name: string;
}


export default function UserAside() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Overview",
    },
    {
      href: "/dashboard/cart",
      icon: ShoppingCart,
      label: "Cart",
    },
    {
      href: "/dashboard/orders",
      icon: Package,
      label: "Orders",
    },
    {
      href: "/dashboard/payments",
      icon: CreditCard,
      label: "Payments",
    },
    {
      href: "/dashboard/createshop",
      icon: Store,
      label: "Create Shop",
    },
    {
      href: "/dashboard/profile",
      icon: User,
      label: "Profile",
    },
  ];

  return (
    <div className="h-full p-4">
      <div className="mb-6 text-lg font-semibold text-gray-700 dark:text-gray-200">
        User Dashboard
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}