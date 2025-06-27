"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

type CartItem = {
  _id: string;
  quantity: number;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
  };
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; itemId: string | null }>({
    isOpen: false,
    itemId: null,
  });

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) throw new Error("Failed to fetch cart items");
      const data = await response.json();
      setCartItems(data.cartItems);
    } catch (error) {
      toast.error("Failed to load cart items");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  // Update quantity
  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity: newQuantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update quantity");
      }

      setCartItems(prev =>
        prev.map(item =>
          item._id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
      toast.success("Cart updated successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Remove item
  const removeItem = async (cartItemId: string) => {
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId }),
      });

      if (!response.ok) throw new Error("Failed to remove item");

      setCartItems(prev => prev.filter(item => item._id !== cartItemId));
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error("Failed to remove item");
      console.error(error);
    } finally {
      setDeleteDialog({ isOpen: false, itemId: null });
    }
  };

  const handleDeleteClick = (itemId: string) => {
    setDeleteDialog({ isOpen: true, itemId });
  };

  // Calculate subtotal for an item
  const calculateSubtotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  // Calculate total with tax and shipping
  const subtotal = cartItems.reduce(
    (acc, item) => acc + calculateSubtotal(item.product.price, item.quantity),
    0
  );
  const shippingFee = 4.99;
  const taxRate = 0.1; // 10% tax
  const tax = subtotal * taxRate;
  const total = subtotal + shippingFee + tax;

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Shopping Cart</h1>
        <Badge variant="outline" className="ml-2">
          {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">Start shopping to add items to your cart</p>
          <Button asChild>
            <a href="/dashboard">Continue Shopping</a>
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-lg shadow-sm">
              {cartItems.map((item, index) => (
                <div key={item._id}>
                  <div className="p-6">
                    <div className="flex items-start gap-6">
                      <Avatar className="h-24 w-24 rounded-lg">
                        <AvatarImage 
                          src={item.product.images?.[0] || ''} 
                          alt={item.product.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="rounded-lg">PR</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h2 className="text-xl font-semibold mb-1">{item.product.name}</h2>
                            <p className="text-muted-foreground text-sm mb-4">Unit Price: ${item.product.price.toFixed(2)}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteClick(item._id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 bg-muted p-1 rounded-lg">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => item.quantity > 1 && updateQuantity(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="font-semibold">
                            ${calculateSubtotal(item.product.price, item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < cartItems.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${shippingFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax (10%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <Button className="w-full" size="lg" asChild>
                  <a href="/dashboard/checkout">Proceed to Checkout</a>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Free shipping on orders over $50
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => setDeleteDialog({ isOpen, itemId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this item from your cart? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ isOpen: false, itemId: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog.itemId && removeItem(deleteDialog.itemId)}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
