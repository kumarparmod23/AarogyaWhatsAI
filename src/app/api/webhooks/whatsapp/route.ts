import { NextRequest, NextResponse } from "next/server";
import { processIncomingMessage } from "@/lib/ai/engine";
import { verifyWebhookSignature, markAsRead } from "@/lib/whatsapp";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN!;

// GET: Meta webhook verification handshake
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("[Webhook] Verification successful");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST: Incoming messages and status updates
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");

    // Verify webhook signature
    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      console.warn("[Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value) {
      return NextResponse.json({ status: "ok" }, { status: 200 });
    }

    // Handle status updates (sent, delivered, read)
    if (value.statuses?.length > 0) {
      for (const status of value.statuses) {
        console.log(`[Webhook] Status: ${status.status} for msg ${status.id}`);
        // Could update message status in DB here
      }
      return NextResponse.json({ status: "ok" }, { status: 200 });
    }

    // Handle incoming messages
    if (value.messages?.length > 0) {
      const msg = value.messages[0];
      const phone = msg.from; // e.g. "919876543210"

      // Determine content based on message type
      let text = "";
      let mediaUrl: string | undefined;
      let messageType = msg.type || "text";

      switch (msg.type) {
        case "text":
          text = msg.text?.body || "";
          break;
        case "interactive":
          // Button reply or list reply
          text = msg.interactive?.button_reply?.title ||
                 msg.interactive?.list_reply?.title || "";
          break;
        case "button":
          text = msg.button?.text || "";
          break;
        case "image":
          text = msg.image?.caption || "[Image received]";
          mediaUrl = msg.image?.id; // Media ID, download later
          messageType = "image";
          break;
        case "document":
          text = msg.document?.caption || "[Document received]";
          mediaUrl = msg.document?.id;
          messageType = "document";
          break;
        case "location":
          text = `Location: ${msg.location?.latitude}, ${msg.location?.longitude}`;
          break;
        default:
          text = `[${msg.type} message received]`;
      }

      // Mark as read
      if (msg.id) {
        markAsRead(msg.id).catch(() => {}); // Fire and forget
      }

      // Process through AI engine
      await processIncomingMessage(
        phone.startsWith("+") ? phone : `+${phone}`,
        text,
        messageType,
        msg.id,
        mediaUrl
      );

      return NextResponse.json({ status: "processed" }, { status: 200 });
    }

    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    // Always return 200 to prevent Meta from retrying
    return NextResponse.json({ status: "error_handled" }, { status: 200 });
  }
}
