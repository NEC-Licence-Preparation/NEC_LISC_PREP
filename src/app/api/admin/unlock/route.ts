import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const password = body?.password as string;
  const target = process.env.ADMIN_PANEL_PASSWORD;

  if (!target) {
    return NextResponse.json(
      { error: "Admin password not set" },
      { status: 500 }
    );
  }

  if (!password || password !== target) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_unlock", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60, // 1 hour
  });
  return res;
}
