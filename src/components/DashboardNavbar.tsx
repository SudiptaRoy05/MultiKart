"use client";

import { Bell, Globe, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";

export default function DashboardNavbar() {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();

  const user = session?.user;
  const userName = user?.name || user?.email || "Guest";
  const initials =
    userName
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "GU";

  return (
    <div className="h-30 border-b bg-white dark:bg-black shadow-sm w-full">
      <div>
        {/* Top Navbar */}
        <div className="flex items-center justify-between px-6 py-2">
          <div className="text-2xl font-bold text-red-500">Multikart</div>

          <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
            {/* Language */}
            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-800 dark:hover:text-white">
              <Globe size={18} />
              <span>EN</span>
            </div>

            {/* Help */}
            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-800 dark:hover:text-white">
              <HelpCircle size={18} />
              <span>Help</span>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="outline"
              className="h-8 px-3 text-xs"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "Light" : "Dark"} Mode
            </Button>

            {/* Notifications */}
            <div className="relative cursor-pointer">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 inline-block w-2 h-2 bg-red-500 rounded-full" />
            </div>

            {/* User Info */}
            <div className="flex items-center gap-2 cursor-pointer">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="truncate max-w-[120px]">{userName}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 my-2" />

        {/* Search Bar */}
        <div className="flex items-center gap-4 px-6 pb-4">
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="fashion">Fashion</SelectItem>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="books">Books</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="text"
            placeholder="Search by product, brand, or keyword"
            className="flex-1"
          />

          <Button variant="default" className="bg-red-500 hover:bg-red-600">
            Search
          </Button>
        </div>
      </div>
    </div>
  );
}
