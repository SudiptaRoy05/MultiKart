import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { dbConnect, collectionNameObj } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    // Get the session using authOptions
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Please log in to access this resource" },
        { status: 401 }
      );
    }

    // Get user ID from session
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Invalid Session", message: "User ID not found in session" },
        { status: 401 }
      );
    }

    // Connect to required collections
    const ordersCollection = await dbConnect(collectionNameObj.orderCollection);
    const wishlistCollection = await dbConnect(collectionNameObj.wishlistCollection);

    // Fetch stats
    const [totalOrders, pendingDeliveries, wishlistItems, recentOrders] = await Promise.all([
      ordersCollection.countDocuments({
        userId: new ObjectId(userId),
      }),
      ordersCollection.countDocuments({
        userId: new ObjectId(userId),
        status: { $in: ["processing", "shipped"] },
      }),
      wishlistCollection.countDocuments({
        userId: new ObjectId(userId),
      }),
      ordersCollection
        .find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray(),
    ]);

    // Transform recent orders into activity items
    const activity = recentOrders.map((order) => ({
      type: "order",
      title: `Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
      description: `Order #${order._id.toString().slice(-4)} is ${order.status}`,
      time: new Date(order.createdAt).toISOString(),
      status: order.status,
    }));

    return NextResponse.json({
      stats: {
        totalOrders,
        wishlistItems,
        pendingDeliveries,
        activeCoupons: 0, // Placeholder for future implementation
      },
      activity,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        message: "Failed to fetch user stats",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
