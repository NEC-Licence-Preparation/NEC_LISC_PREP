import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import TestAttempt from "@/models/TestAttempt";
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

    const userIdStr = (token as any).userId || token.sub;
    const userObjectId = Types.ObjectId.isValid(String(userIdStr))
      ? new Types.ObjectId(String(userIdStr))
      : null;

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
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    const count = latestByQuestion?.[0]?.count ?? 0;
    return NextResponse.json({ count });
  } catch (e) {
    console.error("Error counting wrong questions:", e);
    return NextResponse.json({ count: 0 }, { status: 200 });
  }
}
