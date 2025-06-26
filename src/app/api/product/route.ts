import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { collectionNameObj, dbConnect } from "@/lib/dbConnect";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const shopId = searchParams.get("shopId");
    const productId = searchParams.get("productId");
    const featured = searchParams.get("featured");
    
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
    const { ObjectId } = require("mongodb");

    // If productId is provided, fetch a single product
    if (productId) {
      const product = await productsCollection.findOne({
        _id: new ObjectId(productId),
        shopId: shopId,
      });

      if (!product) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      return NextResponse.json(product);
    }

    // If featured is provided, fetch featured products
    if (featured === "true") {
      const products = await productsCollection
        .find({ shopId, featured: true })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json(products);
    }

    // Otherwise, fetch all products for the shop
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
      featured = false,
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
      featured,
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

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    const shopId = searchParams.get("shopId");

    if (!productId || !shopId) {
      return NextResponse.json(
        { error: "Product ID and Shop ID are required" },
        { status: 400 }
      );
    }

    // Validate session
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the product collection
    const productsCollection = await dbConnect(collectionNameObj.productCollection);

    // Delete the product
    const { ObjectId } = require("mongodb");
    const result = await productsCollection.deleteOne({
      _id: new ObjectId(productId),
      shopId: shopId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Product not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE_PRODUCT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      productId,
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

    if (!productId || !shopId) {
      return NextResponse.json(
        { error: "Product ID and Shop ID are required" },
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

    // Prepare update data
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Only include fields that are provided
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (price) updateData.price = Number(price);
    if (quantity !== undefined) updateData.quantity = Number(quantity);
    if (salePrice) updateData.salePrice = Number(salePrice);
    if (sku) updateData.sku = sku;

    // Update the product
    const { ObjectId } = require("mongodb");
    const result = await productsCollection.updateOne(
      {
        _id: new ObjectId(productId),
        shopId: shopId,
      },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Product not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UPDATE_PRODUCT_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// New method to toggle featured status
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, featured, shopId, userEmail } = body;

    if (!productId || !shopId || featured === undefined) {
      return NextResponse.json(
        { error: "Product ID, Shop ID, and featured status are required" },
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

    // Update the featured status
    const { ObjectId } = require("mongodb");
    const result = await productsCollection.updateOne(
      {
        _id: new ObjectId(productId),
        shopId: shopId,
      },
      {
        $set: {
          featured: featured,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Product not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[UPDATE_FEATURED_STATUS_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
