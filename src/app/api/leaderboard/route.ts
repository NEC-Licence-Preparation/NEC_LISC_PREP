import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import TestAttempt from "@/models/TestAttempt";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const limitParam = parseInt(searchParams.get("limit") || "50", 10);
    const limit = [20, 50, 100].includes(limitParam) ? limitParam : 50;

    // Aggregate performance by user
    const leaderboard = await TestAttempt.aggregate([
      {
        $group: {
          _id: "$userId",
          testsCompleted: { $sum: 1 },
          totalQuestions: { $sum: { $size: "$answers" } },
          correctAnswers: { $sum: "$score" },
        },
      },
      {
        $addFields: {
          accuracy: {
            $cond: [
              { $gt: ["$totalQuestions", 0] },
              { $multiply: [{ $divide: ["$correctAnswers", "$totalQuestions"] }, 100] },
              0,
            ],
          },
        },
      },
      { $sort: { accuracy: -1, correctAnswers: -1, testsCompleted: -1 } },
      { $limit: limit },
    ]);

    // Fetch user details for the top users
    const userIds = leaderboard.map((item) => item._id);
    const users = await User.find({ _id: { $in: userIds } }).select(
      "username name faculty image"
    );
    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const results = leaderboard
      .map((entry) => {
        const user = userMap.get(entry._id.toString());
        if (!user) return null;
        return {
          userId: entry._id,
          username: user.username,
          name: user.name,
          faculty: user.faculty,
          image: user.image,
          testsCompleted: entry.testsCompleted,
          totalQuestions: entry.totalQuestions,
          correctAnswers: entry.correctAnswers,
          incorrectAnswers: entry.totalQuestions - entry.correctAnswers,
          accuracy: Math.round(entry.accuracy),
        };
      })
      .filter(Boolean);

    return NextResponse.json({ leaderboard: results });
  } catch (error) {
    console.error("Error generating leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to load leaderboard" },
      { status: 500 }
    );
  }
}
