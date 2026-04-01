import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  // Format Indian phone: +91XXXXXXXXXX → +91 XXXXX XXXXX
  if (phone.startsWith("+91") && phone.length === 13) {
    return `+91 ${phone.slice(3, 8)} ${phone.slice(8)}`;
  }
  return phone;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("hi-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString("hi-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "अभी";
  if (diffMins < 60) return `${diffMins} min पहले`;
  if (diffHours < 24) return `${diffHours} hr पहले`;
  if (diffDays < 7) return `${diffDays} दिन पहले`;
  return formatDate(date);
}

export function getLeadStatusColor(status: string): string {
  const colors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-800",
    CONTACTED: "bg-yellow-100 text-yellow-800",
    QUALIFIED: "bg-purple-100 text-purple-800",
    HOT: "bg-red-100 text-red-800",
    APPOINTMENT_BOOKED: "bg-green-100 text-green-800",
    VISITED: "bg-emerald-100 text-emerald-800",
    FOLLOW_UP: "bg-orange-100 text-orange-800",
    CONVERTED: "bg-teal-100 text-teal-800",
    LOST: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getLeadStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    NEW: "नया",
    CONTACTED: "संपर्क किया",
    QUALIFIED: "क्वालिफाइड",
    HOT: "हॉट लीड",
    APPOINTMENT_BOOKED: "अपॉइंटमेंट बुक",
    VISITED: "विज़िट किया",
    FOLLOW_UP: "फॉलो-अप",
    CONVERTED: "कन्वर्टेड",
    LOST: "लॉस्ट",
  };
  return labels[status] || status;
}

// Simple rate limiter for API routes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}
