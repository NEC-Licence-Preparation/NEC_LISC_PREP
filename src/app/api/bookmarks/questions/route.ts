import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Bookmark from "@/models/Bookmark";
import Question from "@/models/Question";

// GET: Get questions for bookmarked question IDs
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookmarkIds = searchParams.get("ids");

    await connectDB();

    let questionIds: string[] = [];

    if (bookmarkIds === "all") {
      // Get all bookmarked questions for the user
      const bookmarks = await Bookmark.find({ userEmail: session.user.email });
      questionIds = bookmarks.map((b) => b.questionId);
    } else if (bookmarkIds) {
      // Get specific bookmarked question(s)
      const ids = bookmarkIds.split(",");
      const bookmarks = await Bookmark.find({
        userEmail: session.user.email,
        questionId: { $in: ids },
      });
      questionIds = bookmarks.map((b) => b.questionId);
    }

    if (questionIds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch the actual questions
    const questions = await Question.find({ _id: { $in: questionIds } });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching bookmark questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}
