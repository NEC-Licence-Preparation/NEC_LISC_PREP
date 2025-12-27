import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Bookmark from "@/models/Bookmark";
import Question from "@/models/Question";

// GET: Get all bookmarked questions for the user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const bookmarks = await Bookmark.find({ userEmail: session.user.email }).sort({ createdAt: -1 });
    
    // Get the actual question details
    const questionIds = bookmarks.map(b => b.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } });

    // Map questions with bookmark date
    const bookmarkedQuestions = bookmarks.map(bookmark => {
      const question = questions.find(q => q._id.toString() === bookmark.questionId);
      return {
        ...question?.toObject(),
        bookmarkedAt: bookmark.createdAt,
      };
    }).filter(q => q._id); // Filter out any null questions

    return NextResponse.json(bookmarkedQuestions);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

// POST: Add a bookmark
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await req.json();

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if bookmark already exists
    const existing = await Bookmark.findOne({
      userEmail: session.user.email,
      questionId,
    });

    if (existing) {
      return NextResponse.json(
        { error: "Already bookmarked" },
        { status: 400 }
      );
    }

    const bookmark = await Bookmark.create({
      userEmail: session.user.email,
      questionId,
    });

    return NextResponse.json(
      { success: true, bookmark },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating bookmark:", error);
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a bookmark
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId, deleteAll } = await req.json();

    await connectDB();

    if (deleteAll) {
      // Delete all bookmarks for the user
      const result = await Bookmark.deleteMany({
        userEmail: session.user.email,
      });

      return NextResponse.json({ 
        success: true, 
        deletedCount: result.deletedCount 
      });
    }

    if (!questionId) {
      return NextResponse.json(
        { error: "Question ID is required" },
        { status: 400 }
      );
    }

    const result = await Bookmark.findOneAndDelete({
      userEmail: session.user.email,
      questionId,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}
