import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import TestAttempt from "@/models/TestAttempt";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get user's ID from session
    const userId = (session.user as any).id;

    // Get all test attempts for the user
    const attempts = await TestAttempt.find({ userId }).lean();

    // Calculate total stats
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalIncorrect = 0;

    // Stats by subject
    const subjectStats: Record<string, { total: number; correct: number; incorrect: number }> = {};

    attempts.forEach((attempt) => {
      const subject = attempt.subject || "General";
      
      if (!subjectStats[subject]) {
        subjectStats[subject] = { total: 0, correct: 0, incorrect: 0 };
      }

      attempt.answers.forEach((answer: any) => {
        totalQuestions++;
        subjectStats[subject].total++;

        if (answer.correct) {
          totalCorrect++;
          subjectStats[subject].correct++;
        } else {
          totalIncorrect++;
          subjectStats[subject].incorrect++;
        }
      });
    });

    // Calculate percentages
    const totalPercentage = totalQuestions > 0 
      ? Math.round((totalCorrect / totalQuestions) * 100) 
      : 0;

    const subjectStatsArray = Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      ...stats,
      percentage: stats.total > 0 
        ? Math.round((stats.correct / stats.total) * 100) 
        : 0,
    })).sort((a, b) => b.total - a.total); // Sort by total questions

    return NextResponse.json({
      total: {
        questions: totalQuestions,
        correct: totalCorrect,
        incorrect: totalIncorrect,
        percentage: totalPercentage,
        testsCompleted: attempts.length,
      },
      bySubject: subjectStatsArray,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
