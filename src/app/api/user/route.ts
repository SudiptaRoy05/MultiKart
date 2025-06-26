import { NextResponse } from "next/server";
import { dbConnect, collectionNameObj } from "@/lib/dbConnect";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  try {
    const usersCollection = await dbConnect(collectionNameObj.userCollection);
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Convert _id to string and remove sensitive data
    const { hashedPassword, ...safeUser } = user;
    const formattedUser = {
      ...safeUser,
      _id: safeUser._id.toString()
    };

    return NextResponse.json(formattedUser);
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
