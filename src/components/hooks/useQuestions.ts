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

const fetcher = (url: string) =>
  fetch(url).then((r) => r.json() as Promise<Question[]>);

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
