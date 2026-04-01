import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// Build providers list dynamically
const providers: NextAuthOptions["providers"] = [];

// Google OAuth — only when real credentials are configured
if (
  process.env.GOOGLE_CLIENT_ID &&
  process.env.GOOGLE_CLIENT_SECRET &&
  !process.env.GOOGLE_CLIENT_ID.startsWith("demo")
) {
  const GoogleProvider = require("next-auth/providers/google").default;
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
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
      if (
        credentials?.email === "admin@clinic.com" &&
        credentials?.password === "demo123"
      ) {
        return {
          id: "demo-admin",
          name: "Dr. Demo Admin",
          email: "admin@clinic.com",
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
        };
      }
      return null;
    },
  })
);

export const authOptions: NextAuthOptions = {
  // No PrismaAdapter — JWT-only mode works without a database
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-only",
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = "ADMIN";
        token.clinicId = null;
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
