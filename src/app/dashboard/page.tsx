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
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold">
              Welcome, {session.user?.name}
            </h1>
            <p className="text-slate-600 text-sm">
              Track your NEC exam prep progress.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/test"
              className="bg-slate-900 text-white px-4 py-2 rounded text-center hover:bg-slate-800 transition"
            >
              Start Test
            </Link>
            <Link
              href="/retest-wrong"
              className="bg-white border border-slate-300 text-slate-900 px-4 py-2 rounded text-center hover:bg-slate-100 transition"
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
