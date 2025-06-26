"use client";

import { notFound, useRouter } from "next/navigation";
import Image from "next/image";
import { Heart, ArrowLeft, ShoppingCart, Share2, Plus, Minus, Shield, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, use } from "react";
import toast from "react-hot-toast";
import { useShopping } from "@/app/hooks/useShoppingContext";

interface Product {
  _id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
  quantity: number;
  category: string;
  salePrice?: number;
  sku?: string;
  shop: {
    _id: string;
    name: string;
  };
}

interface PageProps {
  params: { id: string };
}

export default function ProductDetails({ params }: PageProps) {
  const router = useRouter();
  const { id } = params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addToCart, toggleWishlist, isInWishlist, refreshCart } = useShopping();

  // Update placeholder image path
  const productImages = [product?.imageUrl || "/images/placeholder.png"];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/allproducts/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch product");
        }
        const data = await res.json();
        setProduct(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Error loading product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      await addToCart(product._id, selectedQuantity);
      await refreshCart();
      toast.success("Added to cart!");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    await toggleWishlist(product._id);
  };

  const shareProduct = () => {
    if (navigator.share) {
      navigator.share({
        title: product?.name,
        text: product?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  const increaseQuantity = () => {
    if (product && selectedQuantity < product.quantity) {
      setSelectedQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (selectedQuantity > 1) {
      setSelectedQuantity(prev => prev - 1);
    }
  };

  const calculateDiscount = () => {
    if (product?.salePrice && product.salePrice !== product.price) {
      const discount = ((product.salePrice - product.price) / product.salePrice) * 100;
      return Math.round(discount);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded-md w-32 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-md"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded-md w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                <div className="h-4 bg-gray-200 rounded-md w-2/3"></div>
                <div className="h-12 bg-gray-200 rounded-md w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
            <p className="text-red-500 mb-6">{error || "Product not found"}</p>
            <Button onClick={() => router.push("/allproduct")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const discount = calculateDiscount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/allproduct")}
          className="mb-6 hover:bg-primary/10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={productImages[selectedImage] || "/images/placeholder.png"}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                  priority
                />
                {discount > 0 && (
                  <Badge className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1">
                    {discount}% OFF
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`absolute top-4 right-4 bg-white/90 backdrop-blur-sm hover:bg-white transition-all ${
                    isInWishlist(product._id) ? "text-red-500" : "text-gray-600"
                  }`}
                  onClick={handleToggleWishlist}
                >
                  <Heart className={`h-5 w-5 ${isInWishlist(product._id) ? "fill-current" : ""}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-16 bg-white/90 backdrop-blur-sm hover:bg-white transition-all text-gray-600"
                  onClick={shareProduct}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
              
              {/* Thumbnail Images - Only show if multiple images exist */}
              {productImages.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {productImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index 
                          ? "border-primary shadow-lg" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-6">
              <div>
                <Badge variant="secondary" className="mb-3">
                  {product.category}
                </Badge>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  {product.name}
                </h1>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {product.description}
              </p>

              {/* Price Section */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-3xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.salePrice && product.salePrice !== product.price && (
                    <span className="text-xl font-semibold text-gray-400 line-through">
                      ${product.salePrice.toFixed(2)}
                    </span>
                  )}
                  {discount > 0 && (
                    <Badge variant="destructive">Save {discount}%</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${
                    product.quantity > 0 ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  <span className={`font-medium ${
                    product.quantity > 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
                  }`}>
                    {product.quantity > 0 ? `${product.quantity} in Stock` : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Product Details */}
              <div className="space-y-4">
                {product.sku && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-600 dark:text-gray-400">SKU:</span>
                    <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                      {product.sku}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Category:</span>
                  <Badge variant="outline">{product.category}</Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Availability:</span>
                  <span className={product.quantity > 0 ? "text-green-600" : "text-red-600"}>
                    {product.quantity > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </div>

              {/* Quantity Selector */}
              {product.quantity > 0 && (
                <div className="flex items-center gap-4">
                  <span className="font-medium">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={decreaseQuantity}
                      disabled={selectedQuantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-4 py-2 min-w-[3rem] text-center font-medium">
                      {selectedQuantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={increaseQuantity}
                      disabled={selectedQuantity >= product.quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  disabled={product.quantity === 0 || addingToCart} 
                  className="flex-1 h-12 text-lg font-semibold bg-primary hover:bg-primary/90 transition-all"
                  onClick={handleAddToCart}
                >
                  {addingToCart ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button variant="outline" className="h-12 px-6">
                  Buy Now
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col items-center text-center">
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <Truck className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Free Shipping</span>
                </div>
                <div className="flex flex-col items-center text-center">
                  <RotateCcw className="h-8 w-8 text-primary mb-2" />
                  <span className="text-sm font-medium">Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}