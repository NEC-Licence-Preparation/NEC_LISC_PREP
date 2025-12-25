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
      <div className="min-h-screen bg-slate-50">
        <NavBar />
        <main className="max-w-lg mx-auto p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Admin Access</h1>
          <p className="text-sm text-slate-600">
            Enter the admin panel password to manage questions.
          </p>
          <AdminUnlockForm />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="max-w-5xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="text-slate-600 text-sm">
              Manage questions and users.
            </p>
          </div>
          <Link href="/" className="underline">
            Home
          </Link>
        </div>
        <JsonUploader />
        <QuestionManager />
      </main>
    </div>
  );
}
