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
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";

type CartItem = {
  _id: string;
  quantity: number;
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    variant?: string;
  };
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; itemId: string | null }>({
    isOpen: false,
    itemId: null,
  });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const router = useRouter();

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
      setSelectedItems(prev => prev.filter(id => id !== cartItemId));
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

  // Toggle select all items
  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item._id));
    }
  };

  // Toggle single item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Calculate subtotal for selected items
  const subtotal = cartItems
    .filter(item => selectedItems.includes(item._id))
    .reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const shippingFee = 0;
  const tax = 0;
  const total = subtotal + shippingFee + tax;

  const handleProceedToCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select items to checkout");
      return;
    }
    router.push("/dashboard/checkout");
  };

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
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
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
          <>
            <div className="flex items-center justify-between bg-card p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium leading-none">
                  Select All ({cartItems.length} items)
                </label>
              </div>
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => selectedItems.length > 0 && setDeleteDialog({ isOpen: true, itemId: 'multiple' })}
                disabled={selectedItems.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>

            <Separator />

            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {cartItems.map((item) => (
                  <Card key={item._id} className="p-6">
                    <div className="flex items-start gap-6">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`select-${item._id}`}
                          checked={selectedItems.includes(item._id)}
                          onCheckedChange={() => toggleItemSelection(item._id)}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h2 className="text-xl font-semibold mb-1">{item.product.name}</h2>
                            <p className="text-muted-foreground text-sm mb-2">
                              {item.product.variant || 'Standard Edition'}
                            </p>
                            <p className="text-lg font-semibold mb-4">
                              ${item.product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-3 border rounded-lg p-2">
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(item._id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
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
                        <span className="text-muted-foreground">Tax</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center space-x-2">
                      <Checkbox id="promo-code" />
                      <label htmlFor="promo-code" className="text-sm font-medium leading-none">
                        Enter a promo code
                      </label>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      Apply
                    </Button>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <Button 
                      className="w-full mt-6" 
                      size="lg"
                      onClick={handleProceedToCheckout}
                      disabled={selectedItems.length === 0}
                    >
                      Proceed to Checkout
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        <Dialog open={deleteDialog.isOpen} onOpenChange={(isOpen) => !isOpen && setDeleteDialog({ isOpen: false, itemId: null })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {deleteDialog.itemId === 'multiple' ? 'these items' : 'this item'} from your cart?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialog({ isOpen: false, itemId: null })}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (deleteDialog.itemId === 'multiple') {
                    selectedItems.forEach(itemId => removeItem(itemId));
                  } else if (deleteDialog.itemId) {
                    removeItem(deleteDialog.itemId);
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}