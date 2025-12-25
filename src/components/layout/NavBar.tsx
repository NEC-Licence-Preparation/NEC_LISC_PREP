"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function NavBar() {
  const { data: session } = useSession();
  return (
    <nav className="flex items-center justify-between p-4 bg-slate-900 text-white">
      <Link href="/" className="font-semibold">
        NEC Prep
      </Link>
      <div className="flex items-center gap-4">
        {session ? (
          <>
            <span className="text-sm">{session.user?.name}</span>
            {session.role === "admin" && (
              <Link href="/admin" className="text-sm underline">
                Admin
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm underline"
            >
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="text-sm underline">
              Login
            </Link>
            <Link href="/register" className="text-sm underline">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
