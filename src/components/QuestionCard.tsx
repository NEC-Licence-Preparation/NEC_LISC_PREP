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
    <div className="border border-[#DCD6F7] rounded p-4 bg-white shadow">
      <div className="flex items-center justify-between mb-2 text-sm text-[#A6B1E1]">
        <span>
          {question.subject} / {question.faculty}
        </span>
      </div>
      <p className="font-semibold mb-3 text-[#424874]">{question.question}</p>
      <div className="space-y-2">
        {question.options.map((opt) => (
          <label
            key={opt}
            className={`flex items-center gap-2 border rounded px-3 py-2 cursor-pointer transition ${
              selected === opt
                ? "border-[#424874] bg-[#DCD6F7]/30"
                : "border-[#DCD6F7] hover:border-[#A6B1E1]"
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
              className="accent-[#424874]"
            />
            <span className="text-[#424874]">{opt}</span>
          </label>
        ))}
      </div>
      {showExplanation && question.explanation && (
        <p className="text-xs text-[#A6B1E1] mt-3">{question.explanation}</p>
      )}
    </div>
  );
}
