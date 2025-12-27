"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminUnlockForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Invalid password");
    } else {
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        type="password"
        className="w-full border border-[#DCD6F7] rounded px-3 py-2 focus:outline-none focus:border-[#A6B1E1]"
        placeholder="Admin panel password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        className="bg-[#424874] text-white px-4 py-2 rounded w-full hover:bg-[#424874]/90 transition"
        disabled={loading}
      >
        {loading ? "Verifying..." : "Unlock"}
      </button>
    </form>
  );
}
