"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function Footer() {
    return (
        <footer className="w-full border-t">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and Newsletter */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold">
                                SHOP<span className="text-red-600">HUB</span>
                            </span>
                        </div>
                        <p className="text-muted-foreground max-w-md">
                            Discover the best products at unbeatable prices. Join our newsletter for exclusive deals and updates.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                                type="email"
                                placeholder="Your email"
                            />
                            <Button className="bg-red-600 hover:bg-red-700 text-white">
                                Subscribe
                            </Button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/" className="text-muted-foreground hover:text-red-600 transition-colors">Home</Link></li>
                            <li><Link href="/shop" className="text-muted-foreground hover:text-red-600 transition-colors">Shop</Link></li>
                            <li><Link href="/about" className="text-muted-foreground hover:text-red-600 transition-colors">About Us</Link></li>
                            <li><Link href="/contact" className="text-muted-foreground hover:text-red-600 transition-colors">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Customer Service</h3>
                        <ul className="space-y-2">
                            <li><Link href="/faq" className="text-muted-foreground hover:text-red-600 transition-colors">FAQs</Link></li>
                            <li><Link href="/shipping" className="text-muted-foreground hover:text-red-600 transition-colors">Shipping Policy</Link></li>
                            <li><Link href="/returns" className="text-muted-foreground hover:text-red-600 transition-colors">Return Policy</Link></li>
                            <li><Link href="/privacy" className="text-muted-foreground hover:text-red-600 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Shophub. All rights reserved.
                    </p>

                    <div className="flex space-x-4">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Facebook className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Twitter className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Instagram className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Linkedin className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <Github className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
}