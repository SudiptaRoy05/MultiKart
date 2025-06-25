import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { dbConnect } from "@/lib/dbConnect"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing required fields")
        }

        try {
          const usersCollection = dbConnect("users")
          const user = await usersCollection.findOne({
            email: credentials.email.toLowerCase()
          })

          if (!user || !user.password) {
            throw new Error("Invalid credentials")
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          if (!isPasswordValid) {
            throw new Error("Invalid credentials")
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name
          }
        } catch (error) {
          console.error("Authorization error:", error)
          throw new Error("An error occurred during authentication")
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
    error: "/login"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always allow redirects to dashboard
      if (url.includes("/dashboard")) {
        return url
      }
      // Allow relative URLs
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Allow same origin URLs
      if (url.startsWith(baseUrl)) {
        return url
      }
      return baseUrl
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true // Enable debug mode to see what's happening
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
