"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "./QuestionCard";
import useDailyQuestions from "./hooks/useDailyQuestions";
import { useTest } from "@/context/TestContext";

const getDurationForSet = (setSize: "10" | "100") => {
  return setSize === "10" ? 9 * 60 : 90 * 60; // 9 min for 10, 90 min for 100
};

const formatTime = (secs: number) => {
  const m = Math.floor(secs / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(secs % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

export default function DailyTestRunner({
  setSize,
}: {
  setSize: "10" | "100";
}) {
  const { questions, isLoading, error } = useDailyQuestions(setSize);
  const { answers, saveAnswer, setTimeTaken, timeTaken, reset } = useTest();
  const router = useRouter();

  const answersRef = useRef(answers);
  const questionsRef = useRef(questions);
  const submittedRef = useRef(false);
  const autoSubmittingRef = useRef(false);

  const [submitted, setSubmitted] = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const durationSeconds = getDurationForSet(setSize);
  const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  // Auto-start when questions load
  useEffect(() => {
    if (!isLoading && questions.length > 0 && !started) {
      reset();
      setSubmitted(false);
      submittedRef.current = false;
      setAutoSubmitting(false);
      autoSubmittingRef.current = false;
      setCurrentIdx(0);
      setTimeTaken(0);
      setSubmitError("");
      setRemainingSeconds(durationSeconds);
      setStarted(true);
    }
  }, [isLoading, questions, started, reset, setTimeTaken, durationSeconds]);

  // Timer
  useEffect(() => {
    if (!started || !questions.length) return;

    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const remaining = Math.max(0, durationSeconds - elapsed);
      setTimeTaken(elapsed);
      setRemainingSeconds(remaining);

      if (
        remaining <= 0 &&
        !submittedRef.current &&
        !autoSubmittingRef.current
      ) {
        onSubmit(true, elapsed);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [started, questions, durationSeconds, setTimeTaken]);

  const onSubmit = async (auto = false, elapsedOverride?: number) => {
    if (submittedRef.current || autoSubmittingRef.current) return;

    setSubmitError("");
    if (auto) {
      setAutoSubmitting(true);
      autoSubmittingRef.current = true;
    }
    setSubmitted(true);
    submittedRef.current = true;

    const normalizedAnswers = (questionsRef.current || []).map((q) => {
      const existing = (answersRef.current || []).find(
        (a) => a.questionId === q._id
      );
      return {
        questionId: q._id,
        selectedOption: existing?.selectedOption ?? "",
      };
    });

    const payload = {
      answers: normalizedAnswers,
      timeTaken:
        typeof elapsedOverride === "number"
          ? Math.min(durationSeconds, elapsedOverride)
          : Math.min(durationSeconds, timeTaken),
      subject: "Daily Test",
      isDailyTest: true,
      setSize,
    };

    try {
      const res = await fetch("/api/tests/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.attemptId) {
        router.push(`/test/result?attemptId=${data.attemptId}`);
        return;
      }
      setSubmitError(data?.error || "Failed to submit test. Please try again.");
      setSubmitted(false);
      submittedRef.current = false;
      setAutoSubmitting(false);
      autoSubmittingRef.current = false;
    } catch (err) {
      console.error(err);
      setSubmitError("Network error. Please try again.");
      setSubmitted(false);
      submittedRef.current = false;
      setAutoSubmitting(false);
      autoSubmittingRef.current = false;
    }
  };

  const current = questions[currentIdx];
  const selectedOption = current
    ? answers.find((a) => a.questionId === current._id)?.selectedOption || ""
    : "";

  if (isLoading) return <p>Loading today's test...</p>;
  if (error)
    return <p className="text-red-600">Error: {String(error)}</p>;
  if (!started || questions.length === 0)
    return <p className="text-slate-600">No test available.</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Daily {setSize}-Question Test</p>

      {started && questions.length > 0 && (
        <>
          <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
            <span>
              Question {currentIdx + 1} / {questions.length}
            </span>
            <span className="ml-auto text-xs font-semibold text-slate-700">
              Time left: {formatTime(remainingSeconds)}
            </span>
          </div>

          <div className="border rounded p-4 bg-white shadow space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>
                Question {currentIdx + 1} / {questions.length}
              </span>
              <span className="text-xs">
                Answered {answers.length} / {questions.length}
              </span>
            </div>

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
                className="px-4 py-2 rounded border border-slate-300"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
              >
                Previous
              </button>
              {currentIdx < questions.length - 1 ? (
                <button
                  className="px-4 py-2 rounded border border-slate-300"
                  onClick={() =>
                    setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))
                  }
                >
                  Next
                </button>
              ) : (
                <button
                  className="bg-slate-900 text-white px-4 py-2 rounded"
                  onClick={() => onSubmit()}
                  disabled={submitted}
                >
                  Submit Test
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
