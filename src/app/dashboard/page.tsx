import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import TestHistory from "@/components/TestHistory";
import NavBar from "@/components/layout/NavBar";
import AdSlot from "@/components/Ads/AdSlot";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <AdSlot
          title="Sponsored — Leaderboard"
          description="728x90 banner"
          size="leaderboard"
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              Welcome, {session.user?.name}
            </h1>
            <p className="text-slate-600 text-sm">
              Track your NEC exam prep progress.
            </p>
          </div>
          <Link
            href="/test"
            className="bg-slate-900 text-white px-4 py-2 rounded"
          >
            Start Test
          </Link>
        </div>
        <TestHistory />
        <AdSlot
          title="Your ad here"
          description="Manage monetization safely by dropping your ad HTML/script in NEXT_PUBLIC_ADS_SNIPPET."
          size="rectangle"
        />
      </main>
    </div>
  );
}
