"use client";

import React from 'react';
import { Package, Heart, Truck, Gift, Check, Star, Tag, Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/app/hooks/useCurrentUser';


export default function UserOverview() {
    const { user, loading, error } = useCurrentUser();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading user info...</span>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-destructive">Failed to load user info</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Hi, {user.name}</h1>
                        <span className="text-2xl">👋</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Last updated: Today, 10:30 AM</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Package} value="24" label="Total Orders" iconColor="text-blue-600" bgColor="bg-blue-100/50 dark:bg-blue-900/30" />
                    <StatCard icon={Heart} value="12" label="Wishlist Items" iconColor="text-pink-600" bgColor="bg-pink-100/50 dark:bg-pink-900/30" />
                    <StatCard icon={Truck} value="3" label="Pending Deliveries" iconColor="text-orange-600" bgColor="bg-orange-100/50 dark:bg-orange-900/30" />
                    <StatCard icon={Gift} value="5" label="Active Coupons" iconColor="text-green-600" bgColor="bg-green-100/50 dark:bg-green-900/30" />
                </div>

                {/* Activity */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-4 md:p-6 border-b">
                        <h2 className="text-lg font-semibold">Recent Activity</h2>
                    </div>
                    <div className="divide-y">
                        <ActivityCard
                            icon={Check}
                            title="Order Delivered"
                            description="Your order #ORD-7898 has been delivered"
                            time="Today, 9:45 AM"
                            iconColor="text-green-600"
                            bgColor="bg-green-100/50 dark:bg-green-900/30"
                        />
                        <ActivityCard
                            icon={Heart}
                            title="Added to Wishlist"
                            description="You added 'Wireless Headphones' to your wishlist"
                            time="Yesterday, 4:30 PM"
                            iconColor="text-pink-600"
                            bgColor="bg-pink-100/50 dark:bg-pink-900/30"
                        />
                        <ActivityCard
                            icon={Truck}
                            title="Order Shipped"
                            description="Your order #ORD-7891 has been shipped"
                            time="Yesterday, 11:20 AM"
                            iconColor="text-blue-600"
                            bgColor="bg-blue-100/50 dark:bg-blue-900/30"
                        />
                        <ActivityCard
                            icon={Star}
                            title="Review Posted"
                            description="You posted a review for 'Smart Watch'"
                            time="May 20, 2023"
                            iconColor="text-yellow-600"
                            bgColor="bg-yellow-100/50 dark:bg-yellow-900/30"
                        />
                        <ActivityCard
                            icon={Tag}
                            title="Coupon Applied"
                            description="You used coupon 'SUMMER20' on your purchase"
                            time="May 18, 2023"
                            iconColor="text-purple-600"
                            bgColor="bg-purple-100/50 dark:bg-purple-900/30"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// Reusable components
function StatCard({ icon: Icon, value, label, iconColor, bgColor }: any) {
    return (
        <div className="rounded-xl border bg-card text-card-foreground p-4 md:p-6 shadow-sm hover:shadow-md transition">
            <div className="mb-3">
                <div className={`inline-flex p-2 rounded-lg ${bgColor}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
            </div>
            <div className="space-y-1">
                <p className="text-2xl md:text-3xl font-bold">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
            </div>
        </div>
    );
}

function ActivityCard({ icon: Icon, title, description, time, iconColor, bgColor }: any) {
    return (
        <div className="p-4 md:p-6 hover:bg-muted/30 transition-colors">
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${bgColor} flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="font-medium text-foreground mb-1">{title}</h3>
                            <p className="text-sm text-muted-foreground">{description}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">{time}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
