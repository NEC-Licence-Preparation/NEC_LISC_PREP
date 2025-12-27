import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { Types } from "mongoose";

export async function PUT(req: NextRequest) {
  try {
    const token = (await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    })) as JWT | null;
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { faculty } = body as { faculty?: string };

    if (!faculty || typeof faculty !== "string") {
      return NextResponse.json(
        { error: "Faculty is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const userIdStr = (token as any).userId || token.sub;
    const userObjectId = Types.ObjectId.isValid(String(userIdStr))
      ? new Types.ObjectId(String(userIdStr))
      : null;

    const userId = userObjectId ?? (userIdStr as any);
    const updated = await User.findByIdAndUpdate(
      userId,
      { faculty },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Faculty updated successfully",
      faculty: updated.faculty,
    });
  } catch (e) {
    console.error("Error updating faculty:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
