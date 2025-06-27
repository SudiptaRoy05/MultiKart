"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { StripeCheckoutForm } from "@/components/StripeCheckoutForm";

type PaymentMethod = "card" | "cash";

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

type ShippingInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [clientSecret, setClientSecret] = useState<string>("");
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Bangladesh",
  });

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const response = await fetch("/api/cart");
        if (!response.ok) throw new Error("Failed to fetch cart items");
        const data = await response.json();
        setCartItems(data.cartItems);
      } catch (error) {
        toast.error("Failed to load cart items");
        console.error(error);
      }
    };

    fetchCartItems();
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const shippingFee = 4.99;
  const taxRate = 0.1; // 10% tax
  const tax = subtotal * taxRate;
  const total = subtotal + shippingFee + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = Object.entries(shippingInfo);
    const emptyFields = requiredFields.filter(([_, value]) => !value.trim());
    
    if (emptyFields.length > 0) {
      toast.error(`Please fill in all required fields`);
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    // Phone validation for Bangladesh (11 digits starting with 01)
    const phoneRegex = /^01\d{9}$/;
    if (!phoneRegex.test(shippingInfo.phone.replace(/\D/g, ''))) {
      toast.error("Please enter a valid Bangladesh phone number (e.g., 01712345678)");
      return false;
    }

    // Basic postal code validation for Bangladesh (4 digits)
    const zipRegex = /^\d{4}$/;
    if (!zipRegex.test(shippingInfo.zipCode)) {
      toast.error("Please enter a valid postal code (4 digits)");
      return false;
    }

    return true;
  };

  const createPaymentIntent = async () => {
    try {
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: total,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data = await response.json();
      setClientSecret(data.clientSecret);
    } catch (error) {
      console.error("Payment intent error:", error);
      toast.error("Failed to initialize payment");
    }
  };

  useEffect(() => {
    if (paymentMethod === "card" && total > 0) {
      createPaymentIntent();
    }
  }, [paymentMethod, total]);

  const handlePaymentSuccess = async () => {
    try {
      // Create order after successful payment
      const orderData = {
        items: cartItems,
        shippingInfo,
        paymentMethod,
        totals: {
          subtotal,
          shipping: shippingFee,
          tax,
          total
        }
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      // Clear cart
      await fetch("/api/cart", {
        method: "DELETE",
      });

      router.push("/dashboard/orders");
    } catch (error) {
      console.error("Order creation error:", error);
      toast.error("Payment successful but failed to create order");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (paymentMethod === "cash") {
      setLoading(true);
      try {
        // Handle cash on delivery order
        const orderData = {
          items: cartItems,
          shippingInfo,
          paymentMethod,
          totals: {
            subtotal,
            shipping: shippingFee,
            tax,
            total
          }
        };

        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          throw new Error("Failed to create order");
        }

        // Clear cart
        await fetch("/api/cart", {
          method: "DELETE",
        });

        toast.success("Order placed successfully!");
        router.push("/dashboard/orders");
      } catch (error) {
        console.error("Checkout error:", error);
        toast.error("Failed to place order. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Enter your shipping details</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName"
                      name="firstName"
                      placeholder="Mehedi"
                      value={shippingInfo.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName"
                      name="lastName"
                      placeholder="Hassan"
                      value={shippingInfo.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    placeholder="mehedi.hassan@example.com"
                    value={shippingInfo.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="01712345678"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input 
                    id="address"
                    name="address"
                    placeholder="House #123, Road #12, Block A"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input 
                      id="city"
                      name="city"
                      placeholder="Dhaka"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Division</Label>
                    <Input 
                      id="state"
                      name="state"
                      placeholder="Dhaka"
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Postal Code</Label>
                    <Input 
                      id="zipCode"
                      name="zipCode"
                      placeholder="1212"
                      value={shippingInfo.zipCode}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input 
                      id="country"
                      name="country"
                      value="Bangladesh"
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose how you want to pay</CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: string) => setPaymentMethod(value as PaymentMethod)}
                className="space-y-4"
              >
                <div className="flex items-center space-x-4 border rounded-lg p-4">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex-1">
                    <div className="font-semibold">Credit/Debit Card</div>
                    <div className="text-sm text-muted-foreground">Pay securely with your card</div>
                  </Label>
                  <div className="flex space-x-2">
                    <img src="/visa.svg" alt="Visa" className="h-8 w-auto" />
                    <img src="/mastercard.svg" alt="Mastercard" className="h-8 w-auto" />
                  </div>
                </div>

                {paymentMethod === "card" && clientSecret && (
                  <div className="mt-4 space-y-4 border rounded-lg p-6">
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                      <StripeCheckoutForm 
                        clientSecret={clientSecret}
                        onSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  </div>
                )}

                <div className="flex items-center space-x-4 border rounded-lg p-4">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex-1">
                    <div className="font-semibold">Cash on Delivery</div>
                    <div className="text-sm text-muted-foreground">Pay when you receive your order</div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {cartItems.map(item => (
                  <div key={item._id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>${(item.product.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>${shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              {paymentMethod === "cash" && (
                <Button 
                  className="w-full" 
                  size="lg" 
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Place Order"}
                </Button>
              )}

              <p className="text-sm text-muted-foreground text-center">
                By placing your order, you agree to our{" "}
                <a href="#" className="underline">Terms & Conditions</a>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 