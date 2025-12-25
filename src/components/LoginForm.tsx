"use client";
import { signIn } from "next-auth/react";
import { FormEvent, useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      redirect: true,
      callbackUrl: "/dashboard",
      email,
      password,
    });
    if (res?.error) setError("Invalid credentials");
    setLoading(false);
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        type="email"
        placeholder="Email"
        className="w-full border rounded px-3 py-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full border rounded px-3 py-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button
        type="submit"
        className="w-full bg-slate-900 text-white py-2 rounded"
        disabled={loading}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>
      <button
        type="button"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        className="w-full border py-2 rounded"
      >
        Continue with Google
      </button>
    </form>
  );
}
