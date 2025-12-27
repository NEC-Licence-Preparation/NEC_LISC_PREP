"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { faculties } from "@/lib/faculties";

interface Props {
  initialFaculty?: string | null;
}

export default function FacultyChooser({ initialFaculty }: Props) {
  const router = useRouter();
  const { update } = useSession();
  const [faculty, setFaculty] = useState<string>(
    initialFaculty ?? faculties[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/users/faculty", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ faculty }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Unable to save faculty. Please try again.");
      setLoading(false);
      return;
    }

    // Update session token so middleware sees faculty immediately
    await update({ faculty });

    router.push("/");
    router.refresh();
    setLoading(false);
  };

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1">
        <label className="block text-sm font-medium text-[#424874]">
          Choose your faculty
        </label>
        <select
          className="w-full border border-[#DCD6F7] rounded px-3 py-2 text-[#424874] focus:outline-none focus:border-[#A6B1E1]"
          value={faculty}
          onChange={(e) => setFaculty(e.target.value)}
          required
        >
          {faculties.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full bg-[#424874] text-white py-2 rounded hover:bg-[#424874]/90 transition"
        disabled={loading}
      >
        {loading ? "Saving..." : "Continue"}
      </button>
    </form>
  );
}
