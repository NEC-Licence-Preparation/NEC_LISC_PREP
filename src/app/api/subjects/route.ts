import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";

export async function GET() {
  try {
    await connectDB();
    const subjects = await Question.distinct("subject");
    return NextResponse.json(subjects);
  } catch (e) {
    console.error("Error fetching subjects:", e);
    // Return empty array instead of error object to prevent frontend crashes
    return NextResponse.json([]);
  }
}
