import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import NavBar from "@/components/layout/NavBar";
import TestRunner from "@/components/TestRunner";
import { redirect } from "next/navigation";

export default async function TestPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }> | { subject?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const resolvedParams = await searchParams;
  const subject = resolvedParams?.subject;

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4 sm:space-y-5">
        <h1 className="text-xl sm:text-2xl font-semibold">Practice Test</h1>
        <div className="grid lg:grid-cols-[minmax(0,1fr)] gap-4 lg:gap-6 items-start">
          <TestRunner subject={subject} />
        </div>
      </main>
    </div>
  );
}
