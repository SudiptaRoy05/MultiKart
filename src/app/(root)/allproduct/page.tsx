"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, Search, Filter, ShoppingCart, Star, Eye, ArrowRight, Info, Sun, Moon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";
import { useTheme } from "next-themes";

interface Product {
    _id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    quantity: number;
    category: string;
}

interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalProducts: number;
}

const ITEMS_PER_PAGE = 12;

const categories = [
    "All Categories",
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Sports",
    "Beauty",
    "Toys",
    "Others",
];

const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "price-low", label: "Price: Low to High" },
    { value: "price-high", label: "Price: High to Low" },
    { value: "name-asc", label: "Name: A to Z" },
    { value: "name-desc", label: "Name: Z to A" },
];

export default function PublicAllProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All Categories");
    const [sortBy, setSortBy] = useState("newest");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Build query parameters
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: ITEMS_PER_PAGE.toString(),
                    sort: sortBy,
                });

                if (debouncedSearch) {
                    params.append("search", debouncedSearch);
                }

                if (selectedCategory !== "All Categories") {
                    params.append("category", selectedCategory);
                }

                const res = await fetch(`/api/allproducts?${params.toString()}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch products");
                }
                const data = await res.json();
                setProducts(data.products || []);
                setPagination(data.pagination || null);
            } catch (err: any) {
                console.error(err);
                setError(err.message || "Error loading products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [page, debouncedSearch, selectedCategory, sortBy]);

    const toggleWishlist = (productId: string) => {
        const newWishlist = new Set(wishlist);
        if (wishlist.has(productId)) {
            newWishlist.delete(productId);
            toast.success("Removed from wishlist");
        } else {
            newWishlist.add(productId);
            toast.success("Added to wishlist");
        }
        setWishlist(newWishlist);
    };

    const handleViewDetails = (productId: string) => {
        router.push(`/allproduct/${productId}`);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="w-full min-h-screen bg-gray-50 dark:bg-black">
            {/* Theme Toggle Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    className="rounded-full w-12 h-12 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-gray-200 dark:border-zinc-700"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                    {theme === "dark" ? (
                        <Sun className="h-5 w-5 text-yellow-400" />
                    ) : (
                        <Moon className="h-5 w-5 text-gray-700" />
                    )}
                </Button>
            </div>

            {/* Hero Section */}
            <div className="w-full bg-white dark:bg-black border-b border-gray-200 dark:border-zinc-800 py-16">
                <div className="w-full px-4 md:px-8">
                    <div className="text-center space-y-6">
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Discover Amazing Products
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 dark:text-zinc-300 max-w-4xl mx-auto leading-relaxed">
                            Browse through our curated collection of high-quality products from trusted sellers worldwide
                        </p>
                        <div className="flex items-center justify-center gap-4 text-lg text-gray-700 dark:text-zinc-300">
                            <div className="flex items-center gap-2">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                <span>Premium Quality</span>
                            </div>
                            <div className="w-1 h-6 bg-gray-300 dark:bg-zinc-600"></div>
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                <span>Fast Delivery</span>
                            </div>
                            <div className="w-1 h-6 bg-gray-300 dark:bg-zinc-600"></div>
                            <div className="flex items-center gap-2">
                                <Heart className="h-5 w-5" />
                                <span>Trusted Sellers</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="w-full px-4 md:px-8 py-8">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 p-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <Input
                                placeholder="Search for products, brands, categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-12 h-12 text-lg border-gray-300 dark:border-zinc-700 focus:border-red-500 focus:ring-red-500 dark:bg-zinc-800 dark:text-white"
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full sm:w-[200px] h-12 border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                                    <Filter className="h-4 w-4 mr-2" />
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700">
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                            className="dark:hover:bg-zinc-700"
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-full sm:w-[200px] h-12 border-gray-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700">
                                    {sortOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                            className="dark:hover:bg-zinc-700"
                                        >
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="w-full px-4 md:px-8 pb-8">
                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center min-h-[500px]">
                        <div className="text-center space-y-4">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto"></div>
                            <p className="text-lg text-gray-600 dark:text-zinc-400">Loading amazing products...</p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && !loading && (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center space-y-4">
                            <div className="text-6xl">😵</div>
                            <h3 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">Oops! Something went wrong</h3>
                            <p className="text-gray-600 dark:text-zinc-400">{error}</p>
                            <Button
                                onClick={() => window.location.reload()}
                                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                )}

                {/* Products Grid - 5 cards per row */}
                {!loading && !error && (
                    <>
                        {products.length === 0 ? (
                            <div className="flex items-center justify-center min-h-[400px]">
                                <div className="text-center space-y-4">
                                    <div className="text-6xl">🔍</div>
                                    <h3 className="text-2xl font-semibold text-gray-900 dark:text-zinc-100">No products found</h3>
                                    <p className="text-gray-600 dark:text-zinc-400">Try adjusting your search or filters</p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                                {products.map((product) => (
                                    <Card
                                        key={product._id}
                                        className="group flex flex-col bg-white dark:bg-zinc-900 border-0 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 relative"
                                    >
                                        <CardHeader className="relative p-0">
                                            <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-700">
                                                <Image
                                                    src={product.imageUrl || "/images/placeholder-product.png"}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
                                                />

                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`absolute top-4 right-4 h-10 w-10 rounded-full backdrop-blur-md transition-all duration-300 hover:scale-105 z-10 border ${wishlist.has(product._id)
                                                        ? "bg-white/95 text-red-500 shadow-lg border-white/20"
                                                        : "bg-white/80 text-gray-600 hover:bg-white/95 hover:text-red-500 shadow-md border-white/20"
                                                        }`}
                                                    onClick={() => toggleWishlist(product._id)}
                                                >
                                                    <Heart className={`h-4 w-4 ${wishlist.has(product._id) ? "fill-current" : ""} transition-all duration-200`} />
                                                </Button>

                                                <div className="absolute top-4 left-4">
                                                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md border ${product.quantity > 0
                                                        ? "bg-emerald-50/90 text-emerald-700 border-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-200 dark:border-emerald-700/50"
                                                        : "bg-red-50/90 text-red-700 border-red-200/50 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700/50"
                                                        } shadow-sm`}>
                                                        {product.quantity > 0 ? `${product.quantity} Available` : "Out of Stock"}
                                                    </div>
                                                </div>

                                                <div className="absolute bottom-4 right-4">
                                                    <div className="bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg">
                                                        -20%
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="flex-grow p-5 space-y-3">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-zinc-800 dark:text-zinc-300 px-2.5 py-1 rounded-lg border-0"
                                                    >
                                                        {product.category}
                                                    </Badge>
                                                </div>

                                                <h3 className="font-semibold text-lg text-gray-900 dark:text-zinc-100 line-clamp-2 leading-tight tracking-tight">
                                                    {product.name}
                                                </h3>
                                            </div>

                                            <p className="text-sm text-gray-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                                {product.description}
                                            </p>

                                            {/* Price Section */}
                                            <div className="flex items-center justify-between pt-2">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
                                                            ${product.price.toFixed(2)}
                                                        </span>
                                                        <span className="text-sm text-gray-500 line-through dark:text-zinc-400">
                                                            ${(product.price * 1.2).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-green-600 font-medium dark:text-green-400">
                                                        Free shipping
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>

                                        <CardFooter className="p-5 pt-0">
                                            <Button
                                                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 rounded-lg shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                                                onClick={() => handleViewDetails(product._id)}
                                            >
                                                <Eye className="h-4 w-4" />
                                                View Details
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {/* Enhanced Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="mt-12 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-gray-200 dark:border-zinc-700 p-8">
                                <div className="flex flex-col items-center space-y-6">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            disabled={page === 1}
                                            onClick={() => setPage(page - 1)}
                                            className="px-6 py-3 border-gray-300 hover:border-red-500 hover:text-red-600 transition-all duration-200 dark:border-zinc-600 dark:hover:border-red-500 dark:text-zinc-300"
                                        >
                                            ← Previous
                                        </Button>

                                        <div className="flex items-center gap-2 mx-4">
                                            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                                const pageNum = i + 1;
                                                return (
                                                    <Button
                                                        key={pageNum}
                                                        variant={page === pageNum ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setPage(pageNum)}
                                                        className={`w-10 h-10 ${page === pageNum
                                                            ? "bg-red-600 hover:bg-red-700 text-white"
                                                            : "border-gray-300 hover:border-red-500 hover:text-red-600 dark:border-zinc-600 dark:text-zinc-300"
                                                            } transition-all duration-200`}
                                                    >
                                                        {pageNum}
                                                    </Button>
                                                );
                                            })}
                                        </div>

                                        <Button
                                            variant="outline"
                                            disabled={!pagination || page >= pagination.totalPages}
                                            onClick={() => setPage(page + 1)}
                                            className="px-6 py-3 border-gray-300 hover:border-red-500 hover:text-red-600 transition-all duration-200 dark:border-zinc-600 dark:hover:border-red-500 dark:text-zinc-300"
                                        >
                                            Next →
                                        </Button>
                                    </div>

                                    <div className="text-center space-y-2">
                                        <p className="text-lg font-semibold text-gray-900 dark:text-zinc-100">
                                            Page {pagination.currentPage} of {pagination.totalPages}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-zinc-400">
                                            Showing {((pagination.currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(pagination.currentPage * ITEMS_PER_PAGE, pagination.totalProducts)} of {pagination.totalProducts} products
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}