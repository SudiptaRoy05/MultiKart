import { NextResponse } from "next/server";

import { ObjectId } from "mongodb";
import { collectionNameObj, dbConnect } from "@/lib/dbConnect";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const productsCollection = await dbConnect(collectionNameObj.productCollection);
    const product = await productsCollection.findOne({ _id: new ObjectId(params.id) });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
