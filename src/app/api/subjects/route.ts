import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";

export async function GET(req: Request) {
  try {
    const token = (await getToken({
      req: req as any,
      secret: process.env.NEXTAUTH_SECRET,
    })) as (JWT & { faculty?: string | null }) | null;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const filter: Record<string, unknown> = {};
    if (token.faculty) {
      filter.faculty = token.faculty;
    }

    // Get all questions and group by subject
    const questions = await Question.find(filter).select("subject");
    const subjectCounts = questions.reduce<Record<string, number>>((acc, q) => {
      const subject = q.subject || "General";
      acc[subject] = (acc[subject] || 0) + 1;
      return acc;
    }, {});

    // Return array of objects with subject and count
    const subjectsWithCounts = Object.entries(subjectCounts).map(
      ([subject, count]) => ({
        subject,
        count,
      })
    );

    return NextResponse.json(subjectsWithCounts);
  } catch (e) {
    console.error("Error fetching subjects:", e);
    // Return empty array instead of error object to prevent frontend crashes
    return NextResponse.json([]);
  }
}
