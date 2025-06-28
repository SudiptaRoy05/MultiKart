import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect, collectionNameObj } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    console.log("Starting order details fetch...");

    // Get session and validate authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      console.log("No session or email found:", { session });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = params;
    console.log("Fetching order:", { orderId });

    if (!orderId || !ObjectId.isValid(orderId)) {
      console.log("Invalid order ID:", { orderId });
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    try {
      // Connect to collections
      const ordersCollection = await dbConnect(collectionNameObj.orderCollection);
      const userCollection = await dbConnect(collectionNameObj.userCollection);

      console.log("Database connected successfully");

      // Get user ID
      const user = await userCollection.findOne({ email: session.user.email });
      if (!user) {
        console.log("User not found:", session.user.email);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      console.log("User found:", { userId: user._id });

      // Get the order
      const order = await ordersCollection.findOne({
        _id: new ObjectId(orderId),
        userId: new ObjectId(user._id)
      });

      if (!order) {
        console.log("Order not found:", { orderId, userId: user._id });
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      console.log("Order found:", { orderId: order._id });

      // Format order for response
      const formattedOrder = {
        ...order,
        _id: order._id.toString(),
      };

      return NextResponse.json({ order: formattedOrder });
    } catch (dbError: any) {
      console.error("Database operation error:", {
        message: dbError.message,
        code: dbError.code,
        stack: dbError.stack
      });
      throw new Error(`Database operation failed: ${dbError.message}`);
    }
  } catch (error: any) {
    console.error("Error in order details API:", {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch order details", 
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    console.log("Starting order update...");

    const session = await getServerSession();
    if (!session?.user?.email) {
      console.log("No session or email found:", { session });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = params;
    console.log("Updating order:", { orderId });

    if (!orderId || !ObjectId.isValid(orderId)) {
      console.log("Invalid order ID:", { orderId });
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
      console.log("Invalid status:", { status });
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    try {
      // Connect to collections
      const ordersCollection = await dbConnect(collectionNameObj.orderCollection);
      const userCollection = await dbConnect(collectionNameObj.userCollection);

      console.log("Database connected successfully");

      // Get user ID
      const user = await userCollection.findOne({ email: session.user.email });
      if (!user) {
        console.log("User not found:", session.user.email);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      console.log("User found:", { userId: user._id });

      // Get the order
      const order = await ordersCollection.findOne({
        _id: new ObjectId(orderId),
        userId: new ObjectId(user._id)
      });

      if (!order) {
        console.log("Order not found:", { orderId, userId: user._id });
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
      }

      console.log("Order found, updating status:", { orderId: order._id, newStatus: status });

      // Update order status
      const result = await ordersCollection.updateOne(
        { _id: new ObjectId(orderId), userId: new ObjectId(user._id) },
        {
          $set: {
            status,
            updatedAt: new Date(),
            "trackingInfo.status": status,
            "trackingInfo.history": [
              ...(order.trackingInfo?.history || []),
              {
                status,
                timestamp: new Date(),
                description: `Order ${status}`
              }
            ]
          }
        }
      );

      if (result.modifiedCount === 0) {
        console.log("Failed to update order:", { orderId, result });
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
      }

      console.log("Order updated successfully:", { orderId, status });

      // Get updated order
      const updatedOrder = await ordersCollection.findOne({
        _id: new ObjectId(orderId),
        userId: new ObjectId(user._id)
      });

      // Format order for response
      const formattedOrder = {
        ...updatedOrder,
        _id: updatedOrder._id.toString(),
      };

      return NextResponse.json({
        message: "Order updated successfully",
        order: formattedOrder
      });
    } catch (dbError: any) {
      console.error("Database operation error:", {
        message: dbError.message,
        code: dbError.code,
        stack: dbError.stack
      });
      throw new Error(`Database operation failed: ${dbError.message}`);
    }
  } catch (error: any) {
    console.error("Error in order update API:", {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        error: "Failed to update order", 
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    );
  }
} 