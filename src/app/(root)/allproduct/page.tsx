"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ShoppingCart, Heart } from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  quantity: number;
  category: string;
}

export default function PublicAllProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/allproducts");
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await res.json();
        setProducts(data.products || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-12">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">
          Discover Amazing Products
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Browse through our curated collection of high-quality products from trusted sellers
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Loading products...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-center text-red-500">
          {error}
        </div>
      )}

      {/* Products Grid */}
      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product._id}
                className="flex flex-col transform transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
              >
                <CardHeader className="relative p-0">
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <Image
                      src={product.imageUrl || "/images/placeholder-product.png"}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-red-500"
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {product.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                      {product.category}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.quantity > 0
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.quantity > 0 ? `In Stock: ${product.quantity}` : "Out of Stock"}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <div className="flex items-center justify-between w-full">
                    <div className="text-lg font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-primary hover:bg-primary/90"
                      disabled={product.quantity === 0}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Pagination Info */}
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
            Showing {products.length} products
          </div>
        </>
      )}
    </div>
  );
}
