import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ObjectId } from "mongodb";
import { collectionNameObj, dbConnect } from "@/lib/dbConnect";

// Get wishlist items
export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const wishlistCollection = await dbConnect(collectionNameObj.wishlistCollection);
    const userCollection = await dbConnect(collectionNameObj.userCollection);

    // Get user ID
    const user = await userCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get wishlist items with product details
    const wishlistItems = await wishlistCollection
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

    return NextResponse.json({ wishlistItems });
  } catch (error) {
    console.error("Wishlist GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

// Add to wishlist
export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const wishlistCollection = await dbConnect(collectionNameObj.wishlistCollection);
    const userCollection = await dbConnect(collectionNameObj.userCollection);
    const productCollection = await dbConnect(collectionNameObj.productCollection);

    // Get user ID
    const user = await userCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check product exists
    const product = await productCollection.findOne({ _id: new ObjectId(productId) });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if product already in wishlist
    const existingItem = await wishlistCollection.findOne({
      userId: new ObjectId(user._id),
      productId: new ObjectId(productId)
    });

    if (existingItem) {
      return NextResponse.json({ error: "Product already in wishlist" }, { status: 400 });
    }

    // Add to wishlist
    await wishlistCollection.insertOne({
      userId: new ObjectId(user._id),
      productId: new ObjectId(productId),
      createdAt: new Date()
    });

    return NextResponse.json({ message: "Added to wishlist successfully" });
  } catch (error) {
    console.error("Wishlist POST Error:", error);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

// Remove from wishlist
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    const wishlistCollection = await dbConnect(collectionNameObj.wishlistCollection);
    const userCollection = await dbConnect(collectionNameObj.userCollection);

    // Get user ID
    const user = await userCollection.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove from wishlist
    const result = await wishlistCollection.deleteOne({
      userId: new ObjectId(user._id),
      productId: new ObjectId(productId)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Item not found in wishlist" }, { status: 404 });
    }

    return NextResponse.json({ message: "Removed from wishlist successfully" });
  } catch (error) {
    console.error("Wishlist DELETE Error:", error);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
} 