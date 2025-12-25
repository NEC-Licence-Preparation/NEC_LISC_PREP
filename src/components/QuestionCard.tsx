"use client";
import { useEffect, useState } from "react";

type Question = {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  faculty: string;
  explanation?: string;
};

interface Props {
  question: Question;
  onAnswer: (answer: { questionId: string; selectedOption: string }) => void;
  selectedOption?: string;
  showExplanation?: boolean;
}

export default function QuestionCard({
  question,
  onAnswer,
  selectedOption,
  showExplanation = true,
}: Props) {
  const [selected, setSelected] = useState(selectedOption ?? "");

  useEffect(() => {
    setSelected(selectedOption ?? "");
  }, [selectedOption]);
  return (
    <div className="border rounded p-4 bg-white shadow">
      <div className="flex items-center justify-between mb-2 text-sm text-slate-500">
        <span>
          {question.subject} / {question.faculty}
        </span>
      </div>
      <p className="font-semibold mb-3">{question.question}</p>
      <div className="space-y-2">
        {question.options.map((opt) => (
          <label
            key={opt}
            className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer ${
              selected === opt ? "border-slate-900" : "border-slate-200"
            }`}
          >
            <input
              type="radio"
              name={question._id}
              value={opt}
              checked={selected === opt}
              onChange={() => {
                setSelected(opt);
                onAnswer({ questionId: question._id, selectedOption: opt });
              }}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {showExplanation && question.explanation && (
        <p className="text-xs text-slate-500 mt-3">{question.explanation}</p>
      )}
    </div>
  );
}
