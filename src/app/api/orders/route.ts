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
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const orderCollection = await dbConnect(collectionNameObj.orderCollection);
    const userCollection = await dbConnect(collectionNameObj.userCollection);

    // Get user ID
    const user = await userCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Build query
    const query: any = { userId: new ObjectId(user._id) };
    if (status) {
      query.status = status;
    }

    // Get total count for pagination
    const totalOrders = await orderCollection.countDocuments(query);

    // Get user's orders with populated items
    const orders = await orderCollection
      .find(query)
      .sort({ [sort]: order === "desc" ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Calculate pagination info
    const totalPages = Math.ceil(totalOrders / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNextPage,
        hasPrevPage,
        limit
      }
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
} 