import type { NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { connectDB } from "./mongodb";
import User from "@/models/User";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        await connectDB();
        const user = await User.findOne({ email: credentials.email }).lean();
        if (!user || !user.password) return null;
        const isValid = await compare(credentials.password, user.password);
        if (!isValid) return null;
        return {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
          faculty: user.faculty,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in for Google OAuth
      if (account?.provider === "google") {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user for Google OAuth
            await User.create({
              name: user.name || profile?.name,
              email: user.email,
              role: "user",
              password: undefined,
            } as Partial<typeof User.schema.obj>);
          }
          return true;
        } catch (error) {
          console.error("Error in Google OAuth signIn:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session }) {
      // Handle session updates (e.g., when faculty is set)
      if (trigger === "update" && session && (session as any).faculty) {
        token.faculty = (session as any).faculty;
        return token;
      }

      // On fresh login (account exists), always load from DB
      if (account && token.email) {
        try {
          await connectDB();
          const existing = await User.findOne({ email: token.email }).lean();
          if (existing) {
            token.role = existing.role;
            token.userId = String(existing._id);
            token.faculty = existing.faculty || null;
            console.log(
              "JWT: Fresh login loaded faculty from DB:",
              existing.faculty,
              "for",
              token.email
            );
          }
        } catch (error) {
          console.error("JWT callback error on login:", error);
        }
        return token;
      }

      // On subsequent requests, use cached token values
      if (user) {
        token.role = (user as { role?: "admin" | "user" }).role || "user";
        token.faculty = (user as { faculty?: string | null }).faculty || null;
      }

      return token;
    },
    async session({ session, token }) {
      session.role = (token as JWT).role || "user";
      if (session.user && (token as JWT & { userId?: string }).userId) {
        session.user.id = (token as JWT & { userId?: string }).userId;
      } else if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      if (session.user) {
        session.user.faculty =
          (token as JWT & { faculty?: string | null }).faculty || null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
