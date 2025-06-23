// next-auth.d.ts (create this file at your project root or inside types/)
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
  }

  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name?: string | null
    email?: string | null
  }
}
