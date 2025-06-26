"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useShop } from "@/app/hooks/shopContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";

interface Product {
    _id: string;
    name: string;
    description: string;
    category: string;
    sku: string;
    price: number;
    quantity: number;
    imageUrl: string;
    salePrice?: number;
}

export default function EditProductPage() {
    const router = useRouter();
    const params = useParams();
    const { data: session } = useSession();
    const { selectedShop } = useShop();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [product, setProduct] = useState<Product | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            if (!selectedShop?._id || !session?.user?.email || !params.productId) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/product?shopId=${selectedShop._id}&productId=${params.productId}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch product");
                }

                const data = await res.json();
                setProduct(data);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load product");
                router.push("/dashboard/product");
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [selectedShop?._id, session?.user?.email, params.productId, router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedShop?._id || !session?.user?.email || !product) return;

        setSaving(true);
        try {
            const formData = new FormData(e.currentTarget);
            const updateData = {
                productId: product._id,
                name: formData.get("name"),
                description: formData.get("description"),
                category: formData.get("category"),
                imageUrl: formData.get("imageUrl"),
                price: Number(formData.get("price")),
                quantity: Number(formData.get("quantity")),
                salePrice: formData.get("salePrice") ? Number(formData.get("salePrice")) : undefined,
                sku: formData.get("sku"),
                shopId: selectedShop._id,
                userEmail: session.user.email,
            };

            const res = await fetch("/api/product", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updateData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to update product");
            }

            toast.success("Product updated successfully");
            router.push("/dashboard/product");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to update product");
        } finally {
            setSaving(false);
        }
    };

    if (!selectedShop) {
        return (
            <div className="container mx-auto p-4">
                <p className="text-center text-gray-500">Please select a shop to edit products.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mx-auto p-4">
                <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="container mx-auto p-4">
                <p className="text-center text-gray-500">Product not found.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                            id="name"
                            name="name"
                            defaultValue={product.name}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={product.description}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            name="category"
                            defaultValue={product.category}
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="imageUrl">Image URL</Label>
                        <Input
                            id="imageUrl"
                            name="imageUrl"
                            type="url"
                            defaultValue={product.imageUrl}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="price">Price</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={product.price}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="salePrice">Sale Price (Optional)</Label>
                            <Input
                                id="salePrice"
                                name="salePrice"
                                type="number"
                                step="0.01"
                                min="0"
                                defaultValue={product.salePrice}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min="0"
                                defaultValue={product.quantity}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="sku">SKU</Label>
                            <Input
                                id="sku"
                                name="sku"
                                defaultValue={product.sku}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push("/dashboard/product")}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-red-500 text-white"
                            disabled={saving}
                        >
                            {saving ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
} 