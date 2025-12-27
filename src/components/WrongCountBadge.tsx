"use client";
import useWrongCount from "./hooks/useWrongCount";

export default function WrongCountBadge() {
  const { count, isLoading } = useWrongCount();
  const label = isLoading ? "…" : String(count);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-300"
      title="Current wrong-question pool"
    >
      {label}
    </span>
  );
}
