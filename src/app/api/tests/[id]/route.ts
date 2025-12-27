import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import TestAttempt from "@/models/TestAttempt";
import Question from "@/models/Question";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const token = (await getToken({
      req: _req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWT | null;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const resolved = await params;
    const attemptId = resolved?.id;
    if (!attemptId)
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    await connectDB();

    const userId = (token as any).userId || token.sub;
    const attempt = await TestAttempt.findOne({
      _id: attemptId,
      userId,
    }).lean();
    if (!attempt)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const questionIds = attempt.answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    const breakdown = attempt.answers.map((a) => {
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
