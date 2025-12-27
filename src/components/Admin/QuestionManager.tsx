"use client";
import { useState } from "react";
import useSWR from "swr";

type Question = {
  _id: string;
  question: string;
  subject: string;
  faculty: string;
  explanation: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export default function QuestionManager() {
  const { data: questions, mutate } = useSWR<Question[]>(
    "/api/questions",
    fetcher
  );
  const [form, setForm] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    subject: "",
    faculty: "",
    explanation: "",
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const onCreate = async () => {
    setError("");
    setStatus("");
    const payload = { ...form, options: form.options.filter(Boolean) };
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data: { error?: string } = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to create");
    } else {
      setStatus("Question created");
      setForm({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: "",
        subject: "",
        faculty: "",
        explanation: "",
      });
      mutate();
    }
  };

  const onDelete = async (id: string) => {
    await fetch(`/api/questions/${id}`, { method: "DELETE" });
    mutate();
  };

  return (
    <div className="grid gap-4">
      <div className="border border-[#DCD6F7] rounded p-4 bg-white shadow space-y-3">
        <p className="font-semibold text-[#424874]">Add Question</p>
        <input
          className="w-full border border-[#DCD6F7] rounded px-3 py-2 focus:outline-none focus:border-[#A6B1E1]"
          placeholder="Question text"
          value={form.question}
          onChange={(e) => setForm({ ...form, question: e.target.value })}
        />
        <div className="grid md:grid-cols-2 gap-2">
          <input
            className="border border-[#DCD6F7] rounded px-3 py-2 focus:outline-none focus:border-[#A6B1E1]"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
          />
          <input
            className="border border-[#DCD6F7] rounded px-3 py-2 focus:outline-none focus:border-[#A6B1E1]"
            placeholder="Faculty"
            value={form.faculty}
            onChange={(e) => setForm({ ...form, faculty: e.target.value })}
          />
        </div>
        <input
          className="border border-[#DCD6F7] rounded px-3 py-2 focus:outline-none focus:border-[#A6B1E1]"
          placeholder="Correct answer"
          value={form.correctAnswer}
          onChange={(e) => setForm({ ...form, correctAnswer: e.target.value })}
        />
        <div className="grid md:grid-cols-2 gap-2">
          {form.options.map((opt, idx) => (
            <input
              key={idx}
              className="border border-[#DCD6F7] rounded px-3 py-2 focus:outline-none focus:border-[#A6B1E1]"
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={(e) => {
                const copy = [...form.options];
                copy[idx] = e.target.value;
                setForm({ ...form, options: copy });
              }}
            />
          ))}
        </div>
        <textarea
          className="border border-[#DCD6F7] rounded px-3 py-2 w-full focus:outline-none focus:border-[#A6B1E1]"
          placeholder="Explanation (optional)"
          rows={3}
          value={form.explanation}
          onChange={(e) => setForm({ ...form, explanation: e.target.value })}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        {status && <p className="text-sm text-green-600">{status}</p>}
        <button
          className="bg-[#424874] text-white px-4 py-2 rounded hover:bg-[#424874]/90 transition"
          onClick={onCreate}
        >
          Create
        </button>
      </div>

      <div className="border border-[#DCD6F7] rounded p-4 bg-white shadow">
        <p className="font-semibold mb-2 text-[#424874]">Questions</p>
        {!questions?.length && (
          <p className="text-sm text-[#A6B1E1]">No questions yet.</p>
        )}
        <ul className="divide-y divide-[#DCD6F7]">
          {questions?.map((q: Question) => (
            <li key={q._id} className="py-2 flex items-center justify-between">
              <div>
                <p className="font-medium text-sm text-[#424874]">
                  {q.question}
                </p>
                <p className="text-xs text-[#A6B1E1]">
                  {q.subject} • {q.faculty}
                </p>
                {q.explanation && (
                  <p className="text-xs text-[#424874]/70 mt-1">
                    Explanation: {q.explanation}
                  </p>
                )}
              </div>
              <button
                className="text-sm text-red-600 hover:text-red-700"
                onClick={() => onDelete(q._id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
