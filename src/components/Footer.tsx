"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { Facebook, Twitter, Instagram, Linkedin, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

export function Footer() {
    const { theme } = useTheme();

    return (
        <footer className={`w-full ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'} border-t ${theme === 'dark' ? 'border-zinc-800' : 'border-gray-200'}`}>
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and Newsletter */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center">
                            <span className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                                SHOP<span className="text-red-600">HUB</span>
                            </span>
                        </div>
                        <p className={`${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'} max-w-md`}>
                            Discover the best products at unbeatable prices. Join our newsletter for exclusive deals and updates.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                                type="email"
                                placeholder="Your email"
                                className={`${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <Button className="bg-red-600 hover:bg-red-700 text-white">
                                Subscribe
                            </Button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link href="/" className={`hover:text-red-600 transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>Home</Link></li>
                            <li><Link href="/shop" className={`hover:text-red-600 transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>Shop</Link></li>
                            <li><Link href="/about" className={`hover:text-red-600 transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>About Us</Link></li>
                            <li><Link href="/contact" className={`hover:text-red-600 transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>Contact</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div className="space-y-4">
                        <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Customer Service</h3>
                        <ul className="space-y-2">
                            <li><Link href="/faq" className={`hover:text-red-600 transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>FAQs</Link></li>
                            <li><Link href="/shipping" className={`hover:text-red-600 transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>Shipping Policy</Link></li>
                            <li><Link href="/returns" className={`hover:text-red-600 transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>Return Policy</Link></li>
                            <li><Link href="/privacy" className={`hover:text-red-600 transition-colors ${theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <Separator className={`my-8 ${theme === 'dark' ? 'bg-zinc-800' : 'bg-gray-200'}`} />

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className={`text-sm ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}`}>
                        © {new Date().getFullYear()} Shophub. All rights reserved.
                    </p>

                    <div className="flex space-x-4">
                        <Button variant="ghost" size="icon" className={`rounded-full ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
                            <Facebook className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className={`rounded-full ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
                            <Twitter className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className={`rounded-full ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
                            <Instagram className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className={`rounded-full ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
                            <Linkedin className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className={`rounded-full ${theme === 'dark' ? 'hover:bg-zinc-800' : 'hover:bg-gray-100'}`}>
                            <Github className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </footer>
    );
}