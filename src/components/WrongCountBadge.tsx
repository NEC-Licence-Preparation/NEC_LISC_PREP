"use client";
import useWrongCount from "./hooks/useWrongCount";

export default function WrongCountBadge() {
  const { count, isLoading } = useWrongCount();
  const label = isLoading ? "…" : String(count);
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[#DCD6F7] text-[#424874] border border-[#A6B1E1]"
      title="Current wrong-question pool"
    >
      {label}
    </span>
  );
}
