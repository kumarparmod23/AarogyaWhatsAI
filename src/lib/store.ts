"use client";

// ─── Types ──────────────────────────────────────────────────────

export interface ClinicConfig {
  clinicName: string;
  doctorName: string;
  phone: string;
  address: string;
  specialization: string;
}

export interface ApiKeys {
  whatsappAccessToken: string;
  whatsappPhoneNumberId: string;
  whatsappAppSecret: string;
  whatsappVerifyToken: string;
  aiProvider: "openai" | "anthropic" | "grok";
  aiApiKey: string;
}

export interface Patient {
  id: string;
  phone: string;
  name: string;
  age?: number;
  gender?: string;
  city?: string;
  email?: string;
  leadStatus: string;
  tags: string[];
  medicalNotes?: string;
  consentGiven: boolean;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  patientId: string;
  direction: "INBOUND" | "OUTBOUND";
  sender: "PATIENT" | "AI" | "HUMAN";
  content: string;
  messageType: string;
  status: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  dateTime: string;
  duration: number;
  type?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  templateName: string;
  message: string;
  targetFilter: string;
  status: string;
  totalTargets: number;
  sent: number;
  failed: number;
  createdAt: string;
}

export interface Feedback {
  id: string;
  patientId: string;
  patientName: string;
  npsScore: number;
  comment?: string;
  createdAt: string;
}

// ─── Storage Keys ───────────────────────────────────────────────

const KEYS = {
  SETUP_DONE: "aarogya_setup_done",
  CLINIC: "aarogya_clinic",
  API_KEYS: "aarogya_api_keys",
  PATIENTS: "aarogya_patients",
  MESSAGES: "aarogya_messages",
  APPOINTMENTS: "aarogya_appointments",
  CAMPAIGNS: "aarogya_campaigns",
  FEEDBACKS: "aarogya_feedbacks",
};

// ─── Helpers ────────────────────────────────────────────────────

function get<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Setup ──────────────────────────────────────────────────────

