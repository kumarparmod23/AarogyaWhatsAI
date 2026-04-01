import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendTextMessage } from "@/lib/whatsapp";

// POST: Send a manual message (human takeover)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, phone, content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: "Message content required" }, { status: 400 });
    }

    let conversation;

    if (conversationId) {
      conversation = await db.conversation.findUnique({
        where: { id: conversationId },
        include: { patient: true },
      });
    }

    if (!conversation) {
      return NextResponse.json({ success: false, error: "Conversation not found" }, { status: 404 });
    }

    const targetPhone = phone || conversation.patient.phone;

    // Send via WhatsApp
    let waResponse;
    try {
      waResponse = await sendTextMessage(targetPhone, content.trim());
    } catch (err) {
      console.error("[Send] WhatsApp error:", err);
    }

    // Save outbound message
    const message = await db.message.create({
      data: {
        conversationId: conversation.id,
        direction: "OUTBOUND",
        sender: "HUMAN",
        content: content.trim(),
        messageType: "TEXT",
        whatsappMsgId: waResponse?.messages?.[0]?.id,
        status: waResponse ? "SENT" : "FAILED",
      },
    });

    // Ensure conversation is in human takeover mode
    await db.conversation.update({
      where: { id: conversation.id },
      data: { status: "HUMAN_TAKEOVER" },
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error("[Send] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to send" }, { status: 500 });
  }
}

// PATCH: Change conversation status (takeover / handback to AI)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { conversationId, status } = body;

    if (!conversationId || !status) {
      return NextResponse.json({ success: false, error: "conversationId and status required" }, { status: 400 });
    }

    const validStatuses = ["AI_HANDLING", "HUMAN_TAKEOVER", "CLOSED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const conversation = await db.conversation.update({
      where: { id: conversationId },
      data: { status },
    });

    return NextResponse.json({ success: true, data: conversation });
  } catch (error) {
    console.error("[Send] PATCH error:", error);
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
  }
}
