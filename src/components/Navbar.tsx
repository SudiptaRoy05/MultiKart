"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { LogOut, Settings, ShoppingCart, Menu, User, Home, Store, Info, Mail, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "./ModeToggle"

const Navbar = () => {
  const router = useRouter()
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user
  const userName = session?.user?.name || session?.user?.email || "User"
  const firstName = userName.split(" ")[0]
  const userImage = session?.user?.image

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/allproduct", label: "Products", icon: Package },
    { href: "/shops", label: "Shops", icon: Store },
    { href: "/about", label: "About", icon: Info },
    { href: "/contact", label: "Contact", icon: Mail },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full flex h-16 items-center justify-between px-4 md:px-8">
        
        {/* Enhanced Logo */}
        <Link
          href="/"
          className="group flex items-center space-x-2 text-2xl font-bold transition-all duration-300 hover:scale-105"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white shadow-lg transition-all duration-300 group-hover:shadow-xl group-hover:shadow-red-500/25">
            <ShoppingCart className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
            MultiKart
          </span>
        </Link>

        {/* Enhanced Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
            >
              <item.icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              <span>{item.label}</span>
              <div className="absolute inset-x-0 -bottom-0.5 h-0.5 scale-x-0 rounded-full bg-gradient-to-r from-red-600 to-red-700 transition-transform duration-200 group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        {/* Enhanced Right Side */}
        <div className="flex items-center gap-3">
          
          {/* Enhanced Cart Icon */}
          <Button
            variant="ghost"
            size="icon"
            className="group relative h-10 w-10 rounded-xl transition-all duration-200 hover:bg-red-50 hover:scale-105 dark:hover:bg-red-950/20"
            onClick={() => router.push("/cart")}
          >
            <ShoppingCart className="h-5 w-5 text-red-600 transition-transform duration-200 group-hover:scale-110" />
            <Badge 
              variant="destructive" 
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs font-bold shadow-lg animate-pulse"
            >
              3
            </Badge>
          </Button>

          {/* Enhanced User Profile (Desktop) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-3">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-foreground">Welcome back,</span>
                <span className="text-xs font-medium text-red-600">{firstName}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-transparent transition-all duration-200 hover:ring-red-200 dark:hover:ring-red-800">
                    <Avatar className="h-10 w-10 border-2 border-red-100 dark:border-red-900">
                      <AvatarImage src={userImage || undefined} alt={firstName} />
                      <AvatarFallback className="bg-gradient-to-br from-red-600 to-red-700 text-white font-semibold">
                        {firstName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 rounded-xl border-0 bg-background/95 p-2 shadow-xl backdrop-blur-sm" align="end" forceMount>
                  <DropdownMenuLabel className="p-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12 border-2 border-red-100 dark:border-red-900">
                        <AvatarImage src={userImage || undefined} alt={firstName} />
                        <AvatarFallback className="bg-gradient-to-br from-red-600 to-red-700 text-white">
                          {firstName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-semibold leading-none">{userName}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session?.user?.email}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem asChild className="cursor-pointer rounded-lg p-3 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20">
                    <Link href="/dashboard" className="flex items-center">
                      <Settings className="mr-3 h-4 w-4 text-red-600" />
                      <span className="font-medium">Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-2" />
                  <DropdownMenuItem 
                    className="cursor-pointer rounded-lg p-3 text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-950/20" 
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span className="font-medium">Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Mode Toggle */}
          <ModeToggle />

          {/* Enhanced Auth Buttons (Desktop) */}
          {!isAuthenticated && (
            <div className="hidden md:flex gap-2">
              <Link href="/login">
                <Button 
                  variant="default" 
                  className="bg-gradient-to-r from-red-600 to-red-700 font-semibold shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-red-500/25"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button 
                  variant="outline" 
                  className="border-red-200 font-semibold text-red-600 transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:scale-105 dark:border-red-800 dark:hover:bg-red-950/20"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Enhanced Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden h-10 w-10 rounded-xl transition-all duration-200 hover:bg-red-50 hover:scale-105 dark:hover:bg-red-950/20"
              >
                <Menu className="h-5 w-5 text-red-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 rounded-l-2xl border-0 bg-background/95 backdrop-blur-sm">
              <div className="flex flex-col h-full">
                
                {/* Mobile Header */}
                <div className="flex items-center space-x-3 py-6 border-b border-border/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white">
                    <ShoppingCart className="h-5 w-5" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                    MultiKart
                  </span>
                </div>

                {/* User Info (Mobile) */}
                {isAuthenticated && (
                  <div className="flex items-center space-x-3 py-4 border-b border-border/50">
                    <Avatar className="h-12 w-12 border-2 border-red-100 dark:border-red-900">
                      <AvatarImage src={userImage || undefined} alt={firstName} />
                      <AvatarFallback className="bg-gradient-to-br from-red-600 to-red-700 text-white">
                        {firstName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">{firstName}</p>
                      <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                    </div>
                  </div>
                )}

                {/* Mobile Navigation */}
                <nav className="flex-1 py-6">
                  <div className="space-y-2">
                    {navigationItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center space-x-3 rounded-lg px-4 py-3 text-lg font-medium text-foreground transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                      >
                        <item.icon className="h-5 w-5 text-red-600" />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                    
                    <Link
                      href="/cart"
                      className="flex items-center space-x-3 rounded-lg px-4 py-3 text-lg font-medium text-foreground transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                    >
                      <ShoppingCart className="h-5 w-5 text-red-600" />
                      <span>Cart</span>
                      <Badge variant="destructive" className="ml-auto">3</Badge>
                    </Link>
                    
                    {isAuthenticated && (
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-3 rounded-lg px-4 py-3 text-lg font-medium text-foreground transition-all duration-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                      >
                        <Settings className="h-5 w-5 text-red-600" />
                        <span>Dashboard</span>
                      </Link>
                    )}
                  </div>
                </nav>

                {/* Mobile Auth Buttons */}
                <div className="border-t border-border/50 pt-6 space-y-3">
                  {!isAuthenticated ? (
                    <>
                      <Link href="/login" className="block">
                        <Button className="w-full bg-gradient-to-r from-red-600 to-red-700 font-semibold shadow-lg">
                          Sign In
                        </Button>
                      </Link>
                      <Link href="/register" className="block">
                        <Button variant="outline" className="w-full border-red-200 font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-red-200 font-semibold text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/20"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

export default Navbar