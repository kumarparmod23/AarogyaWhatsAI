import { NextRequest, NextResponse } from "next/server";

// AI chat proxy — sends conversation to AI provider and returns response
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, patientName, clinicName, doctorName, specialization } = body;

    const provider = req.headers.get("x-ai-provider") || "openai";
    const apiKey = req.headers.get("x-ai-key");

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "AI API key not configured. Go to Settings." },
        { status: 400 }
      );
    }

    const systemPrompt = `Tum AarogyaWhatsAI ho — ${clinicName || "Clinic"} ka AI health assistant. ${doctorName || "Doctor"} ${specialization ? `(${specialization})` : ""} ke clinic mein patients se baat karta hai.

IMPORTANT RULES:
- Hindi/Hinglish mein baat karo, friendly aur professional tone
- Patient ka naam use karo agar pata hai: ${patientName || "Patient"}
- Medical advice mat do — sirf general information aur appointment booking
- Agar patient serious symptoms bataye, toh turant doctor se milne bolo
- Appointment book karne mein help karo
- Post-treatment follow-up mein patient ka haal poochho
- Feedback collect karo (1-10 rating)
- Short, clear messages bhejo (WhatsApp style)
- Empathetic aur caring tone rakhho`;

    const conversationMessages = [
      { role: "system", content: systemPrompt },
      ...(messages || []),
    ];

    let aiResponse: string;

    if (provider === "anthropic") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: systemPrompt,
          messages: (messages || []).map((m: any) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: m.content,
          })),
        }),
      });
      const data = await res.json();
      aiResponse = data.content?.[0]?.text || "Sorry, kuch problem ho gayi. Baad mein try karein.";
    } else if (provider === "grok") {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "grok-beta",
          messages: conversationMessages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      aiResponse = data.choices?.[0]?.message?.content || "Sorry, kuch problem ho gayi.";
    } else {
      // OpenAI (default)
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: conversationMessages,
          max_tokens: 500,
          temperature: 0.7,
        }),
      });
      const data = await res.json();
      aiResponse = data.choices?.[0]?.message?.content || "Sorry, kuch problem ho gayi.";
    }

    return NextResponse.json({ success: true, data: { response: aiResponse } });
  } catch (error: any) {
    console.error("[AI] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
