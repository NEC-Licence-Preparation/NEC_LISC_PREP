"use client";
import { SessionProvider } from "next-auth/react";
import { TestProvider } from "@/context/TestContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TestProvider>{children}</TestProvider>
    </SessionProvider>
  );
}
