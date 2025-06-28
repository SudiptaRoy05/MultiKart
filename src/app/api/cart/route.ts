import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { collectionNameObj, dbConnect } from "@/lib/dbConnect";

// Get cart items
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartCollection = await dbConnect(collectionNameObj.cartCollection);
    const userCollection = await dbConnect(collectionNameObj.userCollection);

    // Get user ID
    const user = await userCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get cart items with product details
    const cartItems = await cartCollection
      .aggregate([
        { $match: { userId: new ObjectId(user._id) } },
        {
          $lookup: {
            from: collectionNameObj.productCollection,
            localField: "productId",
            foreignField: "_id",
            as: "product"
          }
        },
        { $unwind: "$product" }
      ])
      .toArray();

    return NextResponse.json({ cartItems });
  } catch (error) {
    console.error("Cart GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

// Add to cart
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await req.json();
    if (!productId || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cartCollection = await dbConnect(collectionNameObj.cartCollection);
    const userCollection = await dbConnect(collectionNameObj.userCollection);
    const productCollection = await dbConnect(collectionNameObj.productCollection);

    // Get user ID
    const user = await userCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check product exists and has enough stock
    const product = await productCollection.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }
    if (product.quantity < quantity) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
    }

    // Check if product already in cart
    const existingCartItem = await cartCollection.findOne({
      userId: new ObjectId(user._id),
      productId: new ObjectId(productId)
    });

    if (existingCartItem) {
      // Check if new total quantity exceeds stock
      const newQuantity = existingCartItem.quantity + quantity;
      if (newQuantity > product.quantity) {
        return NextResponse.json({ error: "Not enough stock for requested quantity" }, { status: 400 });
      }
      
      // Update quantity in cart
      await cartCollection.updateOne(
        { _id: existingCartItem._id },
        { $set: { quantity: newQuantity } }
      );
    } else {
      // Add new cart item
      await cartCollection.insertOne({
        userId: new ObjectId(user._id),
        productId: new ObjectId(productId),
        quantity,
        createdAt: new Date()
      });
    }

    return NextResponse.json({ message: "Added to cart successfully" });
  } catch (error) {
    console.error("Cart POST Error:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

// Update cart item quantity
export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartItemId, quantity } = await req.json();
    if (!cartItemId || !quantity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const cartCollection = await dbConnect(collectionNameObj.cartCollection);
    const userCollection = await dbConnect(collectionNameObj.userCollection);
    const productCollection = await dbConnect(collectionNameObj.productCollection);

    // Get user ID
    const user = await userCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get cart item
    const cartItem = await cartCollection.findOne({
      _id: new ObjectId(cartItemId),
      userId: new ObjectId(user._id)
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    // Check product stock
    const product = await productCollection.findOne({ _id: cartItem.productId });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (quantity > product.quantity) {
      return NextResponse.json({ error: "Not enough stock" }, { status: 400 });
    }

    // Update cart item
    await cartCollection.updateOne(
      { _id: new ObjectId(cartItemId), userId: new ObjectId(user._id) },
      { $set: { quantity } }
    );

    return NextResponse.json({ message: "Cart updated successfully" });
  } catch (error) {
    console.error("Cart PUT Error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

// Delete cart item
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartItemId } = await req.json();
    if (!cartItemId) {
      return NextResponse.json({ error: "Missing cart item ID" }, { status: 400 });
    }

    const cartCollection = await dbConnect(collectionNameObj.cartCollection);
    const userCollection = await dbConnect(collectionNameObj.userCollection);

    // Get user ID
    const user = await userCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete cart item
    const result = await cartCollection.deleteOne({
      _id: new ObjectId(cartItemId),
      userId: new ObjectId(user._id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Cart item deleted successfully" });
  } catch (error) {
    console.error("Cart DELETE Error:", error);
    return NextResponse.json({ error: "Failed to delete cart item" }, { status: 500 });
  }
} 