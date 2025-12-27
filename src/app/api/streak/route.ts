import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const user = await User.findOne(
      { email: session.user.email },
      { currentStreak: 1, longestStreak: 1, lastActivityDate: 1 }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      lastActivityDate: user.lastActivityDate || null,
    });
  } catch (error) {
    console.error("Error fetching streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch streak" },
      { status: 500 }
    );
  }
}
