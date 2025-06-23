import { NextResponse } from "next/server"
import { dbConnect, collectionNameObj } from "@/lib/dbConnect"
import bcrypt from "bcrypt"

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { email, password, name } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

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
            name: name || email.split('@')[0],
            createdAt: new Date()
        })

        return NextResponse.json({
            id: result.insertedId.toString(),
            email: email.toLowerCase(),
            name: name || email.split('@')[0]
        })
    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
