import { NextRequest, NextResponse } from "next/server";
import { db, isDbConnected } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const conversationId = req.nextUrl.searchParams.get("conversationId");

    // If conversationId provided, return messages for that conversation
    if (conversationId) {
      const messages = await db.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        take: 100,
      });
      return NextResponse.json({ success: true, data: messages });
    }

    // Otherwise, return all active conversations with last message
    const conversations = await db.conversation.findMany({
      where: { status: { in: ["AI_HANDLING", "HUMAN_TAKEOVER"] } },
      orderBy: { updatedAt: "desc" },
      take: 50,
      include: {
        patient: {
          select: { id: true, name: true, phone: true, leadStatus: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const data = conversations.map((conv) => ({
      id: conv.id,
      patient: conv.patient,
      status: conv.status,
      flowType: conv.flowType,
      lastMessage: conv.messages[0] || null,
      unreadCount: 0, // Could track this in DB
      updatedAt: conv.updatedAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[Messages] GET error:", error);
    return NextResponse.json({ success: true, data: [] });
  }
}
