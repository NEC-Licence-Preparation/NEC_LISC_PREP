"use client";
import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, { cache: "no-store" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch count");
  return (data?.count as number) ?? 0;
};

export default function useWrongCount() {
  const { data, error, isLoading, mutate } = useSWR<number>(
    "/api/tests/wrong/count",
    fetcher
  );
  const count = data ?? 0;
  return { count, error, isLoading, mutate };
}
