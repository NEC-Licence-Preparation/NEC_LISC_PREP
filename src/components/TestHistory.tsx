"use client";
import useSWR from "swr";
import ProgressChart from "./Charts/ProgressChart";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Attempt = {
  _id: string;
  date: string;
  subject?: string;
  score: number;
};

type SubjectWithCount = {
  subject: string;
  count: number;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

const subjectFetcher = async (url: string) => {
  const res = await fetch(url);
  if (res.status === 401) return [];
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export default function TestHistory() {
  const router = useRouter();
  const { data, error, isLoading } = useSWR<Attempt[]>(
    "/api/tests/history",
    fetcher
  );
  const {
    data: subjectList,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useSWR<SubjectWithCount[]>("/api/subjects", subjectFetcher);

  // Helper function to shorten subject names
  const shortenSubject = (subject: string) => {
    const words = subject.split(" ");
    if (words.length === 1) return subject.substring(0, 3).toUpperCase();
    return words
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  };

  // Ensure data is always an array to prevent .map() errors
  const attempts = Array.isArray(data) ? data : [];
  const recentAttempts = attempts.slice(0, 5);
  const subjects = Array.isArray(subjectList) ? subjectList : [];
  const fullSubjectsForChart = recentAttempts.map(
    (a) => a.subject || "General"
  );
  const shortSubjectsForChart = fullSubjectsForChart.map(shortenSubject);
  const scores = recentAttempts.map((a) => a.score);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="border border-[#DCD6F7] rounded p-4 bg-white shadow">
        <p className="font-semibold mb-2 text-[#424874]">Recent Attempts</p>
        {isLoading && (
          <p className="text-sm text-[#A6B1E1]">Loading history...</p>
        )}
        {error && <p className="text-sm text-red-600">Error loading history</p>}
        {!isLoading && !error && !attempts.length && (
          <p className="text-sm text-[#A6B1E1]">No attempts yet.</p>
        )}
        {!!recentAttempts.length && (
          <ul className="space-y-2 text-sm">
            {recentAttempts.map((a) => (
              <li
                key={a._id}
                className="flex items-center justify-between border-b border-[#DCD6F7] pb-1"
              >
                <span className="text-[#424874]/80">
                  {new Date(a.date).toLocaleDateString()} •{" "}
                  {a.subject || "General"}
                </span>
                <span className="font-semibold text-[#424874]">
                  {a.score} pts
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border border-[#DCD6F7] rounded p-4 bg-white shadow">
        <p className="font-semibold mb-2 text-[#424874]">Scores by Subject</p>
        <ProgressChart
          subjects={shortSubjectsForChart}
          fullSubjects={fullSubjectsForChart}
          scores={scores}
        />
        <div className="mt-4 space-y-3">
          <p className="text-sm font-semibold text-[#424874]">
            Subject-wise mock tests
          </p>
          {subjectsLoading && (
            <p className="text-xs text-[#A6B1E1]">Loading subjects...</p>
          )}
          {subjectsError && (
            <p className="text-xs text-red-600">Failed to load subjects</p>
          )}
          {!subjectsLoading && subjects.length === 0 && (
            <p className="text-xs text-[#A6B1E1]">No subjects found.</p>
          )}
          {!subjectsLoading && subjects.length > 0 && (
            <div className="space-y-2">
              {subjects.map((s) => (
                <SubjectTestRow
                  key={s.subject}
                  subject={s.subject}
                  totalQuestions={s.count}
                  onStart={(count) =>
                    router.push(
                      `/test?subject=${encodeURIComponent(
                        s.subject
                      )}&count=${count}`
                    )
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubjectTestRow({
  subject,
  totalQuestions,
  onStart,
}: {
  subject: string;
  totalQuestions: number;
  onStart: (count: number) => void;
}) {
  const [selectedCount, setSelectedCount] = useState<number>(10);

  // Generate available options based on total questions
  const getAvailableOptions = () => {
    const options = [10, 20, 50, 100];
    return options.filter((opt) => opt <= totalQuestions);
  };

  const availableOptions = getAvailableOptions();

  return (
    <div className="flex items-center justify-between p-3 border border-[#DCD6F7] rounded-lg hover:bg-[#F4EEFF] transition">
      <div className="flex-1">
        <p className="font-medium text-[#424874] text-sm">{subject}</p>
        <p className="text-xs text-[#A6B1E1]">
          {totalQuestions} question{totalQuestions !== 1 ? "s" : ""} available
        </p>
      </div>
      <div className="flex items-center gap-2">
        <select
          value={selectedCount}
          onChange={(e) => setSelectedCount(Number(e.target.value))}
          className="text-xs border border-[#A6B1E1] text-[#424874] px-2 py-1 rounded focus:outline-none focus:border-[#424874]"
          disabled={availableOptions.length === 0}
        >
          {availableOptions.length === 0 ? (
            <option value={0}>Not enough</option>
          ) : (
            availableOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} questions
              </option>
            ))
          )}
        </select>
        <button
          onClick={() => onStart(selectedCount)}
          disabled={availableOptions.length === 0}
          className="bg-[#424874] text-white px-3 py-1 rounded text-xs hover:bg-[#424874]/90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Start
        </button>
      </div>
    </div>
  );
}
