import { NextResponse } from "next/server";
import { dbConnect, collectionNameObj } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ message: "User ID is required" }, { status: 400 });
  }

  try {
    const ordersCollection = await dbConnect(collectionNameObj.orderCollection);
    const wishlistCollection = await dbConnect(collectionNameObj.wishlistCollection);

    // Get total orders
    const totalOrders = await ordersCollection.countDocuments({
      userId: new ObjectId(userId)
    });

    // Get pending deliveries
    const pendingDeliveries = await ordersCollection.countDocuments({
      userId: new ObjectId(userId),
      status: { $in: ["processing", "shipped"] }
    });

    // Get wishlist items
    const wishlistItems = await wishlistCollection.countDocuments({
      userId: new ObjectId(userId)
    });

    // Get recent activity
    const recentOrders = await ordersCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    const activity = recentOrders.map(order => ({
      type: "order",
      title: `Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
      description: `Order #${order._id.toString().slice(-4)} is ${order.status}`,
      time: new Date(order.createdAt).toISOString(),
      status: order.status
    }));

    return NextResponse.json({
      stats: {
        totalOrders,
        wishlistItems,
        pendingDeliveries,
        activeCoupons: 0 // Placeholder for future coupon system
      },
      activity
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
} 