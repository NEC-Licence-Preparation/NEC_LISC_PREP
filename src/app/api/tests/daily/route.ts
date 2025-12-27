import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import DailyQuestionSet from "@/models/DailyQuestionSet";
import Question from "@/models/Question";
import {
  seededShuffle,
  getTodayDate,
  generateSeed,
} from "@/lib/seededRandom";

export async function GET(req: NextRequest) {
  try {
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWT | null;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userFaculty = (token as any).faculty;
    if (!userFaculty)
      return NextResponse.json(
        { error: "Faculty not selected" },
        { status: 400 }
      );

    const set = new URL(req.url).searchParams.get("set") || "10";
    if (!["10", "100"].includes(set))
      return NextResponse.json({ error: "Invalid set" }, { status: 400 });

    await connectDB();

    const todayDate = getTodayDate();

    // Check if today's set exists
    let dailySet = await DailyQuestionSet.findOne({
      date: todayDate,
      faculty: userFaculty,
    }).lean();

    if (!dailySet) {
      // Generate new set
      const allQuestions = await Question.find({ faculty: userFaculty }).lean();

      if (allQuestions.length < 100) {
        return NextResponse.json(
          {
            error: `Not enough questions for ${userFaculty}. Need 100, have ${allQuestions.length}`,
          },
          { status: 400 }
        );
      }

      const seed = generateSeed(todayDate, userFaculty);
      const shuffled = seededShuffle(allQuestions, seed);

      const set10 = shuffled.slice(0, 10).map((q) => q._id);
      const set100 = shuffled.slice(0, 100).map((q) => q._id);

      dailySet = await DailyQuestionSet.create({
        date: todayDate,
        faculty: userFaculty,
        set10,
        set100,
      });
    }

    const setKey = set === "10" ? "set10" : "set100";
    const questionIds = dailySet[setKey as keyof typeof dailySet];

    // Fetch question details
    const questions = await Question.find({
      _id: { $in: questionIds },
    }).lean();

    // Return in same order as set
    const orderedQuestions = (questionIds as any[]).map((id) =>
      questions.find((q) => String(q._id) === String(id))
    );

    return NextResponse.json({
      date: todayDate,
      faculty: userFaculty,
      setSize: set,
      questions: orderedQuestions,
    });
  } catch (e) {
    console.error("Error fetching daily questions:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
