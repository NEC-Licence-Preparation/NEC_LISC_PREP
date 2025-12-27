import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import NavBar from "@/components/layout/NavBar";
import TestResult from "@/components/TestResult";
import { authOptions } from "@/lib/auth";

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ attemptId?: string }> | { attemptId?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const resolved = await searchParams;
  const attemptId = resolved?.attemptId;
  if (!attemptId) redirect("/test");

  return (
    <div className="min-h-screen bg-[#F4EEFF]">
      <NavBar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#424874]">
          Test Result
        </h1>
        <div className="bg-white border border-[#DCD6F7] rounded p-4 shadow">
          <TestResult attemptId={attemptId} />
        </div>
      </main>
    </div>
  );
}
