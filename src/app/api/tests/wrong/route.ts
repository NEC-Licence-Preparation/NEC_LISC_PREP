import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import TestAttempt from "@/models/TestAttempt";
import Question from "@/models/Question";
import { Types } from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWT | null;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // Get userId from token (stored for OAuth users) or use token.sub (for credential users)
    const userIdStr = (token as any).userId || token.sub;
    const userObjectId = Types.ObjectId.isValid(String(userIdStr))
      ? new Types.ObjectId(String(userIdStr))
      : null;

    // Aggregate to find latest correctness per question for this user
    const matchStage = userObjectId
      ? { userId: userObjectId }
      : { userId: userIdStr };

    const latestByQuestion = await TestAttempt.aggregate([
      { $match: matchStage },
      { $sort: { date: -1 } },
      { $unwind: "$answers" },
      {
        $group: {
          _id: "$answers.questionId",
          latestCorrect: { $first: "$answers.correct" },
          lastDate: { $first: "$date" },
        },
      },
      { $match: { latestCorrect: false } },
    ]);

    const wrongIds = latestByQuestion.map((g: any) => g._id).filter(Boolean);
    if (!wrongIds.length) return NextResponse.json([]);

    // Return up to 10 wrong questions
    const questions = await Question.find({ _id: { $in: wrongIds } })
      .limit(10)
      .lean();

    return NextResponse.json(questions);
  } catch (e) {
    console.error("Error fetching wrong questions:", e);
    return NextResponse.json([], { status: 200 });
  }
}
