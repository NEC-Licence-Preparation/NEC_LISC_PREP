"use client";

import useSWR from "swr";
import Link from "next/link";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to load result");
  return data as {
    score: number;
    total: number;
    timeTaken: number;
    subject?: string;
    breakdown: {
      questionId: string;
      question: string;
      selected?: string;
      correctAnswer: string;
      explanation?: string;
      correct: boolean;
    }[];
  };
};

export default function TestResult({ attemptId }: { attemptId: string }) {
  const { data, error, isLoading } = useSWR(
    attemptId ? `/api/tests/${attemptId}` : null,
    fetcher
  );

  if (isLoading) return <p>Loading result...</p>;
  if (error) return <p className="text-red-600">{String(error)}</p>;
  if (!data) return <p>No result found.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#A6B1E1]">
            Subject: {data.subject || "All"}
          </p>
          <p className="text-sm text-[#A6B1E1]">Time: {data.timeTaken}s</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-[#424874]">
            Score: {data.score} / {data.total}
          </p>
        </div>
      </div>

      <div className="divide-y divide-[#DCD6F7]">
        {data.breakdown.map((b) => (
          <div key={b.questionId} className="py-3 space-y-1">
            <p className="font-medium text-[#424874]">{b.question}</p>
            <p className={b.correct ? "text-green-700" : "text-red-700"}>
              {b.correct ? "Correct" : "Incorrect"}
            </p>
            <p className="text-[#424874]/80">
              Chosen: {b.selected || "No answer"}
            </p>
            <p className="text-[#424874]/80">Correct: {b.correctAnswer}</p>
            {b.explanation && (
              <p className="text-[#A6B1E1] text-sm">
                Explanation: {b.explanation}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <Link
          href="/test"
          className="px-4 py-2 rounded border border-[#A6B1E1] text-[#424874] hover:bg-[#DCD6F7] transition"
        >
          Back to Test
        </Link>
        <Link
          href="/dashboard"
          className="px-4 py-2 rounded bg-[#424874] text-white hover:bg-[#424874]/90 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
