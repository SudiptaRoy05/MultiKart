"use client";

import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import { useShop } from "@/app/hooks/shopContext";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface Product {
    _id: string;
    name: string;
    sku: string;
    price: number;
    quantity: number;
    imageUrl: string;
    status: string;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case "Active":
            return "bg-green-500";
        case "Low Stock":
            return "bg-yellow-500";
        case "Out of Stock":
            return "bg-red-500";
        default:
            return "bg-gray-500";
    }
};

const getProductStatus = (quantity: number): string => {
    if (quantity === 0) return "Out of Stock";
    if (quantity <= 5) return "Low Stock";
    return "Active";
};

export default function ProductsPage() {
    const { selectedShop } = useShop();
    const { data: session } = useSession();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; productId: string | null }>({
        open: false,
        productId: null,
    });

    const handleDeleteClick = (productId: string) => {
        setDeleteDialog({ open: true, productId });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteDialog.productId || !selectedShop?._id || !session?.user?.email) return;
        
        setIsDeleting(deleteDialog.productId);
        try {
            const res = await fetch(
                `/api/product?productId=${deleteDialog.productId}&shopId=${selectedShop._id}`,
                {
                    method: "DELETE",
                }
            );

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || "Failed to delete product");
            }

            // Remove the product from the state
            setProducts((prev) => prev.filter((p) => p._id !== deleteDialog.productId));
            toast.success("Product deleted successfully");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to delete product");
        } finally {
            setIsDeleting(null);
            setDeleteDialog({ open: false, productId: null });
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            if (!selectedShop?._id || !session?.user?.email) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`/api/product?shopId=${selectedShop._id}`);
                if (!res.ok) {
                    throw new Error("Failed to fetch products");
                }

                const data = await res.json();
                const productsWithStatus = data.map((product: any) => ({
                    ...product,
                    status: getProductStatus(product.quantity)
                }));
                setProducts(productsWithStatus);
            } catch (error) {
                console.error(error);
                toast.error("Failed to load products");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [selectedShop?._id, session?.user?.email]);

    if (!selectedShop) {
        return (
            <div className="container mx-auto p-4">
                <p className="text-center text-gray-500">Please select a shop to view products.</p>
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

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Products for {selectedShop.name}</h2>
                <Link href="/dashboard/addproduct">
                    <Button className="bg-red-500 text-white">+ Add Product</Button>
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No products found. Start by adding a product.</p>
                    <Link href="/dashboard/addproduct">
                        <Button className="mt-4 bg-red-500 text-white">Add Your First Product</Button>
                    </Link>
                </div>
            ) : (
                <>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>SKU</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product) => (
                                <TableRow key={product._id}>
                                    <TableCell>
                                        <Image
                                            src={product.imageUrl}
                                            alt={product.name}
                                            width={48}
                                            height={48}
                                            className="object-cover rounded"
                                        />
                                    </TableCell>
                                    <TableCell>{product.name}</TableCell>
                                    <TableCell>{product.sku}</TableCell>
                                    <TableCell>${product.price.toFixed(2)}</TableCell>
                                    <TableCell>{product.quantity}</TableCell>
                                    <TableCell>
                                        <span
                                            className={`px-2 py-1 rounded-full text-white ${getStatusColor(
                                                product.status
                                            )}`}
                                        >
                                            {product.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/product/edit/${product._id}`}>
                                            <Button
                                                variant="ghost"
                                                className="text-blue-500 hover:text-blue-700 mr-2"
                                            >
                                                Edit
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDeleteClick(product._id)}
                                            disabled={isDeleting === product._id}
                                        >
                                            {isDeleting === product._id ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                                            ) : (
                                                "Delete"
                                            )}
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, productId: open ? deleteDialog.productId : null })}>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle className="text-red-500">Confirm Deletion</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete this product? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter className="sm:justify-start">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setDeleteDialog({ open: false, productId: null })}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    className="bg-red-500 text-white hover:bg-red-600"
                                    onClick={handleDeleteConfirm}
                                    disabled={isDeleting !== null}
                                >
                                    {isDeleting !== null ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        "Delete Product"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
}
