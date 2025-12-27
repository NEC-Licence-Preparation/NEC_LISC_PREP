import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import Follow from "@/models/Follow";

// GET: list who current user is following
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const me = await User.findOne({ email: session.user.email });
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const follows = await Follow.find({ followerId: me._id.toString() });
    const followeeIds = follows.map((f) => f.followeeId);
    const users = await User.find({ _id: { $in: followeeIds } }).select(
      "username name email faculty image"
    );

    return NextResponse.json({ following: users, ids: followeeIds });
  } catch (error) {
    console.error("Error fetching following:", error);
    return NextResponse.json({ error: "Failed to fetch following" }, { status: 500 });
  }
}

// POST: follow a user
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { followeeId } = await req.json();
    if (!followeeId) {
      return NextResponse.json({ error: "followeeId is required" }, { status: 400 });
    }

    await connectDB();

    const me = await User.findOne({ email: session.user.email });
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (me._id.toString() === followeeId) {
      return NextResponse.json({ error: "You cannot follow yourself" }, { status: 400 });
    }

    const target = await User.findById(followeeId);
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await Follow.findOneAndUpdate(
      { followerId: me._id.toString(), followeeId },
      { followerId: me._id.toString(), followeeId },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error following user:", error);
    return NextResponse.json({ error: "Failed to follow user" }, { status: 500 });
  }
}

// DELETE: unfollow a user
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { followeeId } = await req.json();
    if (!followeeId) {
      return NextResponse.json({ error: "followeeId is required" }, { status: 400 });
    }

    await connectDB();

    const me = await User.findOne({ email: session.user.email });
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await Follow.deleteOne({ followerId: me._id.toString(), followeeId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return NextResponse.json({ error: "Failed to unfollow user" }, { status: 500 });
  }
}
