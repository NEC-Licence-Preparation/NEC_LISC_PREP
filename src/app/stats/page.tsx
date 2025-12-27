"use client";

import { useEffect, useState } from "react";
import NavBar from "@/components/layout/NavBar";

type TotalStats = {
  questions: number;
  correct: number;
  incorrect: number;
  percentage: number;
  testsCompleted: number;
};

type SubjectStat = {
  subject: string;
  total: number;
  correct: number;
  incorrect: number;
  percentage: number;
};

type Stats = {
  total: TotalStats;
  bySubject: SubjectStat[];
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      } else {
        setError("Failed to load statistics");
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4EEFF]">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#424874] mb-2">
            Your Statistics
          </h1>
          <p className="text-sm text-[#424874]/70">
            Track your performance and progress
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-[#A6B1E1]">Loading statistics...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && stats && (
          <div className="space-y-6">
            {/* Overall Statistics */}
            <div className="bg-white border-2 border-[#DCD6F7] rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-[#424874] mb-4 flex items-center gap-2">
                <span>📊</span>
                Overall Statistics
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-[#F4EEFF] rounded-lg">
                  <p className="text-3xl font-bold text-[#424874]">
                    {stats.total.testsCompleted}
                  </p>
                  <p className="text-xs text-[#A6B1E1] mt-1">Tests Completed</p>
                </div>
                <div className="text-center p-4 bg-[#F4EEFF] rounded-lg">
                  <p className="text-3xl font-bold text-[#424874]">
                    {stats.total.questions}
                  </p>
                  <p className="text-xs text-[#A6B1E1] mt-1">Questions Solved</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {stats.total.correct}
                  </p>
                  <p className="text-xs text-green-600/70 mt-1">Correct</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">
                    {stats.total.incorrect}
                  </p>
                  <p className="text-xs text-red-600/70 mt-1">Incorrect</p>
                </div>
              </div>

              {/* Accuracy Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-[#424874]">Overall Accuracy</p>
                  <p className="text-sm font-bold text-[#424874]">
                    {stats.total.percentage}%
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      stats.total.percentage >= 75
                        ? "bg-green-500"
                        : stats.total.percentage >= 50
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${stats.total.percentage}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Subject-wise Statistics */}
            <div className="bg-white border-2 border-[#DCD6F7] rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-bold text-[#424874] mb-4 flex items-center gap-2">
                <span>📚</span>
                Subject-wise Statistics
              </h2>

              {stats.bySubject.length === 0 ? (
                <p className="text-center text-[#A6B1E1] py-8">
                  No subject-specific data yet. Complete some tests to see your stats!
                </p>
              ) : (
                <div className="space-y-4">
                  {stats.bySubject.map((subject) => (
                    <div
                      key={subject.subject}
                      className="border border-[#DCD6F7] rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-[#424874]">
                          {subject.subject}
                        </h3>
                        <span className="text-sm font-bold text-[#424874]">
                          {subject.percentage}%
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="text-center p-2 bg-[#F4EEFF] rounded">
                          <p className="text-lg font-bold text-[#424874]">
                            {subject.total}
                          </p>
                          <p className="text-[10px] text-[#A6B1E1]">Total</p>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-lg font-bold text-green-600">
                            {subject.correct}
                          </p>
                          <p className="text-[10px] text-green-600/70">Correct</p>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <p className="text-lg font-bold text-red-600">
                            {subject.incorrect}
                          </p>
                          <p className="text-[10px] text-red-600/70">Incorrect</p>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            subject.percentage >= 75
                              ? "bg-green-500"
                              : subject.percentage >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${subject.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
