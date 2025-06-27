import { NextRequest, NextResponse } from "next/server";
import { dbConnect, collectionNameObj } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { 
      productId,
      amount,
      paymentMethod,
      status,
      orderId
    } = body;

    // Validate required fields
    if (!productId || !amount || !paymentMethod || !status || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to the payments collection
    const paymentCollection = await dbConnect(collectionNameObj.paymentCollection);

    // Create payment record
    const paymentDetails = {
      userId: session.user.id,
      productId,
      orderId,
      amount,
      paymentMethod,
      status,
      userEmail: session.user.email,
      userName: session.user.name,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Insert payment details into database
    const result = await paymentCollection.insertOne(paymentDetails);

    if (!result.acknowledged) {
      return NextResponse.json(
        { error: "Failed to save payment details" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Payment details saved successfully",
      paymentId: result.insertedId,
      paymentDetails
    }, { status: 201 });

  } catch (error) {
    console.error("Payment API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 