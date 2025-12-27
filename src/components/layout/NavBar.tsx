"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useMemo, useState } from "react";

export default function NavBar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = session?.role === "admin";
  const userName = session?.user?.name || "User";
  const userImage = session?.user?.image;
  const userInitial = useMemo(
    () => (userName ? userName.charAt(0).toUpperCase() : "U"),
    [userName]
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-[#A6B1E1]/30 bg-primary text-white backdrop-blur-sm shadow-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight transition-opacity hover:opacity-80"
          onClick={() => setIsMenuOpen(false)}
        >
          NEC Prep
        </Link>

        {/* Mobile: Session badge + hamburger */}
        <div className="flex items-center gap-3 md:hidden">
          {session && (
            <div className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider">
              <span className="relative h-7 w-7 overflow-hidden rounded-full border border-white/30 bg-white/10">
                {userImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={userImage}
                    alt={userName}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-white/80">
                    {userInitial}
                  </span>
                )}
              </span>
              <span className="max-w-27.5 truncate text-white/90">{userName}</span>
            </div>
          )}
          <button
            type="button"
            className="relative flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg border border-white/20 bg-white/5 transition-all hover:border-white/40 hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            <span
              className={`block h-0.5 w-5 rounded-full bg-white transition-all duration-300 ${
                isMenuOpen ? "translate-y-1.5 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-white transition-all duration-300 ${
                isMenuOpen ? "opacity-0" : "opacity-100"
              }`}
            />
            <span
              className={`block h-0.5 w-5 rounded-full bg-white transition-all duration-300 ${
                isMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
              }`}
            />
          </button>
        </div>

        {/* Desktop & Mobile dropdown menu */}
        <div
          className={`absolute left-0 right-0 top-full origin-top border-b border-[#A6B1E1]/20 bg-primary/98 backdrop-blur-md transition-all duration-300 ease-out md:static md:border-none md:bg-transparent md:backdrop-blur-none ${
            isMenuOpen
              ? "translate-y-0 scale-y-100 opacity-100"
              : "-translate-y-2 scale-y-95 opacity-0 md:translate-y-0 md:scale-y-100 md:opacity-100"
          } ${
            isMenuOpen
              ? "pointer-events-auto"
              : "pointer-events-none md:pointer-events-auto"
          }`}
        >
          <div className="mx-auto max-w-6xl px-4 py-4 md:px-0 md:py-0">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-end">
              {session ? (
                <>
                  {/* Desktop session badge */}
                  <div className="hidden items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium uppercase tracking-wider md:flex">
                    <span className="relative h-8 w-8 overflow-hidden rounded-full border border-white/30 bg-white/10">
                      {userImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={userImage}
                          alt={userName}
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-white/80 text-sm">
                          {userInitial}
                        </span>
                      )}
                    </span>
                    <span className="text-white/90">{userName}</span>
                  </div>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 md:px-2 md:py-1"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}{" "}
                  <Link
                    href="/profile"
                    className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 md:px-2 md:py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>{" "}
                  <button
                    onClick={() => {
                      signOut({ callbackUrl: "/" });
                      setIsMenuOpen(false);
                    }}
                    className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 md:px-2 md:py-1"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10 md:px-2 md:py-1"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-md border border-white/30 bg-white/5 px-3 py-2 text-sm font-medium transition-all hover:border-white/50 hover:bg-white/10 md:px-3"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
