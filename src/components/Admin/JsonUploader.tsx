"use client";
import { useState } from "react";

type GroupedImport = {
  subject: string;
  faculty: string;
  questions: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
  }[];
};

type FlatImport = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  subject: string;
  faculty: string;
}[];

type QuizImport = {
  title: string;
  desc: string;
  questions: {
    q: string;
    options: string[];
    answer: string;
    explanation?: string;
  }[];
};

export default function JsonUploader() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const onFile = async (file: File) => {
    setStatus("");
    setError("");
    try {
      const text = await file.text();
      const json = JSON.parse(text) as GroupedImport | FlatImport | QuizImport;
      const res = await fetch("/api/questions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      const data: { inserted?: number; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setStatus(`Imported ${data.inserted} questions`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error importing";
      setError(message);
    }
  };

  return (
    <div className="border rounded p-4 bg-white shadow space-y-3">
      <div>
        <p className="font-semibold">Upload questions JSON</p>
        <p className="text-sm text-slate-500">
          Supported formats:
          <br />• Grouped: subject/faculty + questions[] with question, options,
          correctAnswer, optional explanation.
          <br />• Flat array with subject/faculty on each question.
          <br />• Quiz: title/desc + questions with q/answer (explanation
          optional).
        </p>
      </div>
      <input
        type="file"
        accept="application/json"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
      {status && <p className="text-green-600 text-sm">{status}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
