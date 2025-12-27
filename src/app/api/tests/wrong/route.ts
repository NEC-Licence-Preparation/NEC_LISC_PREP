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

    // Get userId and faculty from token
    const userIdStr = (token as any).userId || token.sub;
    const userObjectId = Types.ObjectId.isValid(String(userIdStr))
      ? new Types.ObjectId(String(userIdStr))
      : null;

    const userFaculty = (token as any).faculty || null;

    // Build match stage with userId and optionally faculty
    const matchStage: any = userObjectId
      ? { userId: userObjectId }
      : { userId: userIdStr };

    // Filter by faculty if user has selected one
    if (userFaculty) {
      matchStage.faculty = userFaculty;
    }

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
