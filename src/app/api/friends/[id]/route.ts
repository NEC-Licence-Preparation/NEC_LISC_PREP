import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import FriendRequest from "@/models/FriendRequest";
import TestAttempt from "@/models/TestAttempt";

// GET: Get friend's profile and stats
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: friendId } = await params;

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id.toString();

    // Get friend details
    const friend = await User.findById(friendId).select(
      "username name email faculty image currentStreak longestStreak"
    );

    if (!friend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    // Check friendship
    const friendship = await FriendRequest.findOne({
      $or: [
        { senderId: userId, receiverId: friendId, status: "accepted" },
        { senderId: friendId, receiverId: userId, status: "accepted" },
      ],
    });

    // If not friends, return limited profile
    if (!friendship) {
      return NextResponse.json({
        limited: true,
        friend: {
          id: friend._id,
          username: friend.username,
          name: friend.name,
          faculty: friend.faculty,
          image: friend.image,
        },
      });
    }

    // Get friend's test statistics (only for friends)
    const attempts = await TestAttempt.find({ userId: friendId });

    let totalQuestions = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    const subjectStats: Record<
      string,
      { total: number; correct: number; incorrect: number }
    > = {};

    attempts.forEach((attempt) => {
      const questions = attempt.answers.length;
      const correct = attempt.score;
      const incorrect = questions - correct;

      totalQuestions += questions;
      correctAnswers += correct;
      incorrectAnswers += incorrect;

      if (!subjectStats[attempt.subject]) {
        subjectStats[attempt.subject] = { total: 0, correct: 0, incorrect: 0 };
      }

      subjectStats[attempt.subject].total += questions;
      subjectStats[attempt.subject].correct += correct;
      subjectStats[attempt.subject].incorrect += incorrect;
    });

    return NextResponse.json({
      limited: false,
      friend: {
        id: friend._id,
        username: friend.username,
        name: friend.name,
        email: friend.email,
        faculty: friend.faculty,
        image: friend.image,
        currentStreak: friend.currentStreak || 0,
        longestStreak: friend.longestStreak || 0,
      },
      stats: {
        testsCompleted: attempts.length,
        totalQuestions,
        correctAnswers,
        incorrectAnswers,
        accuracy:
          totalQuestions > 0
            ? Math.round((correctAnswers / totalQuestions) * 100)
            : 0,
        subjectStats,
      },
    });
  } catch (error) {
    console.error("Error fetching friend profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch friend profile" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a friend connection
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: friendId } = await params;

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user._id.toString();

    // Delete any friend request document representing this friendship
    const result = await FriendRequest.deleteMany({
      $or: [
        { senderId: userId, receiverId: friendId, status: "accepted" },
        { senderId: friendId, receiverId: userId, status: "accepted" },
      ],
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Friend connection not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing friend:", error);
    return NextResponse.json(
      { error: "Failed to remove friend" },
      { status: 500 }
    );
  }
}
