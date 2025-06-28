'use server'
import { NextRequest, NextResponse } from "next/server";
import { dbConnect, collectionNameObj } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    // Get session and validate authentication
    const session = await getServerSession(authOptions);
    
    // Check if session exists and has user email
    if (!session?.user?.email) {
      console.error("Authentication failed:", { session });
      return NextResponse.json({ 
        message: "Unauthorized - Please sign in", 
        debug: { hasSession: !!session, hasUser: !!session?.user } 
      }, { status: 401 });
    }

    // Get shop ID from query params
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get("shopId");
    if (!shopId) {
      return NextResponse.json({ message: "Missing shopId parameter" }, { status: 400 });
    }

    // Debug logs
    console.log("API Request Info:", {
      userEmail: session.user.email,
      shopId
    });

    // Connect to collections
    const [ordersCollection, productsCollection, shopsCollection] = await Promise.all([
      dbConnect(collectionNameObj.orderCollection),
      dbConnect(collectionNameObj.productCollection),
      dbConnect(collectionNameObj.shopCollection)
    ]);

    // Validate shop ownership using owner.email
    const shop = await shopsCollection.findOne({
      _id: new ObjectId(shopId),
      "owner.email": session.user.email
    });

    if (!shop) {
      console.error("Shop access denied:", {
        shopId,
        userEmail: session.user.email,
        shop
      });
      return NextResponse.json({ 
        message: "Shop not found or access denied",
        debug: { shopId, userEmail: session.user.email }
      }, { status: 403 });
    }

    // Time ranges for statistics
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Helper function for revenue calculation
    const calculateRevenue = async (start: Date, end: Date = new Date()) => {
      const orders = await ordersCollection
        .find({
          shopId: new ObjectId(shopId),
          createdAt: { $gte: start, $lt: end },
          status: { $ne: "cancelled" },
        })
        .toArray();
      return orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    };

    // Fetch all data in parallel
    const [
      todayRevenue,
      weekRevenue,
      monthRevenue,
      lastMonthRevenue,
      orderStatusCounts,
      lowStockProducts,
      revenueData,
      totalProducts,
      totalOrders,
      monthlyOrders
    ] = await Promise.all([
      calculateRevenue(todayStart),
      calculateRevenue(weekStart),
      calculateRevenue(monthStart),
      calculateRevenue(lastMonthStart, lastMonthEnd),
      ordersCollection
        .aggregate([
          { $match: { shopId: new ObjectId(shopId), createdAt: { $gte: weekStart } } },
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ])
        .toArray(),
      productsCollection
        .find({ 
          shopId: new ObjectId(shopId), 
          stock: { $lt: 10, $gt: 0 } 
        })
        .toArray(),
      ordersCollection
        .aggregate([
          {
            $match: {
              shopId: new ObjectId(shopId),
              status: { $ne: "cancelled" },
              createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              revenue: { $sum: "$totalAmount" },
              orders: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray(),
      productsCollection.countDocuments({ shopId: new ObjectId(shopId) }),
      ordersCollection.countDocuments({ shopId: new ObjectId(shopId) }),
      ordersCollection.countDocuments({
        shopId: new ObjectId(shopId),
        createdAt: { $gte: monthStart },
        status: { $ne: "cancelled" },
      })
    ]);

    // Process order status counts
    const statusMap = {
      pending: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };

    orderStatusCounts.forEach((stat) => {
      const key = stat._id as keyof typeof statusMap;
      if (key in statusMap) {
        statusMap[key] = stat.count;
      }
    });

    // Calculate percentage changes
    const lastWeekRevenue = await calculateRevenue(
      new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    );

    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    // Prepare response
    const response = {
      shopInfo: {
        id: shop._id,
        name: shop.name,
        description: shop.description || "",
      },
      salesSummary: {
        today: {
          amount: todayRevenue,
          change: 0, // No previous day comparison
        },
        week: {
          amount: weekRevenue,
          change: calculatePercentageChange(weekRevenue, lastWeekRevenue),
        },
        month: {
          amount: monthRevenue,
          change: calculatePercentageChange(monthRevenue, lastMonthRevenue),
        },
      },
      orderStatus: statusMap,
      lowStockAlert: {
        count: lowStockProducts.length,
        products: lowStockProducts.map((p) => ({
          id: p._id,
          name: p.name,
          stock: p.stock,
          price: p.price,
        })),
      },
      revenueChart: revenueData.map((d) => ({
        date: d._id,
        revenue: d.revenue,
        orders: d.orders,
      })),
      quickStats: {
        totalProducts,
        totalOrders,
        averageOrderValue: monthlyOrders > 0 ? Math.round(monthRevenue / monthlyOrders) : 0,
      },
    };

    return NextResponse.json(response);
  } catch (err) {
    console.error("Seller overview error:", err);
    return NextResponse.json(
      { 
        message: "Failed to load seller overview", 
        error: err instanceof Error ? err.message : String(err) 
      }, 
      { status: 500 }
    );
  }
}