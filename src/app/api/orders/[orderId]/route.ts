import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { dbConnect, collectionNameObj } from "@/lib/dbConnect";

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCollection = await dbConnect(collectionNameObj.userCollection);
    const orderCollection = await dbConnect(collectionNameObj.orderCollection);

    // Get user ID
    const user = await userCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get order details
    const order = await orderCollection.findOne({
      _id: new ObjectId(params.orderId),
      userId: new ObjectId(user._id)
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Order GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch order details" },
      { status: 500 }
    );
  }
} 