"use client";
import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Registration failed");
    } else {
      setMessage("Registered! You can now login.");
      setName("");
      setEmail("");
      setPassword("");
    }
    setLoading(false);
  };

  return (
    <form className="space-y-3" onSubmit={onSubmit}>
      <input
        type="text"
        placeholder="Name"
        className="w-full border border-[#DCD6F7] rounded px-3 py-2 focus:outline-none focus:border-[#A6B1E1]"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
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
        minLength={6}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      {message && <p className="text-green-600 text-sm">{message}</p>}
      <button
        type="submit"
        className="w-full bg-[#424874] text-white py-2 rounded hover:bg-[#424874]/90 transition"
        disabled={loading}
      >
        {loading ? "Registering..." : "Register"}
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
