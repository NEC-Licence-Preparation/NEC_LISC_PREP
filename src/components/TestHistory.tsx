"use client";
import useSWR from "swr";
import ProgressChart from "./Charts/ProgressChart";
import Link from "next/link";

type Attempt = {
  _id: string;
  date: string;
  subject?: string;
  score: number;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

const subjectFetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export default function TestHistory() {
  const { data, error, isLoading } = useSWR<Attempt[]>(
    "/api/tests/history",
    fetcher
  );
  const {
    data: subjectList,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useSWR<string[]>("/api/subjects", subjectFetcher);

  // Ensure data is always an array to prevent .map() errors
  const attempts = Array.isArray(data) ? data : [];
  const subjects = Array.isArray(subjectList) ? subjectList : [];
  const subjectsForChart = attempts.map((a) => a.subject || "General");
  const scores = attempts.map((a) => a.score);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="border rounded p-4 bg-white shadow">
        <p className="font-semibold mb-2">Recent Attempts</p>
        {isLoading && (
          <p className="text-sm text-slate-500">Loading history...</p>
        )}
        {error && <p className="text-sm text-red-600">Error loading history</p>}
        {!isLoading && !error && !attempts.length && (
          <p className="text-sm text-slate-500">No attempts yet.</p>
        )}
        {!!attempts.length && (
          <ul className="space-y-2 text-sm">
            {attempts.map((a) => (
              <li
                key={a._id}
                className="flex items-center justify-between border-b pb-1"
              >
                <span>
                  {new Date(a.date).toLocaleDateString()} •{" "}
                  {a.subject || "General"}
                </span>
                <span className="font-semibold">{a.score} pts</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3">
          <Link
            href="/test"
            className="inline-block bg-slate-900 text-white px-3 py-2 rounded text-sm"
          >
            All Subjects Mock Test
          </Link>
        </div>
      </div>
      <div className="border rounded p-4 bg-white shadow">
        <p className="font-semibold mb-2">Scores by Subject</p>
        <ProgressChart subjects={subjectsForChart} scores={scores} />
        <div className="mt-3 space-y-2">
          <p className="text-sm text-slate-600">Subject-wise mock tests</p>
          <div className="flex flex-wrap gap-2">
            {subjectsLoading && <span className="text-xs">Loading...</span>}
            {subjectsError && (
              <span className="text-xs text-red-600">
                Failed to load subjects
              </span>
            )}
            {!subjectsLoading && subjects.length === 0 && (
              <span className="text-xs text-slate-500">No subjects found.</span>
            )}
            {subjects.map((s) => (
              <Link
                key={s}
                href={`/test?subject=${encodeURIComponent(s)}`}
                className="text-xs border border-slate-300 px-2 py-1 rounded hover:border-slate-500"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
