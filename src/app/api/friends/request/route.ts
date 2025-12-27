import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import FriendRequest from "@/models/FriendRequest";

// POST: Send friend request
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverId } = await req.json();

    if (!receiverId) {
      return NextResponse.json(
        { error: "Receiver ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const sender = await User.findOne({ email: session.user.email });
    if (!sender) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    // Check if request already exists
    const existing = await FriendRequest.findOne({
      $or: [
        { senderId: sender._id.toString(), receiverId },
        { senderId: receiverId, receiverId: sender._id.toString() },
      ],
    });

    if (existing) {
      return NextResponse.json(
        { error: "Friend request already exists" },
        { status: 400 }
      );
    }

    const friendRequest = await FriendRequest.create({
      senderId: sender._id.toString(),
      receiverId,
      status: "pending",
    });

    return NextResponse.json({ success: true, request: friendRequest });
  } catch (error) {
    console.error("Error sending friend request:", error);
    return NextResponse.json(
      { error: "Failed to send friend request" },
      { status: 500 }
    );
  }
}

// GET: Get pending friend requests (both sent and received)
export async function GET() {
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

    // Get received requests
    const received = await FriendRequest.find({
      receiverId: userId,
      status: "pending",
    });

    // Get sender details for received requests
    const receivedWithDetails = await Promise.all(
      received.map(async (req) => {
        const sender = await User.findById(req.senderId).select(
          "username name email faculty image"
        );
        return {
          ...req.toObject(),
          sender,
        };
      })
    );

    // Get sent requests
    const sent = await FriendRequest.find({
      senderId: userId,
      status: "pending",
    });

    // Get receiver details for sent requests
    const sentWithDetails = await Promise.all(
      sent.map(async (req) => {
        const receiver = await User.findById(req.receiverId).select(
          "username name email faculty image"
        );
        return {
          ...req.toObject(),
          receiver,
        };
      })
    );

    return NextResponse.json({
      received: receivedWithDetails,
      sent: sentWithDetails,
    });
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch friend requests" },
      { status: 500 }
    );
  }
}

// PATCH: Accept or reject friend request
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, action } = await req.json();

    if (!requestId || !action) {
      return NextResponse.json(
        { error: "Request ID and action are required" },
        { status: 400 }
      );
    }

    if (action !== "accept" && action !== "reject") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'accept' or 'reject'" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const friendRequest = await FriendRequest.findById(requestId);
    if (!friendRequest) {
      return NextResponse.json(
        { error: "Friend request not found" },
        { status: 404 }
      );
    }

    // Verify that the current user is the receiver
    if (friendRequest.receiverId !== user._id.toString()) {
      return NextResponse.json(
        { error: "You are not authorized to respond to this request" },
        { status: 403 }
      );
    }

    friendRequest.status = action === "accept" ? "accepted" : "rejected";
    await friendRequest.save();

    return NextResponse.json({ success: true, request: friendRequest });
  } catch (error) {
    console.error("Error updating friend request:", error);
    return NextResponse.json(
      { error: "Failed to update friend request" },
      { status: 500 }
    );
  }
}
