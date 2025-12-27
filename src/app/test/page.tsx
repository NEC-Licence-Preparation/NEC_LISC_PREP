import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NavBar from "@/components/layout/NavBar";
import TestRunner from "@/components/TestRunner";
import DailyTestRunner from "@/components/DailyTestRunner";
import { redirect } from "next/navigation";

export default async function TestPage({
  searchParams,
}: {
  searchParams:
    | Promise<{ subject?: string; mode?: string }>
    | { subject?: string; mode?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const resolvedParams = await searchParams;
  const subject = resolvedParams?.subject;
  const mode = resolvedParams?.mode || "practice"; // 'practice' | 'daily10' | 'daily100'

  return (
    <div className="min-h-screen bg-[#F4EEFF]">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 sm:space-y-5">
        {mode === "practice" && (
          <h1 className="text-xl sm:text-2xl font-semibold text-[#424874]">
            Practice Test
          </h1>
        )}
        {mode === "daily10" && (
          <h1 className="text-xl sm:text-2xl font-semibold text-[#424874]">
            Daily 10-Question Test
          </h1>
        )}
        {mode === "daily100" && (
          <h1 className="text-xl sm:text-2xl font-semibold text-[#424874]">
            Daily 100-Question Test
          </h1>
        )}

        <div className="grid lg:grid-cols-[minmax(0,1fr)] gap-4 lg:gap-6 items-start">
          {mode === "practice" && <TestRunner subject={subject} />}
          {mode === "daily10" && <DailyTestRunner setSize="10" />}
          {mode === "daily100" && <DailyTestRunner setSize="100" />}
        </div>
      </main>
    </div>
  );
}
