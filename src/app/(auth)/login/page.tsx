import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import { authOptions } from "@/lib/auth";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white shadow rounded p-6">
        <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
        <LoginForm />
        <div className="mt-6 flex flex-col gap-2 text-sm text-slate-600">
          <Link href="/" className="transition hover:text-slate-800">
            ← Back to home
          </Link>
          <div>
            New here?{" "}
            <Link
              href="/register"
              className="font-medium text-slate-900 underline-offset-2 hover:underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
