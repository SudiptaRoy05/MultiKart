import { NextResponse } from "next/server";
import { collectionNameObj, dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";

// Get single product by ID (public)
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const productsCollection = await dbConnect(collectionNameObj.productCollection);
    
    const product = await productsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Format ObjectId to string for JSON serialization
    const formattedProduct = {
      ...product,
      _id: product._id.toString()
    };

    return NextResponse.json(formattedProduct);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
