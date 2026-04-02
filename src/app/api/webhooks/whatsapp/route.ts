import { NextRequest, NextResponse } from "next/server";

// GET: Meta webhook verification handshake
export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  // Accept any verify token for now (configured in setup)
  if (mode === "subscribe" && token) {
    console.log("[Webhook] Verification successful");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST: Incoming messages — just acknowledge, client handles via polling or websockets later
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (value?.messages?.length > 0) {
      const msg = value.messages[0];
      console.log(`[Webhook] Message from ${msg.from}: ${msg.text?.body || msg.type}`);
      // In production, this would push to a real-time channel
      // For now, messages are handled client-side
    }

    // Always return 200 to prevent Meta retries
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json({ status: "ok" }, { status: 200 });
  }
}
