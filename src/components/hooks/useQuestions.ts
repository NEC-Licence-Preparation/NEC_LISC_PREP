"use client";
import useSWR from "swr";

export type Question = {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  faculty: string;
  explanation?: string;
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  const data = await res.json();
  return Array.isArray(data) ? data : [];
};

export default function useQuestions(subject?: string) {
  const { data, error, isLoading, mutate } = useSWR<Question[]>(
    subject
      ? `/api/questions?subject=${encodeURIComponent(subject)}`
      : "/api/questions",
    fetcher
  );
  const questions: Question[] = data ?? [];
  return { questions, error, isLoading, mutate };
}
