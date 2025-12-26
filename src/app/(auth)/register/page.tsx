import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import RegisterForm from "@/components/RegisterForm";
import { authOptions } from "@/lib/auth";

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white shadow rounded p-6">
        <h1 className="text-2xl font-semibold mb-4">Create account</h1>
        <RegisterForm />
        <div className="mt-6 flex flex-col gap-2 text-sm text-slate-600">
          <Link href="/" className="transition hover:text-slate-800">
            ← Back to home
          </Link>
          <div>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-slate-900 underline-offset-2 hover:underline"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
