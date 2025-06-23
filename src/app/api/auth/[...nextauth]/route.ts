import NextAuth, { NextAuthOptions, Session, User } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { JWT } from "next-auth/jwt"

// Extend the built-in session and JWT types to include custom fields
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            name?: string | null
            email?: string | null
            image?: string | null
        }
    }

    interface User {
        id: string
        name?: string | null
        email?: string | null
        image?: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string
        name?: string | null
        email?: string | null
    }
}

if (!process.env.NEXTAUTH_URL) {
    throw new Error("Please set NEXTAUTH_URL environment variable")
}

if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("Please set NEXTAUTH_SECRET environment variable")
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email", placeholder: "example@gmail.com" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Missing required fields")
                }

                try {
                    const res = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/validate`, {
                        method: 'POST',
                        headers: { 
                            "Content-Type": "application/json",
                            "Accept": "application/json"
                        },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password
                        })
                    })

                    const data = await res.json()

                    if (!res.ok) {
                        throw new Error(data.error || "Authentication failed")
                    }

                    if (!data.id) {
                        throw new Error("Invalid response from server")
                    }

                    return {
                        id: data.id,
                        email: data.email,
                        name: data.name
                    }
                } catch (error: any) {
                    console.error("Auth error:", error)
                    throw new Error(error.message || "Authentication failed")
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
        error: '/login', // Redirect back to login page on error
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user?: User }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
            }
            return token
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            if (token && session.user) {
                session.user.id = token.id
                session.user.email = token.email as string
                session.user.name = token.name as string
            }
            return session
        },
    },
    session: {
        strategy: "jwt" as const,
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }