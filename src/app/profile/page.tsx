import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import NavBar from "@/components/layout/NavBar";
import UserProfile from "@/components/UserProfile";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Your Profile</h1>
        <UserProfile />
      </main>
    </div>
  );
}
