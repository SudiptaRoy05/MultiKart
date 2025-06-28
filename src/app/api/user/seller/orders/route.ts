import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { dbConnect, collectionNameObj } from "@/lib/dbConnect";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    console.log("Starting seller orders fetch...");
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      console.log("No session or email found:", { session });
      return NextResponse.json(
        { error: "Please log in to access this resource" },
        { status: 401 }
      );
    }

    // Verify seller role
    if (session.user.role !== "seller") {
      console.log("User is not a seller:", session.user);
      return NextResponse.json(
        { error: "Access denied. Seller privileges required." },
        { status: 403 }
      );
    }

    try {
      // Connect to database
      const ordersCollection = await dbConnect(collectionNameObj.orderCollection);
      const userCollection = await dbConnect(collectionNameObj.userCollection);
      const shopCollection = await dbConnect(collectionNameObj.shopCollection);

      console.log("Database connected successfully");

      // Get user and their shop
      const user = await userCollection.findOne({ email: session.user.email });
      if (!user) {
        console.log("User not found:", session.user.email);
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const shop = await shopCollection.findOne({ userId: new ObjectId(user._id) });
      if (!shop) {
        console.log("Shop not found for user:", user._id);
        return NextResponse.json(
          { error: "No shop found. Please create a shop first." },
          { status: 404 }
        );
      }

      console.log("Found shop:", { shopId: shop._id });

      // Get query parameters
      const searchParams = request.nextUrl.searchParams;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const search = searchParams.get("search");
      const status = searchParams.get("status");
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      console.log("Query params:", { page, limit, search, status, startDate, endDate });

      // Build query
      const query: any = {
        "items.product.shopId": new ObjectId(shop._id)
      };

      if (search) {
        query.$or = [
          { orderId: { $regex: search, $options: "i" } },
          { "shippingInfo.firstName": { $regex: search, $options: "i" } },
          { "shippingInfo.lastName": { $regex: search, $options: "i" } },
          { "shippingInfo.email": { $regex: search, $options: "i" } }
        ];
      }

      if (status && status !== "all") {
        query.status = status;
      }

      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      console.log("Built query:", JSON.stringify(query, null, 2));

      // Calculate skip value for pagination
      const skip = (page - 1) * limit;

      // Get total count for pagination
      const totalItems = await ordersCollection.countDocuments(query);
      const totalPages = Math.ceil(totalItems / limit);

      console.log("Pagination info:", { totalItems, totalPages, skip, limit });

      // Fetch orders with pagination
      const orders = await ordersCollection
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      console.log(`Found ${orders.length} orders`);

      // Calculate statistics
      const stats = {
        total: totalItems,
        pending: await ordersCollection.countDocuments({ ...query, status: "pending" }),
        processing: await ordersCollection.countDocuments({ ...query, status: "processing" }),
        shipped: await ordersCollection.countDocuments({ ...query, status: "shipped" }),
        delivered: await ordersCollection.countDocuments({ ...query, status: "delivered" }),
        cancelled: await ordersCollection.countDocuments({ ...query, status: "cancelled" }),
        totalRevenue: orders.reduce((acc, order) => {
          const shopItems = order.items.filter(
            (item: any) => item.product.shopId.toString() === shop._id.toString()
          );
          return acc + shopItems.reduce(
            (itemAcc: number, item: any) => itemAcc + (item.product.price * item.quantity),
            0
          );
        }, 0)
      };

      // Format orders
      const formattedOrders = orders.map(order => ({
        ...order,
        _id: order._id.toString(),
        items: order.items.map((item: any) => ({
          ...item,
          _id: item._id.toString(),
          product: {
            ...item.product,
            _id: item.product._id.toString(),
            shopId: item.product.shopId.toString()
          }
        }))
      }));

      return NextResponse.json({
        orders: formattedOrders,
        stats,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
        },
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
    console.error("Error in seller orders API:", {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch seller orders", 
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    );
  }
} 