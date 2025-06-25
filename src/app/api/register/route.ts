import { NextResponse } from "next/server"
import { dbConnect, collectionNameObj } from "@/lib/dbConnect"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password, name } = body

        // Validate required fields
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            )
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            )
        }

        try {
            const userCollection = dbConnect(collectionNameObj.userCollection)
            
            // Check if user already exists
            const existingUser = await userCollection.findOne({ 
                email: email.toLowerCase() 
            })

            if (existingUser) {
                return NextResponse.json(
                    { error: "Email already registered" },
                    { status: 400 }
                )
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10)

            // Create user
            const result = await userCollection.insertOne({
                email: email.toLowerCase(),
                password: hashedPassword,
                name: name.trim(),
                createdAt: new Date(),
                role: "user"
            })

            return NextResponse.json({
                id: result.insertedId.toString(),
                email: email.toLowerCase(),
                name: name.trim()
            })
        } catch (dbError) {
            console.error("Database error during registration:", dbError)
            return NextResponse.json(
                { error: "Database connection error" },
                { status: 500 }
            )
        }
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
