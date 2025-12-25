import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    role?: "admin" | "user";
    user?: DefaultSession["user"] & { id?: string };
  }

  interface User {
    role?: "admin" | "user";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "user";
  }
}
