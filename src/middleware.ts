// import { getToken } from "next-auth/jwt"
// import { NextResponse } from "next/server"
// import type { NextRequest } from "next/server"

// export const middleware = async (req: NextRequest) => {
//     const pathname = req.nextUrl.pathname

//     try {
//         const token = await getToken({
//             req,
//             secret: process.env.NEXTAUTH_SECRET,
//             secureCookie: process.env.NODE_ENV === "production",
//         })

//         // For API routes that require authentication
//         if (pathname.startsWith('/api/') && 
//             (pathname.startsWith('/api/shop/') || 
//              pathname.startsWith('/api/user/') ||
//              pathname.startsWith('/api/cart/') ||
//              pathname.startsWith('/api/wishlist/') ||
//              pathname.startsWith('/api/orders/') ||
//              pathname.startsWith('/api/product/') ||
//              pathname.startsWith('/api/payments/') ||
//              pathname.startsWith('/api/create-payment-intent/'))) {
            
//             if (!token) {
//                 return new NextResponse(
//                     JSON.stringify({ 
//                         error: 'Authentication required',
//                         message: 'Please log in to access this resource' 
//                     }),
//                     { 
//                         status: 401, 
//                         headers: { 
//                             'content-type': 'application/json',
//                         } 
//                     }
//                 )
//             }

//             // Clone the request to modify headers
//             const requestHeaders = new Headers(req.headers)
//             // Use token.sub as the consistent user ID across the application
//             requestHeaders.set('x-user-id', token.sub as string)
//             requestHeaders.set('x-user-email', token.email as string)
//             requestHeaders.set('x-user-role', token.role as string)

//             // Return response with modified headers
//             return NextResponse.next({
//                 request: {
//                     headers: requestHeaders,
//                 }
//             })
//         }

//         // For protected pages
//         if (pathname.startsWith('/dashboard/') && !token) {
//             const url = new URL('/login', req.url)
//             url.searchParams.set('callbackUrl', pathname)
//             return NextResponse.redirect(url)
//         }

//         return NextResponse.next()
//     } catch (error) {
//         console.error('Middleware error:', error)
//         return new NextResponse(
//             JSON.stringify({ 
//                 error: 'Internal server error',
//                 message: 'An error occurred while processing your request' 
//             }),
//             { 
//                 status: 500, 
//                 headers: { 'content-type': 'application/json' } 
//             }
//         )
//     }
// }

// // Protect specific routes:
// // - /dashboard/* - All dashboard routes
// // - /api/shop/* - Shop-related API routes
// // - /api/user/* - User-related API routes
// // - /api/cart/* - Cart-related API routes
// // - /api/wishlist/* - Wishlist-related API routes
// // - /api/orders/* - Order-related API routes
// // - /api/product/* - Product management routes
// // - /api/payments/* - Payment-related routes
// // - /api/create-payment-intent/* - Stripe payment intent routes
// export const config = {
//     matcher: [
//         '/dashboard/:path*',
//         '/api/shop/:path*',
//         '/api/user/:path*',
//         '/api/cart/:path*',
//         '/api/wishlist/:path*',
//         '/api/orders/:path*',
//         '/api/product/:path*',
//         '/api/payments/:path*',
//         '/api/create-payment-intent/:path*'
//     ]
// }

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

        // Debug logging (remove in production)
        console.log('Middleware - pathname:', pathname)
        console.log('Middleware - token exists:', !!token)
        console.log('Middleware - token.sub:', token?.sub)

        // For API routes that require authentication
        if (pathname.startsWith('/api/') && 
            (pathname.startsWith('/api/shop/') ||
             pathname.startsWith('/api/user/') ||
             pathname.startsWith('/api/cart/') ||
             pathname.startsWith('/api/wishlist/') ||
             pathname.startsWith('/api/orders/') ||
             pathname.startsWith('/api/product/') ||
             pathname.startsWith('/api/payments/') ||
             pathname.startsWith('/api/create-payment-intent/'))) {
            
            if (!token || !token.sub) {
                return new NextResponse(
                    JSON.stringify({
                        error: 'Authentication required',
                        message: 'Please log in to access this resource'
                    }),
                    {
                        status: 401,
                        headers: {
                            'content-type': 'application/json',
                        }
                    }
                )
            }

            // Clone the request to modify headers
            const requestHeaders = new Headers(req.headers)
            
            // Use token.sub as the consistent user ID across the application
            requestHeaders.set('x-user-id', token.sub as string)
            
            // Safely set optional fields
            if (token.email) {
                requestHeaders.set('x-user-email', token.email as string)
            }
            if (token.role) {
                requestHeaders.set('x-user-role', token.role as string)
            }

            // Return response with modified headers
            return NextResponse.next({
                request: {
                    headers: requestHeaders,
                }
            })
        }

        // For protected pages
        if (pathname.startsWith('/dashboard/')) {
            if (!token || !token.sub) {
                const url = new URL('/login', req.url)
                url.searchParams.set('callbackUrl', pathname)
                return NextResponse.redirect(url)
            }
        }

        return NextResponse.next()
    } catch (error) {
        console.error('Middleware error:', error)
        return new NextResponse(
            JSON.stringify({
                error: 'Internal server error',
                message: 'An error occurred while processing your request'
            }),
            {
                status: 500,
                headers: { 'content-type': 'application/json' }
            }
        )
    }
}

// Protect specific routes:
// - /dashboard/* - All dashboard routes
// - /api/shop/* - Shop-related API routes
// - /api/user/* - User-related API routes
// - /api/cart/* - Cart-related API routes
// - /api/wishlist/* - Wishlist-related API routes
// - /api/orders/* - Order-related API routes
// - /api/product/* - Product management routes
// - /api/payments/* - Payment-related routes
// - /api/create-payment-intent/* - Stripe payment intent routes
export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/shop/:path*',
        '/api/user/:path*',
        '/api/cart/:path*',
        '/api/wishlist/:path*',
        '/api/orders/:path*',
        '/api/product/:path*',
        '/api/payments/:path*',
        '/api/create-payment-intent/:path*'
    ]
}