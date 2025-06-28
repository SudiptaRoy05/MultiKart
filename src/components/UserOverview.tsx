"use client";

import React, { useEffect, useState } from 'react';
import { Package, Heart, Truck, Gift, Check, Tag, Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';

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
    const { data: session, status } = useSession();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [activity, setActivity] = useState<ActivityItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUserStats() {
            try {
                const res = await fetch('/api/user/stats');
                
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.message || "Failed to fetch user stats");
                }

                const data: UserStatsData = await res.json();
                setStats(data.stats);
                setActivity(data.activity);
                setError(null);
            } catch (err) {
                console.error('Error fetching stats:', err);
                setError(err instanceof Error ? err.message : "Failed to fetch user statistics");
            } finally {
                setLoading(false);
            }
        }

        if (status === "authenticated") {
            fetchUserStats();
        } else if (status === "unauthenticated") {
            setLoading(false);
            setError("Please log in to view your statistics");
        }
    }, [status]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading statistics...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-destructive">{error}</p>
            </div>
        );
    }

    if (!session?.user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Please log in to view your statistics</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                            Hi, {session.user.name}
                        </h1>
                        <span className="text-2xl">👋</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        {session.user.email}
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
                        {activity && activity.length > 0 ? (
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

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    }).format(date);
}

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

interface StatCardProps {
    icon: React.ElementType;
    value: number;
    label: string;
    iconColor: string;
    bgColor: string;
}

function StatCard({ icon: Icon, value, label, iconColor, bgColor }: StatCardProps) {
    return (
        <div className="p-4 rounded-xl border bg-card">
            <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${bgColor}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div>
                    <p className="text-2xl font-semibold">{value}</p>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            </div>
        </div>
    );
}

interface ActivityCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    time: string;
    iconColor: string;
    bgColor: string;
}

function ActivityCard({ icon: Icon, title, description, time, iconColor, bgColor }: ActivityCardProps) {
    return (
        <div className="p-4 md:p-6">
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${bgColor}`}>
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                </div>
                <div className="flex-1">
                    <h3 className="font-medium">{title}</h3>
                    <p className="text-sm text-muted-foreground">{description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{time}</p>
                </div>
            </div>
        </div>
    );
}
