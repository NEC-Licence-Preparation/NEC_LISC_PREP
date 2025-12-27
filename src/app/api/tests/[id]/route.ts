import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import TestAttempt, { type IAnswer } from "@/models/TestAttempt";
import { Types } from "mongoose";
import Question from "@/models/Question";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const token = (await getToken({
      req: _req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWT | null;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id: attemptId } = await params;
    if (!attemptId)
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    await connectDB();

    const userIdStr = (token as any).userId || token.sub;
    const userObjectId = Types.ObjectId.isValid(String(userIdStr))
      ? new Types.ObjectId(String(userIdStr))
      : undefined;

    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId: userObjectId ?? (userIdStr as any),
    }).lean();
    if (!attempt)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const answers: IAnswer[] = Array.isArray(attempt.answers)
      ? (attempt.answers as IAnswer[])
      : [];
    const questionIds = answers.map((a: IAnswer) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    const breakdown = answers.map((a: IAnswer) => {
      const q = questions.find((qq) => String(qq._id) === String(a.questionId));
      return {
        questionId: String(a.questionId),
        question: q?.question || "Question not found",
        selected: a.selectedOption || "",
        correctAnswer: q?.correctAnswer || "",
        explanation: q?.explanation,
        correct: !!a.correct,
      };
    });

    return NextResponse.json({
      score: attempt.score,
      total: attempt.answers.length,
      timeTaken: attempt.timeTaken,
      subject: attempt.subject,
      date: attempt.date,
      breakdown,
    });
  } catch (e) {
    console.error("Error fetching attempt:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
