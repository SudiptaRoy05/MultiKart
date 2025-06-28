"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { useShop } from "@/app/hooks/shopContext";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useSession } from "next-auth/react";
import { useCurrentUser } from "@/app/hooks/useCurrentUser";

interface SellerOverviewData {
    shopInfo: {
        id: string;
        name: string;
        description: string;
    };
    salesSummary: {
        today: { amount: number; change: number };
        week: { amount: number; change: number };
        month: { amount: number; change: number };
    };
    orderStatus: {
        pending: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
    lowStockAlert: {
        count: number;
        products: Array<{
            id: string;
            name: string;
            stock: number;
            price: number;
        }>;
    };
    revenueChart: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
    quickStats: {
        totalProducts: number;
        totalOrders: number;
        averageOrderValue: number;
    };
}

export default function SellerOverview() {
    const { data: session } = useSession();
    const { user, loading: userLoading } = useCurrentUser();
    const { selectedShop, isLoading: shopLoading } = useShop();
    const [overviewData, setOverviewData] = useState<SellerOverviewData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchOverviewData = async () => {
        if (!selectedShop?._id || !session?.user) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/user/seller?shopId=${selectedShop._id}`, {
                credentials: 'include'
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch overview data');
            }

            const data = await response.json();
            setOverviewData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching overview data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (selectedShop?._id && session?.user) {
            fetchOverviewData();
        }
    }, [selectedShop?._id, session?.user]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatPercentage = (change: number) => {
        const isPositive = change >= 0;
        return (
            <span className={`flex items-center gap-1 text-sm mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {isPositive ? '+' : ''}{change}% from last period
            </span>
        );
    };

    const formatChartData = (data: SellerOverviewData['revenueChart']) => {
        return data.map(item => ({
            ...item,
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }));
    };

    if (shopLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!selectedShop) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Please select a shop to view overview</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <p className="text-red-600">Error: {error}</p>
                <Button onClick={fetchOverviewData} variant="outline">
                    Retry
                </Button>
            </div>
        );
    }

    if (isLoading || !overviewData) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Welcome Message */}
            <div>
                <h1 className="text-2xl font-bold">Welcome back, {overviewData.shopInfo.name}!</h1>
                <p className="text-muted-foreground mt-1">
                    You've made <span className="font-semibold">{formatCurrency(overviewData.salesSummary.today.amount)}</span> today.
                </p>
            </div>

            {/* Sales Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Sales Today</p>
                        <h2 className="text-xl font-semibold">{formatCurrency(overviewData.salesSummary.today.amount)}</h2>
                        {overviewData.salesSummary.today.change !== 0 && formatPercentage(overviewData.salesSummary.today.change)}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Sales This Week</p>
                        <h2 className="text-xl font-semibold">{formatCurrency(overviewData.salesSummary.week.amount)}</h2>
                        {formatPercentage(overviewData.salesSummary.week.change)}
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Sales This Month</p>
                        <h2 className="text-xl font-semibold">{formatCurrency(overviewData.salesSummary.month.amount)}</h2>
                        {formatPercentage(overviewData.salesSummary.month.change)}
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
                        <p className="text-xl font-semibold mt-2">{overviewData.orderStatus.pending}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-blue-500 rounded-full"></span>
                            <p className="text-sm">Shipped</p>
                        </div>
                        <p className="text-xl font-semibold mt-2">{overviewData.orderStatus.shipped}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-green-600 rounded-full"></span>
                            <p className="text-sm">Delivered</p>
                        </div>
                        <p className="text-xl font-semibold mt-2">{overviewData.orderStatus.delivered}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-red-500 rounded-full"></span>
                            <p className="text-sm">Cancelled</p>
                        </div>
                        <p className="text-xl font-semibold mt-2">{overviewData.orderStatus.cancelled}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Products</p>
                        <h2 className="text-xl font-semibold">{overviewData.quickStats.totalProducts}</h2>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Orders</p>
                        <h2 className="text-xl font-semibold">{overviewData.quickStats.totalOrders}</h2>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                        <h2 className="text-xl font-semibold">{formatCurrency(overviewData.quickStats.averageOrderValue)}</h2>
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Trend Chart */}
            <div className="border rounded-lg p-6 bg-card shadow-sm">
                <h2 className="text-md font-semibold mb-4">Revenue Trend (30 days)</h2>
                {overviewData.revenueChart.length > 0 ? (
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={formatChartData(overviewData.revenueChart)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="date" 
                                    fontSize={12}
                                    tickLine={false}
                                />
                                <YAxis 
                                    fontSize={12}
                                    tickLine={false}
                                    tickFormatter={(value: number) => `${value}`}
                                />
                                <Tooltip 
                                    formatter={(value: number, name: string) => [
                                        name === 'revenue' ? formatCurrency(value) : value,
                                        name === 'revenue' ? 'Revenue' : 'Orders'
                                    ]}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#3b82f6" 
                                    strokeWidth={2}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                        No revenue data available
                    </div>
                )}
            </div>

            {/* Low Stock Alert */}
            {overviewData.lowStockAlert.count > 0 && (
                <div className="bg-orange-100 dark:bg-orange-900/20 text-orange-900 dark:text-orange-200 flex items-center justify-between p-4 rounded-md">
                    <div className="flex items-center gap-2">
                        <AlertTriangle size={20} />
                        <div>
                            <p className="font-medium">
                                You have {overviewData.lowStockAlert.count} product{overviewData.lowStockAlert.count > 1 ? 's' : ''} running low.
                            </p>
                            <p className="text-sm opacity-90">
                                {overviewData.lowStockAlert.products.slice(0, 2).map(p => p.name).join(', ')}
                                {overviewData.lowStockAlert.count > 2 && ` and ${overviewData.lowStockAlert.count - 2} more`}
                            </p>
                        </div>
                    </div>
                    <Button 
                        variant="outline" 
                        className="border-orange-300 dark:border-orange-600 text-orange-900 dark:text-orange-200 hover:bg-orange-200 dark:hover:bg-orange-800/30"
                        onClick={() => {
                            // Navigate to products page or show modal
                            console.log('Navigate to low stock products');
                        }}
                    >
                        View Products
                    </Button>
                </div>
            )}

            {/* Refresh Button */}
            <div className="flex justify-end">
                <Button 
                    onClick={fetchOverviewData} 
                    variant="outline" 
                    size="sm"
                    disabled={isLoading}
                >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Refresh Data
                </Button>
            </div>
        </div>
    );
}