import { NextResponse } from "next/server";
import { collectionNameObj, dbConnect } from "@/lib/dbConnect";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const sort = searchParams.get("sort") || "newest";

    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "All Categories") {
      query.category = category;
    }

    // Build sort
    const sortQuery: any = {};
    switch (sort) {
      case "price-low":
        sortQuery.price = 1;
        break;
      case "price-high":
        sortQuery.price = -1;
        break;
      case "name-asc":
        sortQuery.name = 1;
        break;
      case "name-desc":
        sortQuery.name = -1;
        break;
      default: // newest
        sortQuery.createdAt = -1;
        break;
    }

    const productsCollection = await dbConnect(collectionNameObj.productCollection);

    // Get total count for pagination
    const totalProducts = await productsCollection.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    // Get products with pagination
    const products = await productsCollection
      .find(query)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Format ObjectId to string for JSON serialization
    const formattedProducts = products.map(product => ({
      ...product,
      _id: product._id.toString()
    }));

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
} 