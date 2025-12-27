import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import TestAttempt from "@/models/TestAttempt";
import Bookmark from "@/models/Bookmark";
import FriendRequest from "@/models/FriendRequest";
import Ticket from "@/models/Ticket";

// PATCH: Update username
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = await req.json();

    if (!username || username.trim().length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    // Check if username is alphanumeric with underscores only
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json(
        { error: "Username can only contain letters, numbers, and underscores" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if username is already taken
    const existing = await User.findOne({ username: username.toLowerCase() });
    if (existing && existing.email !== session.user.email) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 400 }
      );
    }

    await User.updateOne(
      { email: session.user.email },
      { $set: { username: username.toLowerCase() } }
    );

    return NextResponse.json({ success: true, username: username.toLowerCase() });
  } catch (error) {
    console.error("Error updating username:", error);
    return NextResponse.json(
      { error: "Failed to update username" },
      { status: 500 }
    );
  }
}

// DELETE: Delete account
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id.toString();

    // Delete all user data
    await Promise.all([
      User.deleteOne({ email: session.user.email }),
      TestAttempt.deleteMany({ userId }),
      Bookmark.deleteMany({ userEmail: session.user.email }),
      FriendRequest.deleteMany({
        $or: [{ senderId: userId }, { receiverId: userId }],
      }),
      Ticket.deleteMany({ userEmail: session.user.email }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
