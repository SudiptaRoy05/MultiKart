import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { dbConnect, collectionNameObj } from "@/lib/dbConnect";

interface ShopDetails {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  userName: string;
  userEmail: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ShopDetails;
    const { name, description, category, imageUrl, userName, userEmail } = body;

    // Validate all required fields
    if (!name || !description || !category || !imageUrl || !userName || !userEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate session and user identity
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the specific collections
    const shopsCollection = await dbConnect(collectionNameObj.shopCollection);
    const usersCollection = await dbConnect(collectionNameObj.userCollection);

    // Check for existing shop name
    const existingShop = await shopsCollection.findOne({ name });
    if (existingShop) {
      return NextResponse.json({ error: "Shop name already exists" }, { status: 409 });
    }

    // Create the new shop document
    const newShop = {
      name,
      description,
      category,
      imageUrl,
      owner: {
        name: userName,
        email: userEmail,
      },
      createdAt: new Date(),
    };

    // Insert the shop
    await shopsCollection.insertOne(newShop);

    // Update user's role to "seller"
    const updateResult = await usersCollection.updateOne(
      { email: userEmail },
      { $set: { role: "seller" } }
    );

    if (updateResult.matchedCount === 0) {
      console.warn("User not found for role update:", userEmail);
    }

    // Respond with success
    return NextResponse.json({ success: true, shop: newShop }, { status: 201 });
  } catch (error) {
    console.error("[SHOP_CREATE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}




export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    const shopsCollection = dbConnect(collectionNameObj.shopCollection);

    let shops;

    if (email) {
      shops = await shopsCollection.find({ "owner.email": email }).toArray();
    } else {
      shops = await shopsCollection.find({}).toArray();
    }

    // Convert _id ObjectId to string (optional but recommended)
    const shopsFormatted = shops.map(shop => ({
      ...shop,
      _id: shop._id.toString(),
      createdAt: shop.createdAt.toISOString(),
    }));

    return NextResponse.json({ shops: shopsFormatted });
  } catch (error) {
    console.error("Failed to fetch shops:", error);
    return NextResponse.json({ error: "Failed to fetch shops" }, { status: 500 });
  }
}
