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
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data?.error || "Failed to fetch");
  }
  const data = await res.json();
  return data as {
    date: string;
    faculty: string;
    setSize: string;
    questions: Question[];
  };
};

export default function useDailyQuestions(setSize: "10" | "100") {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/tests/daily?set=${setSize}`,
    fetcher
  );

  return {
    data,
    questions: data?.questions ?? [],
    error,
    isLoading,
    mutate,
  };
}
