"use client";
import { createContext, useContext, useState } from "react";

type Answer = { questionId: string; selectedOption: string };

interface TestState {
  answers: Answer[];
  timeTaken: number;
  setTimeTaken: (t: number) => void;
  saveAnswer: (a: Answer) => void;
  reset: () => void;
}

const TestContext = createContext<TestState | null>(null);

export function TestProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeTaken, setTimeTakenState] = useState(0);

  const saveAnswer = (a: Answer) => {
    setAnswers((prev) => {
      const existing = prev.find((p) => p.questionId === a.questionId);
      if (existing)
        return prev.map((p) => (p.questionId === a.questionId ? a : p));
      return [...prev, a];
    });
  };

  const setTimeTaken = (t: number) => setTimeTakenState(t);

  const reset = () => {
    setAnswers([]);
    setTimeTakenState(0);
  };

  return (
    <TestContext.Provider
      value={{ answers, timeTaken, setTimeTaken, saveAnswer, reset }}
    >
      {children}
    </TestContext.Provider>
  );
}

export function useTest() {
  const ctx = useContext(TestContext);
  if (!ctx) throw new Error("useTest must be used within TestProvider");
  return ctx;
}
