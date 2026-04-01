import { db } from "../db";
import { getAIProvider, type AIMessage } from "./providers";
import { buildConversationPrompt, CONSENT_MESSAGE } from "./prompts";
import { sendTextMessage, sendTemplateMessage, isWithinSessionWindow } from "../whatsapp";
import type { FlowType, LeadStatus } from "@prisma/client";

// ─── Main entry: process an incoming WhatsApp message ────────

export async function processIncomingMessage(
  phone: string,
  text: string,
  messageType: string = "text",
  whatsappMsgId?: string,
  mediaUrl?: string
) {
  // 1. Find or create patient
  let patient = await db.patient.findUnique({ where: { phone } });

  if (!patient) {
    patient = await db.patient.create({
      data: {
        phone,
        leadStatus: "NEW",
        language: detectLanguage(text),
      },
    });
  }

  // 2. Check consent
  if (!patient.consentGiven) {
    return handleConsentFlow(patient.id, phone, text);
  }

  // 3. Get or create active conversation
  let conversation = await db.conversation.findFirst({
    where: {
      patientId: patient.id,
      status: { in: ["AI_HANDLING", "HUMAN_TAKEOVER"] },
    },
    orderBy: { updatedAt: "desc" },
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        patientId: patient.id,
        status: "AI_HANDLING",
        flowType: detectFlowType(text),
        sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
  }

  // 4. Save inbound message
  await db.message.create({
    data: {
      conversationId: conversation.id,
      direction: "INBOUND",
      sender: "PATIENT",
      content: text,
      messageType: messageType === "image" ? "IMAGE" : messageType === "document" ? "DOCUMENT" : "TEXT",
      whatsappMsgId,
      mediaUrl,
      status: "DELIVERED",
    },
  });

  // Update session expiry on every inbound message
  await db.conversation.update({
    where: { id: conversation.id },
    data: { sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });

  // 5. If human takeover — don't auto-reply, just notify dashboard
  if (conversation.status === "HUMAN_TAKEOVER") {
    return { action: "human_takeover", conversationId: conversation.id };
  }

  // 6. Generate AI response
  const aiResponse = await generateAIResponse(conversation.id, patient, text);

  // 7. Send response via WhatsApp
  const canSendFreeform = isWithinSessionWindow(conversation.sessionExpiry);
  let waResponse;

  if (canSendFreeform) {
    waResponse = await sendTextMessage(phone, aiResponse);
  } else {
    // Outside 24-hour window — use template
    waResponse = await sendTemplateMessage(phone, "welcome_message", "hi", [
      patient.name || "Patient",
      "Our Clinic",
    ]);
  }

  // 8. Save outbound message
  await db.message.create({
    data: {
      conversationId: conversation.id,
      direction: "OUTBOUND",
      sender: "AI",
      content: aiResponse,
      messageType: "TEXT",
      whatsappMsgId: waResponse?.messages?.[0]?.id,
      status: "SENT",
    },
  });

  // 9. Update lead status & extract patient info from conversation
  await updatePatientFromConversation(patient.id, text, aiResponse);

  return { action: "ai_response", conversationId: conversation.id, response: aiResponse };
}

// ─── Generate AI response using conversation history ─────────

async function generateAIResponse(
  conversationId: string,
  patient: any,
  currentMessage: string
): Promise<string> {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 20 },
    },
  });

  if (!conversation) throw new Error("Conversation not found");

  // Build message history for AI
  const history: AIMessage[] = conversation.messages.map((msg) => ({
    role: msg.direction === "INBOUND" ? ("user" as const) : ("assistant" as const),
    content: msg.content,
  }));

  // Add current message
  history.push({ role: "user", content: currentMessage });

  // Build system prompt
  const systemMessages = buildConversationPrompt({
    flowType: conversation.flowType || "GENERAL_QUERY",
    patientName: patient.name || undefined,
    patientHistory: patient.medicalNotes || undefined,
    conversationHistory: history,
    clinicName: "Dr. Sharma's Clinic",
  });

  const messages: AIMessage[] = [...systemMessages, ...history];

  const provider = getAIProvider();
  return provider.chat(messages);
}

// ─── Consent handling ────────────────────────────────────────

async function handleConsentFlow(patientId: string, phone: string, text: string) {
  const lowerText = text.toLowerCase().trim();

  if (["1", "haan", "ha", "yes", "hnji", "ji", "ok", "okay", "हाँ", "हां"].some((w) => lowerText.includes(w))) {
    await db.patient.update({
      where: { id: patientId },
      data: {
        consentGiven: true,
        consentTimestamp: new Date(),
      },
    });

    const thankYou =
      "Dhanyavaad! 🙏 Ab aap humse baat kar sakte hain.\n\nAapko kya help chahiye?\n\n1️⃣ Appointment book karein\n2️⃣ Doctor se baat karein\n3️⃣ General query";
    await sendTextMessage(phone, thankYou);
    return { action: "consent_given" };
  }

  if (["2", "nahi", "no", "nah", "नहीं"].some((w) => lowerText.includes(w))) {
    await sendTextMessage(
      phone,
      "Koi baat nahi! Agar baad mein help chahiye to humein message kar dijiye. 🙏"
    );
    return { action: "consent_denied" };
  }

  // First interaction — send consent message
  await sendTextMessage(phone, CONSENT_MESSAGE);
  return { action: "consent_requested" };
}

// ─── Detect flow type from message content ───────────────────

function detectFlowType(text: string): FlowType {
  const lower = text.toLowerCase();

  if (/appointment|book|slot|time|appoint|milna|dikhana/.test(lower)) {
    return "APPOINTMENT_BOOKING";
  }
  if (/feedback|review|rating|experience|kaisa raha/.test(lower)) {
    return "FEEDBACK_COLLECTION";
  }
  if (/follow.?up|check|kaisa.*feel|dard|pain|medicine/.test(lower)) {
    return "POST_TREATMENT_DAY1";
  }

  return "GENERAL_QUERY";
}

// ─── Detect language from text ───────────────────────────────

function detectLanguage(text: string): "HINDI" | "ENGLISH" | "HINGLISH" {
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  const hasLatin = /[a-zA-Z]/.test(text);

  if (hasDevanagari && !hasLatin) return "HINDI";
  if (!hasDevanagari && hasLatin) return "ENGLISH";
  return "HINGLISH";
}

// ─── Extract and update patient info from conversation ───────

async function updatePatientFromConversation(
  patientId: string,
  userMessage: string,
  _aiResponse: string
) {
  const updates: Record<string, any> = {};

  // Simple name extraction (if patient says "mera naam X hai")
  const nameMatch = userMessage.match(
    /(?:mera naam|my name|naam|name)\s*(?:hai|is|h)?\s*(.+)/i
  );
  if (nameMatch) {
    updates.name = nameMatch[1].trim().split(/\s+/).slice(0, 3).join(" ");
  }

  // Age extraction
  const ageMatch = userMessage.match(/(\d{1,3})\s*(?:saal|years?|yrs?|sal|age)/i);
  if (ageMatch) {
    const age = parseInt(ageMatch[1]);
    if (age > 0 && age < 120) updates.age = age;
  }

  // Update lead status based on conversation progression
  const patient = await db.patient.findUnique({ where: { id: patientId } });
  if (patient?.leadStatus === "NEW") {
    updates.leadStatus = "CONTACTED" as LeadStatus;
  }

  if (Object.keys(updates).length > 0) {
    await db.patient.update({ where: { id: patientId }, data: updates });
  }
}
