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
      <main className="max-w-4xl mx-auto p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Practice Test</h1>
        <TestRunner subject={subject} />
      </main>
    </div>
  );
}
