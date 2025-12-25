"use client";
import { useEffect, useState } from "react";
import QuestionCard from "./QuestionCard";
import useQuestions, { Question } from "./hooks/useQuestions";
import { useTest } from "@/context/TestContext";

export default function TestRunner({ subject }: { subject?: string }) {
  const { questions, isLoading } = useQuestions(subject);
  const { answers, saveAnswer, setTimeTaken, timeTaken, reset } = useTest();
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    total: number;
    breakdown: {
      questionId: string;
      question: string;
      selected?: string;
      correctAnswer: string;
      explanation?: string;
      correct: boolean;
    }[];
  } | null>(null);
  const [quantity, setQuantity] = useState(10);
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [started, setStarted] = useState(false);
  const [message, setMessage] = useState("");
  const subjectLabel = subject ?? "All Subjects";
  const startWithCount = (count: number) => {
    setQuantity(count);
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
    setResult(null);
    setCurrentIdx(0);
    setTimeTaken(0);
    const start = Date.now();
    const interval = setInterval(() => {
      setTimeTaken(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [started, testQuestions, reset, setTimeTaken]);

  const onSubmit = async () => {
    const normalizedAnswers = testQuestions.map((q) => {
      const existing = answers.find((a) => a.questionId === q._id);
      return {
        questionId: q._id,
        selectedOption: existing?.selectedOption ?? "",
      };
    });

    const payload = { answers: normalizedAnswers, timeTaken, subject };
    const res = await fetch("/api/tests/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (res.ok) {
      const breakdown = testQuestions.map((q) => {
        const user = normalizedAnswers.find(
          (a) => a.questionId === q._id
        )?.selectedOption;
        const correct = user === q.correctAnswer;
        return {
          questionId: q._id,
          question: q.question,
          selected: user,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          correct,
        };
      });
      setResult({ score: data.score, total: testQuestions.length, breakdown });
    }
    setSubmitted(true);
  };

  const current = testQuestions[currentIdx];
  const selectedOption = current
    ? answers.find((a) => a.questionId === current._id)?.selectedOption || ""
    : "";

  if (isLoading) return <p>Loading questions...</p>;
  if (!questions.length) return <p>No questions yet.</p>;

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600">Subject: {subjectLabel}</p>
      {!started ? (
        <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
          <span>Choose question count to start:</span>
          {[10, 20, 100].map((q) => (
            <button
              key={q}
              className={`px-3 py-1 rounded border ${
                quantity === q
                  ? "bg-slate-900 text-white border-slate-900"
                  : "border-slate-300"
              }`}
              onClick={() => startWithCount(q)}
              disabled={isLoading}
            >
              {q}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 text-sm text-slate-600 flex-wrap">
          <span>Question count: {quantity}</span>
          <span className="ml-auto text-xs">Time: {timeTaken}s</span>
        </div>
      )}

      {!started && (
        <p className="text-sm text-slate-600">
          Select a question count to begin your test.
        </p>
      )}

      {!started && message && <p className="text-sm text-red-600">{message}</p>}

      {started && testQuestions.length === 0 && (
        <p className="text-sm text-slate-600">Not enough questions to start.</p>
      )}

      {started && testQuestions.length > 0 && (
        <>
          <div className="border rounded p-4 bg-white shadow space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-500">
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
                className="px-4 py-2 rounded border border-slate-300"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
              >
                Previous
              </button>
              {currentIdx < testQuestions.length - 1 ? (
                <button
                  className="px-4 py-2 rounded border border-slate-300"
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
                  className="bg-slate-900 text-white px-4 py-2 rounded"
                  onClick={onSubmit}
                  disabled={submitted}
                >
                  Submit Test
                </button>
              )}
            </div>
          </div>

          {submitted && result && (
            <div className="border rounded p-3 bg-white shadow space-y-2">
              <p className="font-semibold">Result</p>
              <p>
                Score: {result.score} / {result.total}
              </p>
              <div className="divide-y">
                {result.breakdown.map((b) => (
                  <div key={b.questionId} className="py-2 text-sm space-y-1">
                    <p className="font-medium">{b.question}</p>
                    <p
                      className={b.correct ? "text-green-700" : "text-red-700"}
                    >
                      {b.correct ? "Correct" : "Incorrect"}
                    </p>
                    <p>Chosen: {b.selected ?? "No answer"}</p>
                    <p>Correct: {b.correctAnswer}</p>
                    {b.explanation && (
                      <p className="text-slate-600">
                        Explanation: {b.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
