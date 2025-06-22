"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import { ModeToggle } from "./ModeToggle"


const Navbar = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-background/80 backdrop-blur">
            <div className="w-full flex h-16 items-center justify-between px-4 md:px-8">
                {/* Logo */}
                <Link
                    href="/"
                    className="text-2xl font-bold text-red-600 hover:text-red-700 transition-colors"
                >
                    MultiKart
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-red-600 transition-colors">
                        Home
                    </Link>
                    <Link href="/shops" className="text-sm font-medium text-muted-foreground hover:text-red-600 transition-colors">
                        Shops
                    </Link>
                    <Link href="/about" className="text-sm font-medium text-muted-foreground hover:text-red-600 transition-colors">
                        About
                    </Link>
                    <Link href="/contact" className="text-sm font-medium text-muted-foreground hover:text-red-600 transition-colors">
                        Contact
                    </Link>
                </nav>

                {/* Right side actions */}
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <div className="hidden md:flex gap-2">
                        <Link href="/login">
                            <Button variant="default" className="bg-red-600 hover:bg-red-700">
                                Login
                            </Button>
                        </Link>
                        <Link href="/register">
                            <Button variant="outline" className="text-red-600 border-red-600 hover:bg-red-50">
                                Register
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5 text-red-600" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-64">
                            <nav className="mt-6 flex flex-col items-center gap-4">
                                <Link href="/" className="text-lg font-medium text-red-600">
                                    Home
                                </Link>
                                <Link href="/shops" className="text-lg font-medium text-red-600">
                                    Shops
                                </Link>
                                <Link href="/about" className="text-lg font-medium text-red-600">
                                    About
                                </Link>
                                <Link href="/contact" className="text-lg font-medium text-red-600">
                                    Contact
                                </Link>
                                <div className="mt-4 border-t pt-4 flex flex-col gap-2">
                                    <Link href="/login">
                                        <Button className="w-full bg-red-600 hover:bg-red-700">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/register">
                                        <Button variant="outline" className="w-full text-red-600 border-red-600 hover:bg-red-50">
                                            Register
                                        </Button>
                                    </Link>
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}

export default Navbar
