import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { JWT } from "next-auth/jwt";

const adminPaths = ["/admin"];
const protectedPaths = ["/dashboard", "/admin"];
const onboardingPath = "/choose-faculty";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isOnboarding = pathname.startsWith(onboardingPath);

  // Public paths skip
  if (!protectedPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = (await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })) as JWT | null;
  const adminUnlocked = req.cookies.get("admin_unlock")?.value === "1";

  // If path is admin, allow if unlock cookie or admin role
  if (adminPaths.some((p) => pathname.startsWith(p))) {
    // We let the page render an unlock form when not permitted; no redirect loop.
    return NextResponse.next();
  }

  // For other protected paths, require any session
  if (!token) {
    const signInUrl = new URL("/login", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // First-login onboarding: redirect to faculty chooser if faculty is not set
  const tokenWithFaculty = token as JWT & { faculty?: string | null };
  if (!tokenWithFaculty.faculty && !isOnboarding) {
    const chooseUrl = new URL(onboardingPath, req.url);
    return NextResponse.redirect(chooseUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/choose-faculty"],
};
