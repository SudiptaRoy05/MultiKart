import { collectionNameObj, dbConnect } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const skip = (page - 1) * limit;

    // Connect to product collection
    const productsCollection = await dbConnect(collectionNameObj.productCollection);

    // Count total documents
    const totalProducts = await productsCollection.countDocuments();

    // Fetch products with optional pagination
    const products = await productsCollection
      .find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();

    const totalPages = Math.ceil(totalProducts / limit);

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasMore: page < totalPages,
        limit,
      },
    });
  } catch (error) {
    console.error("[GET_PRODUCTS_ERROR]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
