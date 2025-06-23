import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    // Function that runs when middleware matches
    function middleware(req) {
        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        },
    }
)

export const config = {
    // Protected routes - add your protected routes here
    matcher: [
        // Protected API routes
        "/api/user/:path*",
        "/api/protected/:path*",
        
        // Protected pages
        "/dashboard/:path*",
        "/profile/:path*",
        "/settings/:path*",
    ]
} 