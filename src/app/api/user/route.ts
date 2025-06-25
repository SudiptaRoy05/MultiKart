import { NextResponse } from "next/server";
import { dbConnect, collectionNameObj } from "@/lib/dbConnect";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  try {
    const usersCollection = dbConnect(collectionNameObj.userCollection);
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { hashedPassword, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
