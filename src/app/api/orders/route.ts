import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { collectionNameObj, dbConnect } from "@/lib/dbConnect";

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderData = await req.json();
    
    // Connect to MongoDB collections
    const orderCollection = await dbConnect(collectionNameObj.orderCollection);
    const userCollection = await dbConnect(collectionNameObj.userCollection);
    const cartCollection = await dbConnect(collectionNameObj.cartCollection);

    // Get user ID
    const user = await userCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create the order
    const order = {
      userId: new ObjectId(user._id),
      items: orderData.items,
      shippingInfo: orderData.shippingInfo,
      paymentMethod: orderData.paymentMethod,
      totals: orderData.totals,
      status: "pending",
      createdAt: new Date(),
    };

    const result = await orderCollection.insertOne(order);

    if (!result.insertedId) {
      throw new Error("Failed to create order");
    }

    // Clear user's cart
    await cartCollection.deleteMany({ userId: new ObjectId(user._id) });

    return NextResponse.json({ 
      message: "Order created successfully",
      orderId: result.insertedId 
    });

  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

// Get user's orders
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderCollection = await dbConnect(collectionNameObj.orderCollection);
    const userCollection = await dbConnect(collectionNameObj.userCollection);

    // Get user ID
    const user = await userCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get user's orders with populated items
    const orders = await orderCollection
      .find({ userId: new ObjectId(user._id) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 