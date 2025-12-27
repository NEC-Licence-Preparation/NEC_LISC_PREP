"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import useWrongQuestions from "./hooks/useWrongQuestions";
import QuestionCard from "./QuestionCard";
import { useTest } from "@/context/TestContext";

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

export default function WrongRetestRunner() {
  const { questions, isLoading, mutate } = useWrongQuestions();
  const { answers, saveAnswer, setTimeTaken, timeTaken, reset } = useTest();
  const router = useRouter();

  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [info, setInfo] = useState("");
  const durationSeconds = 9 * 60;
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);

  const answersRef = useRef(answers);
  const submittedRef = useRef(false);
  const questionsRef = useRef(questions);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  // Start automatically when we have questions
  useEffect(() => {
    if (!isLoading && questions.length > 0) {
      setInfo("");
      reset();
      setTimeTaken(0);
      setCurrentIdx(0);
      setStarted(true);
      setRemainingSeconds(durationSeconds);
    }
    if (!isLoading && questions.length === 0) {
      setStarted(false);
      setInfo("No wrong questions left. Great job!");
    }
  }, [isLoading, questions, reset, setTimeTaken]);

  useEffect(() => {
    if (!started) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);
      setTimeTaken(elapsed);
      setRemainingSeconds(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [started, setTimeTaken]);

  const onSubmit = async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    setSubmitError("");

    const payload = {
      answers: (questionsRef.current || []).map((q) => {
        const existing = (answersRef.current || []).find(
          (a) => a.questionId === q._id
        );
        return {
          questionId: q._id,
          selectedOption: existing?.selectedOption ?? "",
        };
      }),
      timeTaken: Math.min(durationSeconds, timeTaken),
      subject: undefined,
    };

    try {
      const res = await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data?.error || "Failed to submit.");
        submittedRef.current = false;
        return;
      }
      // Navigate to result page for detailed breakdown
      if (data?.attemptId) {
        router.push(`/test/result?attemptId=${data.attemptId}`);
        return;
      }
      // Fallback: refresh wrong question pool
      await mutate();
      setInfo("Submission saved. Reloaded wrong question pool.");
      submittedRef.current = false;
    } catch (err) {
      console.error(err);
      setSubmitError("Network error. Please try again.");
      submittedRef.current = false;
    }
  };

  const current = questions[currentIdx];
  const selectedOption = current
    ? answers.find((a) => a.questionId === current._id)?.selectedOption || ""
    : "";

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#424874]/70">
        Retest wrong questions (up to 10 per batch)
      </p>
      {isLoading && <p className="text-[#424874]">Loading questions...</p>}
      {!isLoading && info && <p className="text-[#424874] text-sm">{info}</p>}

      {started && questions.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm text-[#424874]/70 flex-wrap">
            <span>
              Question {currentIdx + 1} / {questions.length}
            </span>
            <span className="ml-auto text-xs font-semibold text-[#424874]">
              Time left: {formatTime(remainingSeconds)}
            </span>
          </div>

          <div className="border border-[#DCD6F7] rounded p-4 bg-white shadow space-y-3">
            {current && (
              <QuestionCard
                question={current}
                onAnswer={saveAnswer}
                selectedOption={selectedOption}
                showExplanation={false}
              />
            )}

            <div className="flex items-center justify-between gap-2">
              <button
                className="px-4 py-2 rounded border border-[#A6B1E1] text-[#424874] hover:bg-[#DCD6F7] transition"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
              >
                Previous
              </button>
              {currentIdx < questions.length - 1 ? (
                <button
                  className="px-4 py-2 rounded border border-[#A6B1E1] text-[#424874] hover:bg-[#DCD6F7] transition"
                  onClick={() =>
                    setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))
                  }
                >
                  Next
                </button>
              ) : (
                <button
                  className="bg-[#424874] text-white px-4 py-2 rounded hover:bg-[#424874]/90 transition"
                  onClick={onSubmit}
                >
                  Submit Batch
                </button>
              )}
            </div>
            {submitError && (
              <p className="text-sm text-red-600" role="alert">
                {submitError}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
