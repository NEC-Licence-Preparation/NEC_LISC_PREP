"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Wrong email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Refresh the page to update session and redirect
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("Unable to sign in right now. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        type="email"
        placeholder="Email"
        className="w-full border border-[#DCD6F7] rounded px-3 py-2 focus:outline-none focus:border-[#A6B1E1]"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full border border-[#DCD6F7] rounded px-3 py-2 focus:outline-none focus:border-[#A6B1E1]"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full bg-[#424874] text-white py-2 rounded hover:bg-[#424874]/90 transition"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full border border-[#DCD6F7] py-2 rounded text-[#424874] hover:bg-[#F4EEFF] transition"
      >
        Continue with Google
      </button>
    </form>
  );
}
