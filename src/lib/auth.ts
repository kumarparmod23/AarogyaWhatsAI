import { NextAuthOptions, getServerSession } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "./db";

// Build providers list dynamically
const providers: NextAuthOptions["providers"] = [];

// Google OAuth — only when credentials are configured
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== "your-google-client-id"
) {
  // Dynamic import to avoid errors when not configured
  const GoogleProvider = require("next-auth/providers/google").default;
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Email magic link — only when EMAIL_SERVER is configured
if (process.env.EMAIL_SERVER) {
  const EmailProvider = require("next-auth/providers/email").default;
  providers.push(
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM || "noreply@aarogyawhatsai.com",
    })
  );
}

// Demo/Credentials login — always available
providers.push(
  CredentialsProvider({
    name: "Demo Login",
    credentials: {
      email: { label: "Email", type: "email", placeholder: "admin@clinic.com" },
      password: { label: "Password", type: "password", placeholder: "demo123" },
    },
    async authorize(credentials) {
      // Demo credentials
      if (
        credentials?.email === "admin@clinic.com" &&
        credentials?.password === "demo123"
      ) {
        return {
          id: "demo-admin",
          name: "Dr. Demo Admin",
          email: "admin@clinic.com",
          role: "ADMIN",
        };
      }

      if (
        credentials?.email === "staff@clinic.com" &&
        credentials?.password === "demo123"
      ) {
        return {
          id: "demo-staff",
          name: "Staff Demo",
          email: "staff@clinic.com",
          role: "STAFF",
        };
      }

      return null;
    },
  })
);

export const authOptions: NextAuthOptions = {
  // Only use PrismaAdapter when we have a real DB connection
  ...(process.env.DATABASE_URL &&
  !process.env.DATABASE_URL.includes("your-neon-database-url")
    ? { adapter: PrismaAdapter(db) as NextAuthOptions["adapter"] }
    : {}),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id || user.id;
        token.role = (user as any).role || "ADMIN";
        token.clinicId = (user as any).clinicId || null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).clinicId = token.clinicId;
      }
      return session;
    },
  },
};

export async function getAuth() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getAuth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
