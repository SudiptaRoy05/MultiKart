"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Heart, Search, Filter, ShoppingCart, Star, Eye } from "lucide-react";
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

  const router = useRouter();

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

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-black">
      {/* Hero Section */}
      <div className="w-full bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 py-16">
        <div className="w-full px-4 md:px-8">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
              Discover Amazing Products
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              Browse through our curated collection of high-quality products from trusted sellers worldwide
            </p>
            <div className="flex items-center justify-center gap-4 text-lg text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span>Premium Quality</span>
              </div>
              <div className="w-1 h-6 bg-gray-300 dark:bg-gray-600"></div>
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Fast Delivery</span>
              </div>
              <div className="w-1 h-6 bg-gray-300 dark:bg-gray-600"></div>
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
        <div className="bg-white dark:bg-black rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for products, brands, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[200px] h-12 border-gray-300">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[200px] h-12 border-gray-300">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
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
              <p className="text-lg text-gray-600 dark:text-gray-400">Loading amazing products...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="text-6xl">😵</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Oops! Something went wrong</h3>
              <p className="text-gray-600 dark:text-gray-400">{error}</p>
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
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">No products found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Try adjusting your search or filters</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {products.map((product) => (
                  <Card
                    key={product._id}
                    className="group flex flex-col bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform transition-all duration-300 hover:-translate-y-2 hover:scale-105 h-[420px]"
                  >
                    <CardHeader className="relative p-0">
                      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100 dark:bg-gray-700">
                        <Image
                          src={product.imageUrl || "/images/placeholder-product.png"}
                          alt={product.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        
                        {/* Wishlist Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-110 ${
                            wishlist.has(product._id) 
                              ? "text-red-500 bg-red-50" 
                              : "text-gray-600 hover:text-red-500"
                          }`}
                          onClick={() => toggleWishlist(product._id)}
                        >
                          <Heart className={`h-4 w-4 ${wishlist.has(product._id) ? "fill-current" : ""}`} />
                        </Button>

                        {/* Quick View Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 left-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm shadow-lg transition-all duration-200 hover:scale-110 text-gray-600 hover:text-red-500"
                          onClick={() => router.push(`/allproduct/${product._id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {/* Stock Badge */}
                        <div className="absolute bottom-2 left-2">
                          <Badge
                            variant={product.quantity > 0 ? "default" : "destructive"}
                            className={`text-xs ${
                              product.quantity > 0
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            } text-white font-semibold`}
                          >
                            {product.quantity > 0 ? `${product.quantity} in Stock` : "Out of Stock"}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="flex-grow p-3 space-y-2">
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs font-medium text-red-600 border-red-200 dark:text-red-400 dark:border-red-800">
                          {product.category}
                        </Badge>
                        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-red-600 transition-colors">
                          {product.name}
                        </h3>
                      </div>
                      
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>

                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">(4.8)</span>
                      </div>
                    </CardContent>

                    <CardFooter className="p-3 pt-0 space-y-2">
                      <div className="w-full space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0">
                            <div className="text-lg font-bold text-red-600">
                              ${product.price.toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500 line-through">
                              ${(product.price * 1.2).toFixed(2)}
                            </div>
                          </div>
                          <Badge variant="destructive" className="bg-red-100 text-red-700 font-semibold text-xs">
                            Save 20%
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-xs h-8 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                            onClick={() => router.push(`/allproduct/${product._id}`)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl text-xs h-8"
                            disabled={product.quantity === 0}
                          >
                            <ShoppingCart className="h-3 w-3 mr-1" />
                            {product.quantity > 0 ? "Add to Cart" : "Sold Out"}
                          </Button>
                        </div>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            {/* Enhanced Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex flex-col items-center space-y-6">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      className="px-6 py-3 border-gray-300 hover:border-red-500 hover:text-red-600 transition-all duration-200"
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
                            className={`w-10 h-10 ${
                              page === pageNum
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "border-gray-300 hover:border-red-500 hover:text-red-600"
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
                      className="px-6 py-3 border-gray-300 hover:border-red-500 hover:text-red-600 transition-all duration-200"
                    >
                      Next →
                    </Button>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
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