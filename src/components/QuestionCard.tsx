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
  showBookmark?: boolean;
}

export default function QuestionCard({
  question,
  onAnswer,
  selectedOption,
  showExplanation = true,
  showBookmark = true,
}: Props) {
  const [selected, setSelected] = useState(selectedOption ?? "");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    setSelected(selectedOption ?? "");
  }, [selectedOption]);

  useEffect(() => {
    if (showBookmark) {
      checkBookmark();
    }
  }, [question._id, showBookmark]);

  const checkBookmark = async () => {
    try {
      const res = await fetch(`/api/bookmarks/${question._id}`);
      if (res.ok) {
        const data = await res.json();
        setIsBookmarked(data.isBookmarked);
      }
    } catch (error) {
      console.error("Error checking bookmark:", error);
    }
  };

  const toggleBookmark = async () => {
    setBookmarkLoading(true);
    try {
      if (isBookmarked) {
        const res = await fetch("/api/bookmarks", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: question._id }),
        });
        if (res.ok) {
          setIsBookmarked(false);
        }
      } else {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: question._id }),
        });
        if (res.ok) {
          setIsBookmarked(true);
        }
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <div className="border-2 border-[#DCD6F7] rounded-xl p-6 bg-gradient-to-br from-white to-[#F4EEFF]/30 shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#DCD6F7]/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#A6B1E1]"></div>
          <span className="text-xs font-medium text-[#A6B1E1] uppercase tracking-wider">
            {question.subject} • {question.faculty}
          </span>
        </div>
        {showBookmark && (
          <button
            onClick={toggleBookmark}
            disabled={bookmarkLoading}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 ${
              isBookmarked
                ? "bg-[#424874] text-white hover:bg-[#424874]/90 shadow-md"
                : "bg-[#DCD6F7] text-[#424874] hover:bg-[#A6B1E1] hover:text-white border border-[#A6B1E1]"
            }`}
            title={isBookmarked ? "Remove bookmark" : "Bookmark question"}
          >
            <span className="text-lg">{isBookmarked ? "🔖" : "📑"}</span>
            <span className="text-xs">
              {bookmarkLoading ? "..." : isBookmarked ? "Saved" : "Save"}
            </span>
          </button>
        )}
      </div>

      <div className="mb-6">
        <p className="text-lg font-semibold text-[#424874] leading-relaxed">
          {question.question}
        </p>
      </div>

      <div className="space-y-3">
        {question.options.map((opt, index) => (
          <label
            key={opt}
            className={`group flex items-start gap-3 border-2 rounded-lg px-4 py-3.5 cursor-pointer transition-all duration-200 ${
              selected === opt
                ? "border-[#424874] bg-[#424874] shadow-md transform scale-[1.02]"
                : "border-[#DCD6F7] bg-white hover:border-[#A6B1E1] hover:bg-[#F4EEFF]/50 hover:shadow-sm"
            }`}
          >
            <div className="flex items-center justify-center mt-0.5">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  selected === opt
                    ? "border-white bg-white"
                    : "border-[#A6B1E1] group-hover:border-[#424874]"
                }`}
              >
                {selected === opt && (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#424874]"></div>
                )}
              </div>
            </div>

            <div className="flex-1 flex items-center gap-3">
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${
                  selected === opt
                    ? "bg-white/20 text-white"
                    : "bg-[#DCD6F7] text-[#424874]"
                }`}
              >
                {String.fromCharCode(65 + index)}
              </span>
              <span
                className={`text-[15px] font-medium ${
                  selected === opt ? "text-white" : "text-[#424874]"
                }`}
              >
                {opt}
              </span>
            </div>

            <input
              type="radio"
              name={question._id}
              value={opt}
              checked={selected === opt}
              onChange={() => {
                setSelected(opt);
                onAnswer({ questionId: question._id, selectedOption: opt });
              }}
              className="sr-only"
            />
          </label>
        ))}
      </div>

      {showExplanation && question.explanation && (
        <div className="mt-6 pt-4 border-t border-[#DCD6F7]/50">
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
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
