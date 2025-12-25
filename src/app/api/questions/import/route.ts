import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";
import {
  FlatImportSchema,
  ImportSchema,
  QuizImportSchema,
} from "@/lib/validation";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWT | null;
    const cookieStore = await cookies();
    const unlocked = cookieStore.get("admin_unlock")?.value === "1";
    if (!unlocked && (!token || token.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Accept either detailed schema or simplified quiz schema
    const parsedGrouped = ImportSchema.safeParse(data);
    if (parsedGrouped.success) {
      await connectDB();
      const { subject, faculty, questions } = parsedGrouped.data;
      const docs = questions.map((q) => ({
        ...q,
        explanation: q.explanation ?? "",
        subject,
        faculty,
      }));
      const result = await Question.insertMany(docs);
      return NextResponse.json({ inserted: result.length, format: "grouped" });
    }

    const parsedFlat = FlatImportSchema.safeParse(data);
    if (parsedFlat.success) {
      await connectDB();
      const docs = parsedFlat.data.map((q) => ({
        ...q,
        explanation: q.explanation ?? "",
      }));
      const result = await Question.insertMany(docs);
      return NextResponse.json({ inserted: result.length, format: "flat" });
    }

    const parsedQuiz = QuizImportSchema.safeParse(data);
    if (parsedQuiz.success) {
      await connectDB();
      const { title, desc, questions } = parsedQuiz.data;
      const docs = questions.map((q) => ({
        question: q.q,
        options: q.options,
        correctAnswer: q.answer,
        explanation: q.explanation ?? "",
        subject: title,
        faculty: desc || "General",
      }));
      const result = await Question.insertMany(docs);
      return NextResponse.json({ inserted: result.length, format: "quiz" });
    }

    return NextResponse.json(
      {
        error: "Invalid JSON",
        details: {
          detailed: parsedDetailed.error?.flatten?.(),
          quiz: parsedQuiz.error?.flatten?.(),
        },
      },
      { status: 400 }
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
