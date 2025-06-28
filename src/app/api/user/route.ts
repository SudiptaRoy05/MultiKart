import { NextResponse } from "next/server";
import { dbConnect, collectionNameObj } from "@/lib/dbConnect";
import { getServerSession } from "next-auth";

export async function GET(request: Request) {
  try {
    // Get the session to verify authentication
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get email from query params
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Verify user is requesting their own data
    if (email !== session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCollection = await dbConnect(collectionNameObj.userCollection);
    const user = await userCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive information
    const { password, ...safeUser } = user;

    return NextResponse.json({
      ...safeUser,
      _id: safeUser._id.toString()
    });
  } catch (error) {
    console.error("User fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
} 