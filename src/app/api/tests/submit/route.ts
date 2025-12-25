import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";
import TestAttempt from "@/models/TestAttempt";

export async function POST(req: NextRequest) {
  try {
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWT | null;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { answers, timeTaken, subject } = body as {
      answers: { questionId: string; selectedOption: string }[];
      timeTaken: number;
      subject?: string;
    };
    if (!Array.isArray(answers) || typeof timeTaken !== "number") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await connectDB();
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    const graded = answers.map((ans) => {
      const q = questions.find((qq) => String(qq._id) === ans.questionId);
      const correct = q ? q.correctAnswer === ans.selectedOption : false;
      return { ...ans, correct };
    });

    const score = graded.filter((g) => g.correct).length;
    const attempt = await TestAttempt.create({
      userId: token.sub,
      answers: graded,
      score,
      timeTaken,
      subject,
    });

    return NextResponse.json({ score, attemptId: attempt._id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