export const store = {
  isSetupDone: () => get<boolean>(KEYS.SETUP_DONE, false),
  markSetupDone: () => set(KEYS.SETUP_DONE, true),

  // ─── Clinic Config ────────────────────────────────────────
  getClinic: (): ClinicConfig =>
    get<ClinicConfig>(KEYS.CLINIC, {
      clinicName: "",
      doctorName: "",
      phone: "",
      address: "",
      specialization: "",
    }),
  setClinic: (c: ClinicConfig) => set(KEYS.CLINIC, c),

  // ─── API Keys ─────────────────────────────────────────────
  getApiKeys: (): ApiKeys =>
    get<ApiKeys>(KEYS.API_KEYS, {
      whatsappAccessToken: "",
      whatsappPhoneNumberId: "",
      whatsappAppSecret: "",
      whatsappVerifyToken: "",
      aiProvider: "openai",
      aiApiKey: "",
    }),
  setApiKeys: (k: ApiKeys) => set(KEYS.API_KEYS, k),

  // ─── Patients ─────────────────────────────────────────────
  getPatients: (): Patient[] => get<Patient[]>(KEYS.PATIENTS, []),

  addPatient: (data: Omit<Patient, "id" | "createdAt" | "updatedAt">): Patient => {
    const patients = get<Patient[]>(KEYS.PATIENTS, []);
    const patient: Patient = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    patients.unshift(patient);
    set(KEYS.PATIENTS, patients);
    return patient;
  },

  updatePatient: (id: string, data: Partial<Patient>): Patient | null => {
    const patients = get<Patient[]>(KEYS.PATIENTS, []);
    const idx = patients.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    patients[idx] = { ...patients[idx], ...data, updatedAt: new Date().toISOString() };
    set(KEYS.PATIENTS, patients);
    return patients[idx];
  },

  deletePatient: (id: string) => {
    const patients = get<Patient[]>(KEYS.PATIENTS, []).filter((p) => p.id !== id);
    set(KEYS.PATIENTS, patients);
  },

  getPatient: (id: string): Patient | undefined =>
    get<Patient[]>(KEYS.PATIENTS, []).find((p) => p.id === id),

  findPatientByPhone: (phone: string): Patient | undefined =>
    get<Patient[]>(KEYS.PATIENTS, []).find((p) => p.phone === phone),

  // ─── Messages ─────────────────────────────────────────────
  getMessages: (patientId?: string): Message[] => {
    const msgs = get<Message[]>(KEYS.MESSAGES, []);
    return patientId ? msgs.filter((m) => m.patientId === patientId) : msgs;
  },

  addMessage: (data: Omit<Message, "id" | "createdAt">): Message => {
    const messages = get<Message[]>(KEYS.MESSAGES, []);
    const msg: Message = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    messages.push(msg);
    set(KEYS.MESSAGES, messages);
    return msg;
  },

  // ─── Appointments ─────────────────────────────────────────
  getAppointments: (patientId?: string): Appointment[] => {
    const appts = get<Appointment[]>(KEYS.APPOINTMENTS, []);
    return patientId ? appts.filter((a) => a.patientId === patientId) : appts;
  },

  addAppointment: (data: Omit<Appointment, "id" | "createdAt">): Appointment => {
    const appts = get<Appointment[]>(KEYS.APPOINTMENTS, []);
    const appt: Appointment = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    appts.unshift(appt);
    set(KEYS.APPOINTMENTS, appts);
    return appt;
  },

  updateAppointment: (id: string, data: Partial<Appointment>) => {
    const appts = get<Appointment[]>(KEYS.APPOINTMENTS, []);
    const idx = appts.findIndex((a) => a.id === id);
    if (idx !== -1) appts[idx] = { ...appts[idx], ...data };
    set(KEYS.APPOINTMENTS, appts);
  },

  // ─── Campaigns ────────────────────────────────────────────
  getCampaigns: (): Campaign[] => get<Campaign[]>(KEYS.CAMPAIGNS, []),

  addCampaign: (data: Omit<Campaign, "id" | "createdAt">): Campaign => {
    const campaigns = get<Campaign[]>(KEYS.CAMPAIGNS, []);
    const campaign: Campaign = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    campaigns.unshift(campaign);
    set(KEYS.CAMPAIGNS, campaigns);
    return campaign;
  },

  updateCampaign: (id: string, data: Partial<Campaign>) => {
    const campaigns = get<Campaign[]>(KEYS.CAMPAIGNS, []);
    const idx = campaigns.findIndex((c) => c.id === id);
    if (idx !== -1) campaigns[idx] = { ...campaigns[idx], ...data };
    set(KEYS.CAMPAIGNS, campaigns);
  },

  // ─── Feedbacks ────────────────────────────────────────────
  getFeedbacks: (): Feedback[] => get<Feedback[]>(KEYS.FEEDBACKS, []),

  addFeedback: (data: Omit<Feedback, "id" | "createdAt">): Feedback => {
    const feedbacks = get<Feedback[]>(KEYS.FEEDBACKS, []);
    const fb: Feedback = {
      ...data,
      id: genId(),
      createdAt: new Date().toISOString(),
    };
    feedbacks.unshift(fb);
    set(KEYS.FEEDBACKS, feedbacks);
    return fb;
  },

  // ─── Analytics (computed) ─────────────────────────────────
  getAnalytics: () => {
    const patients = get<Patient[]>(KEYS.PATIENTS, []);
    const messages = get<Message[]>(KEYS.MESSAGES, []);
    const appointments = get<Appointment[]>(KEYS.APPOINTMENTS, []);
    const feedbacks = get<Feedback[]>(KEYS.FEEDBACKS, []);
    const today = new Date().toISOString().slice(0, 10);

    const newToday = patients.filter((p) => p.createdAt.slice(0, 10) === today).length;
    const apptsToday = appointments.filter((a) => a.dateTime.slice(0, 10) === today).length;
    const activeConvos = new Set(
      messages.filter((m) => {
        const age = Date.now() - new Date(m.createdAt).getTime();
        return age < 24 * 60 * 60 * 1000; // last 24h
      }).map((m) => m.patientId)
    ).size;

    const totalInbound = messages.filter((m) => m.direction === "INBOUND").length;
    const totalOutbound = messages.filter((m) => m.direction === "OUTBOUND").length;
    const responseRate = totalInbound > 0 ? Math.round((totalOutbound / totalInbound) * 100) : 0;

    const bookedCount = patients.filter((p) => p.leadStatus === "APPOINTMENT_BOOKED" || p.leadStatus === "CONVERTED").length;
    const bookingRate = patients.length > 0 ? Math.round((bookedCount / patients.length) * 100) : 0;

    const npsScores = feedbacks.map((f) => f.npsScore).filter(Boolean);
    const avgNps = npsScores.length > 0 ? Math.round((npsScores.reduce((a, b) => a + b, 0) / npsScores.length) * 10) / 10 : 0;

    const noShowCount = appointments.filter((a) => a.status === "NO_SHOW").length;
    const noShowRate = appointments.length > 0 ? Math.round((noShowCount / appointments.length) * 100) : 0;

    return {
      totalPatients: patients.length,
      newLeadsToday: newToday,
      appointmentsToday: apptsToday,
      activeConversations: activeConvos,
      responseRate: Math.min(responseRate, 100),
      bookingRate: Math.min(bookingRate, 100),
      avgNpsScore: avgNps,
      noShowRate,
      totalMessages: messages.length,
      totalAppointments: appointments.length,
      totalCampaigns: get<Campaign[]>(KEYS.CAMPAIGNS, []).length,
    };
  },

  // ─── Export ───────────────────────────────────────────────
  exportToCSV: (type: "patients" | "messages" | "appointments" | "campaigns" | "feedbacks"): string => {
    let data: any[] = [];
    let headers: string[] = [];

    switch (type) {
      case "patients":
        data = get<Patient[]>(KEYS.PATIENTS, []);
        headers = ["Name", "Phone", "Age", "Gender", "City", "Lead Status", "Language", "Consent", "Created"];
        return [
          headers.join(","),
          ...data.map((p) =>
            [p.name, p.phone, p.age || "", p.gender || "", p.city || "", p.leadStatus, p.language, p.consentGiven, p.createdAt].join(",")
          ),
        ].join("\n");

      case "messages":
        data = get<Message[]>(KEYS.MESSAGES, []);
        headers = ["Patient ID", "Direction", "Sender", "Content", "Type", "Status", "Created"];
        return [
          headers.join(","),
          ...data.map((m) =>
            [m.patientId, m.direction, m.sender, `"${(m.content || "").replace(/"/g, '""')}"`, m.messageType, m.status, m.createdAt].join(",")
          ),
        ].join("\n");

      case "appointments":
        data = get<Appointment[]>(KEYS.APPOINTMENTS, []);
        headers = ["Patient Name", "Date Time", "Duration", "Type", "Status", "Notes", "Created"];
        return [
          headers.join(","),
          ...data.map((a) =>
            [a.patientName, a.dateTime, a.duration, a.type || "", a.status, `"${(a.notes || "").replace(/"/g, '""')}"`, a.createdAt].join(",")
          ),
        ].join("\n");

      case "campaigns":
        data = get<Campaign[]>(KEYS.CAMPAIGNS, []);
        headers = ["Name", "Template", "Status", "Total", "Sent", "Failed", "Created"];
        return [
          headers.join(","),
          ...data.map((c) =>
            [c.name, c.templateName, c.status, c.totalTargets, c.sent, c.failed, c.createdAt].join(",")
          ),
        ].join("\n");

      case "feedbacks":
        data = get<Feedback[]>(KEYS.FEEDBACKS, []);
        headers = ["Patient", "NPS Score", "Comment", "Created"];
        return [
          headers.join(","),
          ...data.map((f) =>
            [f.patientName, f.npsScore, `"${(f.comment || "").replace(/"/g, '""')}"`, f.createdAt].join(",")
          ),
        ].join("\n");
    }
  },

  // ─── Clear All ────────────────────────────────────────────
  clearAll: () => {
    Object.values(KEYS).forEach((k) => {
      if (typeof window !== "undefined") localStorage.removeItem(k);
    });
  },
};
