import React from 'react';
import { Search, ShoppingBag, Users, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function Hero() {
    return (
        <div className="relative bg-gradient-to-br from-red-50 via-white to-rose-50 dark:from-gray-900 dark:via-gray-950 dark:to-black min-h-screen flex items-center transition-colors duration-500 w-full">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden w-full">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-200 dark:bg-rose-900 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-rose-200 dark:bg-red-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            </div>

            <div className="relative w-full px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid lg:grid-cols-2 gap-12 items-center w-full max-w-none">
                    {/* Left Content */}
                    <div className="text-center lg:text-left w-full">
                        <Badge variant="secondary" className="mb-6 bg-red-100 text-red-800 hover:bg-red-200 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900 transition-colors">
                            <Star className="w-4 h-4 mr-2" />
                            Trusted by 10,000+ vendors
                        </Badge>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                            Your Gateway to
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600 dark:from-rose-400 dark:to-pink-300"> Endless</span>
                            <span className="block">Possibilities</span>
                        </h1>

                        <p className="text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                            Discover unique products from thousands of vendors worldwide. Shop, sell, and connect in our thriving marketplace community.
                        </p>

                        {/* Search Bar */}
                        <div className="relative mb-8 max-w-md mx-auto lg:mx-0">
                            <div className="flex items-center gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search for anything..."
                                        className="pl-10 h-12 border-2 focus:border-red-500 dark:border-gray-700 dark:focus:border-red-400"
                                    />
                                </div>
                                <Button size="lg" className="h-12 bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600 transition-colors">
                                    Search
                                </Button>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white shadow-lg dark:bg-red-500 dark:hover:bg-red-600">
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                Start Shopping
                            </Button>
                            <Button size="lg" variant="outline" className="border-2 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors">
                                <Users className="w-5 h-5 mr-2" />
                                Become a Vendor
                            </Button>
                        </div>

                        {/* Stats */}
                        <div className="flex justify-center lg:justify-start space-x-8 text-center">
                            <div>
                                <div className="text-2xl font-bold text-foreground">50K+</div>
                                <div className="text-muted-foreground text-sm">Products</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-foreground">10K+</div>
                                <div className="text-muted-foreground text-sm">Vendors</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-foreground">1M+</div>
                                <div className="text-muted-foreground text-sm">Happy Customers</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content - Visual Cards */}
                    <div className="relative w-full">
                        <div className="relative z-10">
                            <Card className="mb-6 transform rotate-3 hover:rotate-0 transition-transform duration-300 shadow-2xl dark:bg-gray-900 dark:border-gray-700">
                                <CardContent className="p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                                            <ShoppingBag className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="font-semibold text-foreground">Premium Store</h3>
                                            <p className="text-muted-foreground text-sm">Electronics & Gadgets</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-2xl font-bold text-foreground">$299.99</div>
                                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                            <Star className="w-4 h-4 fill-current mr-1" />
                                            4.9
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="transform -rotate-3 hover:rotate-0 transition-transform duration-300 ml-8 shadow-lg dark:bg-gray-900 dark:border-gray-700">
                                <CardContent className="p-4">
                                    <div className="flex items-center mb-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-rose-500 rounded-full flex items-center justify-center">
                                            <Users className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="font-semibold text-foreground text-sm">Fashion Hub</h3>
                                            <p className="text-muted-foreground text-xs">Clothing & Accessories</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="text-lg font-bold text-foreground">$89.99</div>
                                        <Badge variant="outline" className="text-xs dark:border-gray-600 dark:text-white">
                                            <Star className="w-3 h-3 fill-current mr-1" />
                                            4.7
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="absolute top-10 right-10 w-20 h-20 bg-red-200 dark:bg-red-900 rounded-full animate-bounce opacity-60"></div>
                        <div className="absolute bottom-10 left-10 w-16 h-16 bg-rose-200 dark:bg-rose-900 rounded-full animate-pulse opacity-60"></div>
                    </div>
                </div>
            </div>

            {/* Bottom Wave */}
            <div className="absolute bottom-0 left-0 right-0 w-full">
                <svg className="w-full h-20 text-background dark:text-gray-900" viewBox="0 0 1200 120" preserveAspectRatio="none">
                    <path
                        d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
                        fill="currentColor"
                    />
                </svg>
            </div>
        </div>
    );
}