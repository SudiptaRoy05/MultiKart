"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import {  LogOut, Settings } from "lucide-react"
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
import { ModeToggle } from "./ModeToggle"

const Navbar = () => {
  const { data: session } = useSession()
  const isAuthenticated = !!session?.user
  const userName = session?.user?.name || session?.user?.email || 'User'
  const firstName = userName.split(' ')[0]
  const userImage = session?.user?.image

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

          <Link href="/allproduct" className="text-sm font-medium text-muted-foreground hover:text-red-600 transition-colors">
            Product
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

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* User Profile (Desktop) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm font-medium text-red-600">
                {firstName}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userImage || undefined} alt={firstName} />
                      <AvatarFallback className="bg-red-600 text-white">
                        {firstName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userName}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <ModeToggle />

          {/* Auth Buttons (Desktop) */}
          {!isAuthenticated && (
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
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="mt-6 flex flex-col items-center gap-4">
                {/* Mobile User Name Display */}
                {isAuthenticated && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2 pb-2 border-b w-full justify-center">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={userImage || undefined} alt={firstName} />
                      <AvatarFallback className="bg-red-600 text-white text-xs">
                        {firstName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-red-600">
                      {firstName}
                    </span>
                  </div>
                )}
                <Link href="/" className="text-lg font-medium text-red-600">Home</Link>
                <Link href="/shops" className="text-lg font-medium text-red-600">Shops</Link>
                <Link href="/about" className="text-lg font-medium text-red-600">About</Link>
                <Link href="/contact" className="text-lg font-medium text-red-600">Contact</Link>
                {isAuthenticated && (
                  <Link href="/dashboard" className="text-lg font-medium text-red-600">Dashboard</Link>
                )}
                <div className="mt-4 border-t pt-4 flex flex-col gap-2 w-full">
                  {!isAuthenticated ? (
                    <>
                      <Link href="/login">
                        <Button className="w-full bg-red-600 hover:bg-red-700">Login</Button>
                      </Link>
                      <Link href="/register">
                        <Button variant="outline" className="w-full text-red-600 border-red-600 hover:bg-red-50">Register</Button>
                      </Link>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-600 hover:bg-red-50"
                      onClick={() => signOut()}
                    >
                      Logout
                    </Button>
                  )}
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