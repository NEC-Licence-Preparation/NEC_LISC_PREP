"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function QuickActions() {
  const router = useRouter();
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWrongCount = async () => {
      try {
        const res = await fetch("/api/tests/wrong/count");
        if (res.ok) {
          const data = await res.json();
          setWrongCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch wrong count:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWrongCount();
  }, []);

  const quickTests = [
    {
      label: "Daily 10",
      description: "10 random questions",
      mode: "daily10",
      color: "bg-[#424874]",
      hoverColor: "hover:bg-[#424874]/90",
    },
    {
      label: "Daily 100",
      description: "100 random questions",
      mode: "daily100",
      color: "bg-[#A6B1E1]",
      hoverColor: "hover:bg-[#A6B1E1]/90",
    },
  ];

  return (
    <div className="border border-[#DCD6F7] rounded p-4 bg-white shadow">
      <p className="text-sm font-semibold text-[#424874] mb-3">
        Quick Practice Tests
      </p>
      <div className="space-y-2">
        {quickTests.map((test) => (
          <div
            key={test.mode}
            className="flex items-center justify-between p-3 border border-[#DCD6F7] rounded-lg hover:bg-[#F4EEFF] transition"
          >
            <div className="flex-1">
              <p className="font-medium text-[#424874] text-sm">{test.label}</p>
              <p className="text-xs text-[#A6B1E1]">{test.description}</p>
            </div>
            <button
              onClick={() => router.push(`/test?mode=${test.mode}`)}
              className={`${test.color} text-white px-4 py-2 rounded text-xs ${test.hoverColor} transition`}
            >
              Start
            </button>
          </div>
        ))}
        
        {/* Retest Wrong Questions with count badge */}
        <div className="flex items-center justify-between p-3 border border-[#DCD6F7] rounded-lg hover:bg-[#F4EEFF] transition">
          <div className="flex-1">
            <p className="font-medium text-[#424874] text-sm">
              Retest Wrong Questions
            </p>
            <p className="text-xs text-[#A6B1E1]">
              {loading ? "Loading..." : `${wrongCount} wrong answer${wrongCount !== 1 ? "s" : ""} to review`}
            </p>
          </div>
          <button
            onClick={() => router.push("/retest-wrong")}
            disabled={wrongCount === 0}
            className="bg-[#DCD6F7] border border-[#A6B1E1] text-[#424874] px-4 py-2 rounded text-xs hover:bg-[#DCD6F7]/80 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {wrongCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                {wrongCount}
              </span>
            )}
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
