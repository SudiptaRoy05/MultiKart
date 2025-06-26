import { getToken } from "next-auth/jwt"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export const middleware = async (req: NextRequest) => {
    const pathname = req.nextUrl.pathname

    try {
        const token = await getToken({
            req,
            secret: process.env.NEXTAUTH_SECRET,
            secureCookie: process.env.NODE_ENV === "production",
        })

        // For API routes that require authentication
        if (pathname.startsWith('/api/') && 
            (pathname.startsWith('/api/shop/') || 
             pathname.startsWith('/api/user/') ||
             pathname.startsWith('/api/cart/') ||
             pathname.startsWith('/api/wishlist/'))) {
            if (!token) {
                return new NextResponse(
                    JSON.stringify({ error: 'Authentication required' }),
                    { status: 401, headers: { 'content-type': 'application/json' } }
                )
            }
            return NextResponse.next()
        }

        // For protected pages
        if (pathname.startsWith('/dashboard/') && !token) {
            const url = new URL('/login', req.url)
            url.searchParams.set('callbackUrl', pathname)
            return NextResponse.redirect(url)
        }

        return NextResponse.next()
    } catch (error) {
        console.error('Middleware error:', error)
        return NextResponse.redirect(new URL('/login', req.url))
    }
}

// Protect specific routes:
// - /dashboard/* - All dashboard routes
// - /api/shop/* - Shop-related API routes
// - /api/user/* - User-related API routes
// - /api/cart/* - Cart-related API routes
// - /api/wishlist/* - Wishlist-related API routes
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/shop/:path*',
        '/api/user/:path*',
        '/api/cart/:path*',
        '/api/wishlist/:path*',
    ]
}