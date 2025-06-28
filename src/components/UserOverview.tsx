"use client";

import React, { useEffect, useState } from 'react';
import { Package, Heart, Truck, Gift, Check, Star, Tag, Loader2 } from 'lucide-react';
import { useCurrentUser } from '@/app/hooks/useCurrentUser';

interface UserStats {
  totalOrders: number;
  wishlistItems: number;
  pendingDeliveries: number;
  activeCoupons: number;
}

interface ActivityItem {
  type: string;
  title: string;
  description: string;
  time: string;
  status: string;
}

interface UserStatsData {
  stats: UserStats;
  activity: ActivityItem[];
}

export default function UserOverview() {
    const { user, loading: userLoading, error: userError } = useCurrentUser();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUserStats() {
            if (!user?._id) return;

            try {
                const res = await fetch(`/api/user/stats?userId=${user._id}`);
                if (!res.ok) throw new Error("Failed to fetch user stats");

                const data: UserStatsData = await res.json();
                setStats(data.stats);
                setActivity(data.activity);
            } catch (err) {
                console.error(err);
                setError("Error fetching user statistics");
            } finally {
                setLoading(false);
            }
        }

        if (user) {
            fetchUserStats();
        }
    }, [user]);

    if (userLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading user info...</span>
            </div>
        );
    }

    if (userError || error || !user) {
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
                    <p className="text-sm text-muted-foreground">
                        {user.email} • {user.role}
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard 
                        icon={Package} 
                        value={stats?.totalOrders || 0} 
                        label="Total Orders" 
                        iconColor="text-blue-600" 
                        bgColor="bg-blue-100/50 dark:bg-blue-900/30" 
                    />
                    <StatCard 
                        icon={Heart} 
                        value={stats?.wishlistItems || 0} 
                        label="Wishlist Items" 
                        iconColor="text-pink-600" 
                        bgColor="bg-pink-100/50 dark:bg-pink-900/30" 
                    />
                    <StatCard 
                        icon={Truck} 
                        value={stats?.pendingDeliveries || 0} 
                        label="Pending Deliveries" 
                        iconColor="text-orange-600" 
                        bgColor="bg-orange-100/50 dark:bg-orange-900/30" 
                    />
                    <StatCard 
                        icon={Gift} 
                        value={stats?.activeCoupons || 0} 
                        label="Active Coupons" 
                        iconColor="text-green-600" 
                        bgColor="bg-green-100/50 dark:bg-green-900/30" 
                    />
                </div>

                {/* Activity */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-4 md:p-6 border-b">
                        <h2 className="text-lg font-semibold">Recent Activity</h2>
                    </div>
                    <div className="divide-y">
                        {activity.length > 0 ? (
                            activity.map((item, index) => (
                                <ActivityCard
                                    key={index}
                                    icon={getActivityIcon(item.status)}
                                    title={item.title}
                                    description={item.description}
                                    time={formatDate(item.time)}
                                    iconColor={getActivityColor(item.status)}
                                    bgColor={getActivityBgColor(item.status)}
                                />
                            ))
                        ) : (
                            <div className="p-4 md:p-6 text-center text-muted-foreground">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper functions
function getActivityIcon(status: string) {
    switch (status) {
        case 'delivered':
            return Check;
        case 'shipped':
            return Truck;
        case 'processing':
            return Package;
        default:
            return Tag;
    }
}

function getActivityColor(status: string) {
    switch (status) {
        case 'delivered':
            return 'text-green-600';
        case 'shipped':
            return 'text-blue-600';
        case 'processing':
            return 'text-orange-600';
        default:
            return 'text-purple-600';
    }
}

function getActivityBgColor(status: string) {
    switch (status) {
        case 'delivered':
            return 'bg-green-100/50 dark:bg-green-900/30';
        case 'shipped':
            return 'bg-blue-100/50 dark:bg-blue-900/30';
        case 'processing':
            return 'bg-orange-100/50 dark:bg-orange-900/30';
        default:
            return 'bg-purple-100/50 dark:bg-purple-900/30';
    }
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        if (hours === 0) {
            const minutes = Math.floor(diff / (1000 * 60));
            return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        }
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days === 1) {
        return 'Yesterday';
    } else if (days < 7) {
        return `${days} days ago`;
    } else {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
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
                        <p className="text-xs text-muted-foreground whitespace-nowrap">{time}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
