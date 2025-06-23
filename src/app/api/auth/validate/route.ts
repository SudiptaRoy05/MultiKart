import { NextResponse } from "next/server"
import { dbConnect, collectionNameObj } from "@/lib/dbConnect"
import bcrypt from "bcrypt"
import { MongoServerError } from "mongodb"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password } = body

        console.log("Validating credentials for:", email)

        if (!email || !password) {
            console.log("Missing fields:", { email: !!email, password: !!password })
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            console.log("Invalid email format:", email)
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            )
        }

        // Get user collection
        const userCollection = dbConnect(collectionNameObj.userCollection)

        // Find user by email
        const user = await userCollection.findOne({ 
            email: email.toLowerCase() // Case-insensitive email comparison
        })

        if (!user) {
            console.log("User not found:", email)
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            )
        }

        console.log("User found:", { id: user._id, email: user.email })

        // Ensure password field exists
        if (!user.password) {
            console.error("User found but password field is missing")
            return NextResponse.json(
                { error: "Account configuration error" },
                { status: 500 }
            )
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(password, user.password)
        console.log("Password validation:", { isValid: isPasswordValid })

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            )
        }

        // Return user data (excluding password)
        const { password: _, ...userWithoutPassword } = user
        return NextResponse.json({
            ...userWithoutPassword,
            id: user._id.toString(), // Convert ObjectId to string
            _id: user._id.toString() // Keep both for compatibility
        })
    } catch (error) {
        console.error("Validation error:", error)

        // Handle specific MongoDB errors
        if (error instanceof MongoServerError) {
            console.error("MongoDB error:", error.code, error.message)
            return NextResponse.json(
                { error: "Database error" },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
} 