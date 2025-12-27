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

  if (isLoading) return <p className="text-[#A6B1E1]">Loading result...</p>;
  if (error) return <p className="text-red-600">{String(error)}</p>;
  if (!data) return <p className="text-[#424874]/70">No result found.</p>;

  const percentage = Math.round((data.score / data.total) * 100);

  return (
    <div className="space-y-6">
      {/* Score Summary Card */}
      <div className="border-2 border-[#DCD6F7] rounded-xl p-6 bg-gradient-to-br from-white to-[#F4EEFF]/30 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-[#A6B1E1] uppercase tracking-wider mb-1">
              Test Summary
            </p>
            <p className="text-sm text-[#424874]/70">
              {data.subject || "All Subjects"} •{" "}
              {Math.floor(data.timeTaken / 60)}m {data.timeTaken % 60}s
            </p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-bold text-[#424874]">{percentage}%</p>
            <p className="text-xs text-[#A6B1E1] uppercase tracking-wide mt-1">
              {data.score} / {data.total} Correct
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#DCD6F7] rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#424874] to-[#A6B1E1] rounded-full transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Questions Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#424874] flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
              clipRule="evenodd"
            />
          </svg>
          Detailed Review
        </h2>

        {data.breakdown.map((b, index) => (
          <div
            key={b.questionId}
            className={`border-2 rounded-xl p-5 bg-gradient-to-br shadow-md transition-all ${
              b.correct
                ? "border-green-300 from-green-50 to-white"
                : "border-red-300 from-red-50 to-white"
            }`}
          >
            {/* Question Header */}
            <div className="flex items-start justify-between mb-4 pb-3 border-b border-current/10">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#424874] text-white text-sm font-bold">
                  {index + 1}
                </span>
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: b.correct ? "#15803d" : "#dc2626" }}
                  >
                    {b.correct ? "✓ Correct" : "✗ Incorrect"}
                  </p>
                </div>
              </div>
              {b.correct ? (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Correct
                </div>
              ) : (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Wrong
                </div>
              )}
            </div>

            {/* Question Text */}
            <p className="text-[#424874] font-semibold mb-4 leading-relaxed">
              {b.question}
            </p>

            {/* Answers */}
            <div className="space-y-2 mb-3">
              {b.selected && (
                <div
                  className={`flex items-start gap-2 p-3 rounded-lg border-2 ${
                    b.correct
                      ? "border-green-400 bg-green-50"
                      : "border-red-400 bg-red-50"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {b.correct ? (
                      <svg
                        className="w-5 h-5 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5 text-red-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-xs font-semibold mb-1"
                      style={{ color: b.correct ? "#15803d" : "#dc2626" }}
                    >
                      Your Answer
                    </p>
                    <p className="text-sm font-medium text-[#424874]">
                      {b.selected}
                    </p>
                  </div>
                </div>
              )}

              {!b.correct && (
                <div className="flex items-start gap-2 p-3 rounded-lg border-2 border-green-400 bg-green-50">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-green-700 mb-1">
                      Correct Answer
                    </p>
                    <p className="text-sm font-medium text-[#424874]">
                      {b.correctAnswer}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Explanation */}
            {b.explanation && (
              <div className="mt-4 pt-4 border-t border-current/10">
                <div className="flex gap-2 items-start">
                  <svg
                    className="w-5 h-5 text-[#A6B1E1] mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-[#A6B1E1] uppercase tracking-wide mb-1">
                      Explanation
                    </p>
                    <p className="text-sm text-[#424874]/80 leading-relaxed">
                      {b.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Link
          href="/test"
          className="flex-1 px-6 py-3 rounded-lg border-2 border-[#A6B1E1] text-[#424874] font-semibold hover:bg-[#DCD6F7] transition text-center"
        >
          Take Another Test
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 px-6 py-3 rounded-lg bg-[#424874] text-white font-semibold hover:bg-[#424874]/90 transition shadow-md text-center"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
