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
              password: null,
            });
          }
          return true;
        } catch (error) {
          console.error("Error in Google OAuth signIn:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as { role?: "admin" | "user" }).role || "user";
      }
      // If logged in via Google, get user from DB and store MongoDB _id
      if (account?.provider === "google" && token.email) {
        await connectDB();
        const existing = await User.findOne({ email: token.email });
        if (existing) {
          token.role = existing.role;
          token.userId = String(existing._id); // Store MongoDB user ID
        }
      }
      // For credentials provider, user ID is already in token.sub
      if (account?.provider === "credentials" && user) {
        token.userId = (user as any).id || token.sub;
      }
      return token;
    },
    async session({ session, token }) {
      session.role = (token as JWT).role || "user";
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
