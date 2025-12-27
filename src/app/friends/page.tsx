import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import NavBar from "@/components/layout/NavBar";
import FriendManager from "@/components/FriendManager";

export default async function FriendsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen bg-[#F4EEFF]">
      <NavBar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-[#424874]">
          Friends
        </h1>
        <FriendManager />
      </main>
    </div>
  );
}
