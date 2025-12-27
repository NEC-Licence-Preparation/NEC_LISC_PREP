"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import QuestionCard from "./QuestionCard";
import useQuestions, { Question } from "./hooks/useQuestions";
import { useTest } from "@/context/TestContext";

const getDurationForCount = (count: number) => {
  if (count >= 100) return 90 * 60; // 90 minutes
  if (count >= 20) return 18 * 60; // 18 minutes
  return 9 * 60; // 9 minutes for 10 questions
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

export default function TestRunner({
  subject,
  preselectedCount,
}: {
  subject?: string;
  preselectedCount?: number;
}) {
  const { questions, isLoading } = useQuestions(subject);
  const { answers, saveAnswer, setTimeTaken, timeTaken, reset } = useTest();
  const router = useRouter();

  const answersRef = useRef(answers);
  const testQuestionsRef = useRef<Question[]>([]);
  const submittedRef = useRef(false);
  const autoSubmittingRef = useRef(false);

  const [submitted, setSubmitted] = useState(false);
  const [autoSubmitting, setAutoSubmitting] = useState(false);
  const [quantity, setQuantity] = useState(preselectedCount || 10);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [durationSeconds, setDurationSeconds] = useState(
    getDurationForCount(preselectedCount || 10)
  );
  const [remainingSeconds, setRemainingSeconds] = useState(
    getDurationForCount(preselectedCount || 10)
  );
  const subjectLabel = subject ?? "All Subjects";

  // Auto-start if preselectedCount is provided
  useEffect(() => {
    if (preselectedCount && !started && !isLoading && questions.length > 0) {
      startWithCount(preselectedCount);
    }
  }, [preselectedCount, started, isLoading, questions.length]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    testQuestionsRef.current = testQuestions;
  }, [testQuestions]);

  const startWithCount = (count: number) => {
    setQuantity(count);
    setDurationSeconds(getDurationForCount(count));
    // Subject-specific: sample globally
    if (subject) {
      if (questions.length < count) {
        setMessage(
          `Only ${questions.length} questions available for ${subject}. Need ${count}.`
        );
        setStarted(false);
        setTestQuestions([]);
        return;
      }
      setMessage("");
      const pool = [...questions];
      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const picked = pool.slice(0, Math.min(count, pool.length));
      setTestQuestions(picked);
      setStarted(true);
      return;
    }

    // All-subject: enforce even split across subjects
    const grouped = questions.reduce<Record<string, Question[]>>((acc, q) => {
      const key = q.subject || "General";
      acc[key] = acc[key] || [];
      acc[key].push(q);
      return acc;
    }, {});
    const subjectsList = Object.keys(grouped);
    if (!subjectsList.length) {
      setMessage("No subjects available.");
      setStarted(false);
      setTestQuestions([]);
      return;
    }
    if (count % subjectsList.length !== 0) {
      setMessage(
        `Choose a count that is a multiple of ${subjectsList.length} for an equal split.`
      );
      setStarted(false);
      setTestQuestions([]);
      return;
    }
    const perSubject = count / subjectsList.length;
    for (const s of subjectsList) {
      if (grouped[s].length < perSubject) {
        setMessage(
          `Need ${perSubject} questions for ${s}, but only ${grouped[s].length} available.`
        );
        setStarted(false);
        setTestQuestions([]);
        return;
      }
    }
    setMessage("");
    const picks: Question[] = [];
    for (const s of subjectsList) {
      const pool = [...grouped[s]];
      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      picks.push(...pool.slice(0, perSubject));
    }
    // Shuffle combined picks so questions are mixed
    for (let i = picks.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [picks[i], picks[j]] = [picks[j], picks[i]];
    }
    setTestQuestions(picks);
    setStarted(true);
  };

  useEffect(() => {
    if (!started || !testQuestions.length) return;
    reset();
    setSubmitted(false);
    submittedRef.current = false;
    setAutoSubmitting(false);
    autoSubmittingRef.current = false;
    setCurrentIdx(0);
    setTimeTaken(0);
    setSubmitError("");
    setRemainingSeconds(durationSeconds);

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
  }, [started, testQuestions, durationSeconds, reset, setTimeTaken]);

  const onSubmit = async (auto = false, elapsedOverride?: number) => {
    if (submittedRef.current || autoSubmittingRef.current) return;

    setSubmitError("");
    if (auto) {
      setAutoSubmitting(true);
      autoSubmittingRef.current = true;
    }
    setSubmitted(true);
    submittedRef.current = true;

    const normalizedAnswers = (testQuestionsRef.current || []).map((q) => {
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
      subject,
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

  const current = testQuestions[currentIdx];
  const selectedOption = current
    ? answers.find((a) => a.questionId === current._id)?.selectedOption || ""
    : "";

  if (isLoading) return <p>Loading questions...</p>;
  if (!questions.length) return <p>No questions yet.</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#424874]/70">Subject: {subjectLabel}</p>
      {!started ? (
        <div className="flex items-center gap-2 text-sm text-[#424874]/70 flex-wrap">
          <span>Choose question count to start:</span>
          {[10, 20, 100].map((q) => (
            <button
              key={q}
              className={`px-3 py-1 rounded border transition ${
                quantity === q
                  ? "bg-[#424874] text-white border-[#424874]"
                  : "border-[#A6B1E1] text-[#424874] hover:bg-[#DCD6F7]"
              }`}
              onClick={() => startWithCount(q)}
              disabled={isLoading}
            >
              {q}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-[#424874]/70 flex-wrap">
          <span>Question count: {quantity}</span>
          <span className="ml-auto text-xs font-semibold text-[#424874]">
            Time left: {formatTime(remainingSeconds)}
          </span>
        </div>
      )}

      {!started && (
        <p className="text-sm text-[#424874]/70">
          Select a question count to begin your test.
        </p>
      )}

      {!started && message && <p className="text-sm text-red-600">{message}</p>}

      {started && testQuestions.length === 0 && (
        <p className="text-sm text-[#424874]/70">
          Not enough questions to start.
        </p>
      )}

      {started && testQuestions.length > 0 && (
        <>
          <div className="border border-[#DCD6F7] rounded p-4 bg-white shadow space-y-3">
            <div className="flex items-center justify-between text-sm text-[#A6B1E1]">
              <span>
                Question {currentIdx + 1} / {testQuestions.length}
              </span>
              <span className="text-xs">
                Answered {answers.length} / {testQuestions.length}
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
                className="px-4 py-2 rounded border border-[#A6B1E1] text-[#424874] hover:bg-[#DCD6F7] transition"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
              >
                Previous
              </button>
              {currentIdx < testQuestions.length - 1 ? (
                <button
                  className="px-4 py-2 rounded border border-[#A6B1E1] text-[#424874] hover:bg-[#DCD6F7] transition"
                  onClick={() =>
                    setCurrentIdx((i) =>
                      Math.min(testQuestions.length - 1, i + 1)
                    )
                  }
                >
                  Next
                </button>
              ) : (
                <button
                  className="bg-[#424874] text-white px-4 py-2 rounded hover:bg-[#424874]/90 transition"
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
