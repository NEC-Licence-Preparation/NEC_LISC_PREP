import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    role?: "admin" | "user";
    user?: DefaultSession["user"] & { id?: string; faculty?: string | null };
  }

  interface User {
    role?: "admin" | "user";
    faculty?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "user";
    faculty?: string | null;
    userId?: string;
  }
}
