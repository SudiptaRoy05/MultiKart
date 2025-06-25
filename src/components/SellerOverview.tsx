"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function SellerOverview() {
    return (
        <div className="p-6 space-y-6">
            {/* Welcome Message */}
            <div>
                <h1 className="text-2xl font-bold">Welcome back, Seller!</h1>
                <p className="text-muted-foreground mt-1">
                    You've made <span className="font-semibold">$2,450</span> today.
                </p>
            </div>

            {/* Sales Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Sales Today</p>
                        <h2 className="text-xl font-semibold">$2,450</h2>
                        <p className="text-green-600 text-sm mt-1">+15% from last period</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Sales This Week</p>
                        <h2 className="text-xl font-semibold">$10,230</h2>
                        <p className="text-green-600 text-sm mt-1">+8% from last period</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Sales This Month</p>
                        <h2 className="text-xl font-semibold">$45,670</h2>
                        <p className="text-green-600 text-sm mt-1">+12% from last period</p>
                    </CardContent>
                </Card>
            </div>

            {/* Order Status */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-yellow-500 rounded-full"></span>
                            <p className="text-sm">Pending</p>
                        </div>
                        <p className="text-xl font-semibold mt-2">12</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                            <p className="text-sm">Shipped</p>
                        </div>
                        <p className="text-xl font-semibold mt-2">24</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-green-600 rounded-full"></span>
                            <p className="text-sm">Delivered</p>
                        </div>
                        <p className="text-xl font-semibold mt-2">156</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                            <p className="text-sm">Cancelled</p>
                        </div>
                        <p className="text-xl font-semibold mt-2">3</p>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Trend Chart Placeholder */}
            <div className="border rounded-lg p-6 bg-card shadow-sm">
                <h2 className="text-md font-semibold mb-2">Revenue Trend (30 days)</h2>
                <div className="h-48 flex items-center justify-center text-muted-foreground">
                    Revenue Chart
                </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-orange-100 dark:bg-orange-900/20 text-orange-900 dark:text-orange-200 flex items-center justify-between p-4 rounded-md">
                <div className="flex items-center gap-2">
                    <AlertTriangle size={20} />
                    <p>You have 2 products running low. Restock now.</p>
                </div>
                <Button variant="outline" className="border-orange-300 dark:border-orange-600 text-orange-900 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800/30">
                    View Products
                </Button>
            </div>
        </div>
    );
}