import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { collectionNameObj, dbConnect } from "@/lib/dbConnect";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const shopId = searchParams.get("shopId");
    
    if (!shopId) {
      return NextResponse.json({ error: "Shop ID is required" }, { status: 400 });
    }

    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the product collection
    const productsCollection = await dbConnect(collectionNameObj.productCollection);

    // Fetch products for the shop
    const products = await productsCollection
      .find({ shopId })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(products);
  } catch (error) {
    console.error("[GET_PRODUCTS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      category,
      imageUrl,
      price,
      quantity,
      salePrice,
      sku,
      shopId,
      userEmail,
    } = body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !category ||
      !imageUrl ||
      !price ||
      !quantity ||
      !shopId ||
      !userEmail
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate session
    const session = await getServerSession(authOptions);
    if (!session || session.user?.email !== userEmail) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the product collection
    const productsCollection = await dbConnect(collectionNameObj.productCollection);

    // Create product document
    const newProduct = {
      name,
      description,
      category,
      imageUrl,
      price: Number(price),
      quantity: Number(quantity),
      salePrice: salePrice ? Number(salePrice) : null,
      sku: sku || `SKU-${Date.now()}`,
      shopId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await productsCollection.insertOne(newProduct);

    return NextResponse.json(
      { success: true, productId: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADD_PRODUCT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
