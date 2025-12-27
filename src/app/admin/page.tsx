import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NavBar from "@/components/layout/NavBar";
import JsonUploader from "@/components/Admin/JsonUploader";
import QuestionManager from "@/components/Admin/QuestionManager";
import Link from "next/link";
import AdminUnlockForm from "@/components/Admin/AdminUnlockForm";
import { cookies } from "next/headers";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const cookieStore = await cookies();
  const unlocked = cookieStore.get("admin_unlock")?.value === "1";
  if (!unlocked && (!session || session.role !== "admin")) {
    return (
      <div className="min-h-screen bg-[#F4EEFF]">
        <NavBar />
        <main className="max-w-lg mx-auto p-6 space-y-4">
          <h1 className="text-2xl font-semibold text-[#424874]">
            Admin Access
          </h1>
          <p className="text-sm text-[#424874]/70">
            Enter the admin panel password to manage questions.
          </p>
          <AdminUnlockForm />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4EEFF]">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#424874]">
              Admin Dashboard
            </h1>
            <p className="text-[#424874]/70 text-sm">
              Manage questions and users.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/admin_tickets" className="underline text-primary">
              Support Tickets
            </Link>
            <Link href="/" className="underline text-primary">
              Home
            </Link>
          </div>
        </div>
        <JsonUploader />
        <QuestionManager />
      </main>
    </div>
  );
}
