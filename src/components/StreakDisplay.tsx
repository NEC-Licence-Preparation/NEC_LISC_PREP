"use client";

import { useEffect, useState } from "react";

export default function StreakDisplay() {
  const [streak, setStreak] = useState({ currentStreak: 0, longestStreak: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreak();
  }, []);

  const fetchStreak = async () => {
    try {
      const res = await fetch("/api/streak");
      if (res.ok) {
        const data = await res.json();
        setStreak({
          currentStreak: data.currentStreak || 0,
          longestStreak: data.longestStreak || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching streak:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="border border-[#DCD6F7] rounded-lg px-6 py-3 bg-white shadow animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
          <div className="w-24 h-6 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-[#DCD6F7] rounded-lg px-6 py-3 bg-white shadow">
      <div className="flex items-center gap-4">
        <p className="text-3xl">🔥</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-[#424874]">{streak.currentStreak}</p>
          <p className="text-xs text-[#A6B1E1]">Day Streak</p>
        </div>
        <div className="border-l border-[#DCD6F7] pl-4 ml-2">
          <p className="text-[10px] text-[#424874]/60">Best</p>
          <p className="text-sm font-semibold text-[#424874]">{streak.longestStreak}</p>
        </div>
      </div>
    </div>
  );
}
