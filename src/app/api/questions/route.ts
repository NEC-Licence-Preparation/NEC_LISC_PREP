import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Question from "@/models/Question";
import { QuestionSchema } from "@/lib/validation";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const subject = searchParams.get("subject");
    const filter = subject ? { subject } : {};
    await connectDB();
    const questions = await Question.find(filter).lean();
    return NextResponse.json(questions);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const parsed = QuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await connectDB();
    const created = await Question.create(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
