import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { collectionNameObj, dbConnect } from "@/lib/dbConnect";
import { NextRequest } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

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
    const productCollection = await dbConnect(collectionNameObj.productCollection);

    // Get user ID
    const user = await userCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate unique order ID
    const orderCount = await orderCollection.countDocuments();
    const orderId = `ORD${String(orderCount + 1).padStart(6, '0')}`;

    // Validate and update product quantities
    for (const item of orderData.items) {
      const product = await productCollection.findOne({ _id: new ObjectId(item.product._id) });
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.product.name}` }, { status: 404 });
      }
      if (product.quantity < item.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock for product: ${item.product.name}`,
          availableQuantity: product.quantity 
        }, { status: 400 });
      }

      // Update product quantity
      await productCollection.updateOne(
        { _id: new ObjectId(item.product._id) },
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Create the order
    const order = {
      userId: new ObjectId(user._id),
      orderId,
      items: orderData.items,
      shippingInfo: orderData.shippingInfo,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === "card" ? "paid" : "pending",
      totals: orderData.totals,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
      trackingInfo: {
        status: "pending",
        history: [{
          status: "pending",
          timestamp: new Date(),
          description: "Order placed successfully"
        }]
      }
    };

    const result = await orderCollection.insertOne(order);

    if (!result.insertedId) {
      throw new Error("Failed to create order");
    }

    // Clear user's cart
    await cartCollection.deleteMany({ userId: new ObjectId(user._id) });

    return NextResponse.json({ 
      message: "Order created successfully",
      orderId: result.insertedId,
      orderNumber: orderId
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
export async function GET(request: NextRequest) {
  try {
    console.log("Starting orders fetch...");
    
    const session = await getServerSession();
    if (!session?.user?.email) {
      console.log("No session or email found:", { session });
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    console.log("Query params:", { page, limit, search, status });

    try {
      // Connect to database
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

      // Build query
      const query: any = {
        userId: new ObjectId(user._id),
      };

      if (search) {
        query.orderId = { $regex: search, $options: "i" };
      }

      if (status && status !== "all") {
        query.status = status;
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

      // Format orders
      const formattedOrders = orders.map(order => ({
        ...order,
        _id: order._id.toString(),
      }));

      return NextResponse.json({
        orders: formattedOrders,
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
    console.error("Error in orders API:", {
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { 
        error: "Failed to fetch orders", 
        details: error.message,
        code: error.code 
      },
      { status: 500 }
    );
  }
} 