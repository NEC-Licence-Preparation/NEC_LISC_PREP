import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import TestHistory from "@/components/TestHistory";
import NavBar from "@/components/layout/NavBar";
import StreakDisplay from "@/components/StreakDisplay";

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
          <StreakDisplay />
        </div>
        <TestHistory />
      </main>
    </div>
  );
}
