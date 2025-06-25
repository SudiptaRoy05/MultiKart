import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { collectionNameObj, dbConnect } from "@/lib/dbConnect"
import { CloudCog } from "lucide-react"

interface User {
  _id: string
  name: string
  email: string
  hashedPassword: string
  createdAt: Date
}

// Function to find user from DB
async function findUserByEmail(email: string) {
  const usersCollection = dbConnect<User>(collectionNameObj.userCollection)
  return await usersCollection.findOne({ email })
}

// Function to compare password
async function comparePassword(password: string, hash: string) {
  return await bcrypt.compare(password, hash)
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: "Email and password required" }, { status: 400 })
    }

    const user = await findUserByEmail(email)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 401 })
    }

    const passwordValid = await comparePassword(password, user.hashedPassword)
    if (!passwordValid) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 })
    }

    // Do NOT send back the password hash
    const { hashedPassword, ...safeUser } = user

    return NextResponse.json(safeUser, { status: 200 })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}

// console.log('pwd')