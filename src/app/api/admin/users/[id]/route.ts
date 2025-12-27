import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import TestAttempt from "@/models/TestAttempt";
import { isAdministrator } from "@/app/api/admin/check/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    // Authorize using Administrator registry to reflect latest permissions
    const allowed = await isAdministrator(session.user.email);
    if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const user = await User.findById(id).lean();
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Aggregate user's performance
    const agg = await TestAttempt.aggregate([
      { $match: { userId: user._id } },
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
    ]);

    const stats = agg[0] || {
      testsCompleted: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      accuracy: 0,
    };

    return NextResponse.json({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        username: user.username || null,
        image: user.image || null,
        faculty: user.faculty || null,
        role: user.role,
        currentStreak: user.currentStreak || 0,
        longestStreak: user.longestStreak || 0,
        lastActivityDate: user.lastActivityDate || null,
        createdAt: user.createdAt || null,
      },
      stats: {
        testsCompleted: stats.testsCompleted,
        totalQuestions: stats.totalQuestions,
        correctAnswers: stats.correctAnswers,
        incorrectAnswers: (stats.totalQuestions || 0) - (stats.correctAnswers || 0),
        accuracy: Math.round(stats.accuracy || 0),
      },
    });
  } catch (error) {
    console.error("Admin user detail error:", error);
    return NextResponse.json({ error: "Failed to fetch user details" }, { status: 500 });
  }
}
