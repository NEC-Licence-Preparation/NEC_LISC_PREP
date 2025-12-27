import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Bookmark from "@/models/Bookmark";

// GET: Check if a question is bookmarked
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const bookmark = await Bookmark.findOne({
      userEmail: session.user.email,
      questionId: id,
    });

    return NextResponse.json({ isBookmarked: !!bookmark });
  } catch (error) {
    console.error("Error checking bookmark:", error);
    return NextResponse.json(
      { error: "Failed to check bookmark" },
      { status: 500 }
    );
  }
}
