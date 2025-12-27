import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import WrongCountBadge from "@/components/WrongCountBadge";
import TestHistory from "@/components/TestHistory";
import NavBar from "@/components/layout/NavBar";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#F4EEFF]">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#424874]">
              Welcome, {session.user?.name}
            </h1>
            <p className="text-[#424874]/70 text-sm">
              Track your NEC exam prep progress.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/test?mode=daily10"
              className="bg-[#424874] text-white px-4 py-2 rounded text-center hover:bg-[#424874]/90 transition"
            >
              Daily 10
            </Link>
            <Link
              href="/test?mode=daily100"
              className="bg-[#A6B1E1] text-[#424874] px-4 py-2 rounded text-center hover:bg-[#A6B1E1]/80 transition"
            >
              Daily 100
            </Link>
            <Link
              href="/retest-wrong"
              className="bg-[#DCD6F7] border border-[#A6B1E1] text-[#424874] px-4 py-2 rounded text-center hover:bg-[#DCD6F7]/80 transition"
            >
              Retest Wrong Questions
            </Link>
            <WrongCountBadge />
          </div>
        </div>
        <TestHistory />
      </main>
    </div>
  );
}
