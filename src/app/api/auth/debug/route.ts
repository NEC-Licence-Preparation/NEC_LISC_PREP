import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
    hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    clientIdPrefix: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + "...",
    redirectUri: `${process.env.NEXTAUTH_URL}/api/auth/callback/google`,
  });
}
