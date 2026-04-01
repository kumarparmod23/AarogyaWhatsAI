import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "DOCTOR" | "STAFF";
      clinicId: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "DOCTOR" | "STAFF";
    clinicId: string | null;
  }
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard stats
export interface DashboardStats {
  totalPatients: number;
  newLeadsToday: number;
  appointmentsToday: number;
  activeConversations: number;
  responseRate: number;
  bookingRate: number;
  avgNpsScore: number;
  noShowRate: number;
}

// Chat types
export interface ChatMessage {
  id: string;
  content: string;
  sender: "PATIENT" | "AI" | "HUMAN" | "SYSTEM";
  direction: "INBOUND" | "OUTBOUND";
  messageType: string;
  mediaUrl?: string;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  patient: {
    id: string;
    name: string | null;
    phone: string;
    leadStatus: string;
  };
  status: string;
  flowType: string | null;
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string;
}
