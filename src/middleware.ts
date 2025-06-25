import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    // Function that runs when middleware matches
    function middleware(req) {
        // Add debug logging
        console.log('Middleware Debug:')
        console.log('URL:', req.url)
        console.log('NextAuth Token:', !!req.nextauth?.token)
        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                console.log('Auth check token:', !!token)
                return !!token
            }
        },
        pages: {
            signIn: '/login',
        }
    }
)

// Protect dashboard routes
export const config = {
    matcher: ['/dashboard/:path*']
}