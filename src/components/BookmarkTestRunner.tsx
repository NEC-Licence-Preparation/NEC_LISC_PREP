"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "./QuestionCard";

type Question = {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  faculty: string;
  explanation?: string;
};

type Answer = {
  questionId: string;
  selectedOption: string;
};

export default function BookmarkTestRunner({ bookmarkIds }: { bookmarkIds: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    fetchQuestions();
  }, [bookmarkIds]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`/api/bookmarks/questions?ids=${bookmarkIds}`);
      if (!res.ok) throw new Error("Failed to fetch questions");
      const data = await res.json();
      
      if (data.length === 0) {
        setError("No bookmarked questions found");
        setLoading(false);
        return;
      }
      
      setQuestions(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching bookmark questions:", err);
      setError("Failed to load bookmarked questions");
      setLoading(false);
    }
  };

  const handleAnswer = (answer: Answer) => {
    const existing = answers.findIndex((a) => a.questionId === answer.questionId);
    if (existing > -1) {
      const updated = [...answers];
      updated[existing] = answer;
      setAnswers(updated);
    } else {
      setAnswers([...answers, answer]);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.length === 0) {
      alert("Please answer at least one question before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000); // in seconds
      
      const res = await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          answers,
          timeTaken,
          subject: "Bookmarked Questions"
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit test");
      }

      const result = await res.json();
      router.push(`/test/result?attemptId=${result.attemptId}`);
    } catch (err) {
      console.error("Error submitting test:", err);
      alert(`Failed to submit test: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-[#A6B1E1]">Loading bookmarked questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => router.push("/bookmarks")}
          className="bg-[#424874] text-white px-6 py-2 rounded-lg hover:bg-[#424874]/90 transition"
        >
          Back to Bookmarks
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.find((a) => a.questionId === currentQuestion._id);

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-[#DCD6F7] rounded-lg p-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-[#424874]/70">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <p className="text-xs text-[#A6B1E1] mt-1">
            {answers.length} / {questions.length} answered
          </p>
        </div>
        <button
          onClick={() => router.push("/bookmarks")}
          className="text-sm text-[#A6B1E1] hover:text-[#424874] transition"
        >
          Back to Bookmarks
        </button>
      </div>

      <QuestionCard
        question={currentQuestion}
        onAnswer={handleAnswer}
        selectedOption={currentAnswer?.selectedOption}
        showExplanation={false}
        showBookmark={false}
      />

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-6 py-2 border-2 border-[#A6B1E1] text-[#424874] rounded-lg hover:bg-[#A6B1E1] hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Previous
        </button>

        <div className="flex gap-2">
          {questions.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition ${
                idx === currentIndex
                  ? "bg-[#424874] text-white"
                  : answers.find((a) => a.questionId === questions[idx]._id)
                  ? "bg-[#A6B1E1] text-white"
                  : "bg-[#DCD6F7] text-[#424874] hover:bg-[#A6B1E1] hover:text-white"
              }`}
            >
              {idx + 1}
            </button>
          ))}
        </div>

        {currentIndex < questions.length - 1 ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-[#424874] text-white rounded-lg hover:bg-[#424874]/90 transition font-medium"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || answers.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Submit Test"}
          </button>
        )}
      </div>
    </div>
  );
}
