import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import TestAttempt from "@/models/TestAttempt";

export async function GET(req: NextRequest) {
  try {
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWT | null;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectDB();

    // Get userId from token (stored for OAuth users) or use token.sub (for credential users)
    const userId = (token as any).userId || token.sub;

    const attempts = await TestAttempt.find({ userId })
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(attempts);
  } catch (e) {
    console.error("Error fetching test history:", e);
    // Return empty array instead of error object to prevent frontend crashes
    return NextResponse.json([]);
  }
}
