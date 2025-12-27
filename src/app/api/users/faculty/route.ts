import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { faculties } from "@/lib/faculties";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const faculty: string | undefined = body?.faculty;

  console.log("Received faculty update request:", {
    email: session.user.email,
    faculty,
  });

  if (!faculty || !faculties.includes(faculty as (typeof faculties)[number])) {
    console.log("Invalid faculty value:", faculty);
    return NextResponse.json({ error: "Invalid faculty" }, { status: 400 });
  }

  try {
    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("User before update:", JSON.stringify(user));

    user.faculty = faculty;
    const saved = await user.save();

    console.log("User after save:", JSON.stringify(saved));
    console.log(
      "Faculty updated for user:",
      session.user.email,
      "to:",
      saved.faculty
    );

    return NextResponse.json({ faculty: saved.faculty, success: true });
  } catch (error) {
    console.error("Error updating faculty:", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
