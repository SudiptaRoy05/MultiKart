// next-auth.d.ts (create this file at your project root or inside types/)
import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    name: string
    email: string
    role: string
  }

  interface Session {
    user: User & {
      id: string
      name: string
      email: string
      role: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name: string
    email: string
    role: string
  }
}
