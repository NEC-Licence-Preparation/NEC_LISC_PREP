import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import FacultyChooser from "@/components/FacultyChooser";
import { authOptions } from "@/lib/auth";

export default async function ChooseFacultyPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  if (session.user?.faculty) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4EEFF] px-4">
      <div className="w-full max-w-md bg-white shadow rounded p-6 space-y-4 border border-[#DCD6F7]">
        <h1 className="text-2xl font-semibold text-[#424874]">
          Welcome! Select your faculty
        </h1>
        <p className="text-sm text-[#424874]/70">
          Choose your engineering faculty to get personalized questions tailored
          to your field.
        </p>
        <FacultyChooser initialFaculty={session.user?.faculty ?? null} />
      </div>
    </div>
  );
}
