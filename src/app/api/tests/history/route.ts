import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import TestAttempt from "@/models/TestAttempt";

export async function GET(req: Request) {
  try {
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWT | null;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();
    const attempts = await TestAttempt.find({ userId: token.sub })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(attempts);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
