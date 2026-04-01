import crypto from "crypto";

const API_VERSION = process.env.WHATSAPP_API_VERSION || "v21.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;

const BASE_URL = `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}`;

// ─── Send a plain text message ───────────────────────────────

export async function sendTextMessage(to: string, text: string) {
  return sendWhatsAppRequest({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "text",
    text: { preview_url: false, body: text },
  });
}

// ─── Send a template message (for outside 24-hour window) ───

export async function sendTemplateMessage(
  to: string,
  templateName: string,
  languageCode: string = "hi",
  parameters: string[] = []
) {
  const components: any[] = [];

  if (parameters.length > 0) {
    components.push({
      type: "body",
      parameters: parameters.map((p) => ({
        type: "text",
        text: p,
      })),
    });
  }

  return sendWhatsAppRequest({
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components,
    },
  });
}

// ─── Send interactive button message ─────────────────────────

export async function sendButtonMessage(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
) {
  return sendWhatsAppRequest({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: buttons.map((btn) => ({
          type: "reply",
          reply: { id: btn.id, title: btn.title },
        })),
      },
    },
  });
}

// ─── Send image message ──────────────────────────────────────

export async function sendImageMessage(to: string, imageUrl: string, caption?: string) {
  return sendWhatsAppRequest({
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: "image",
    image: { link: imageUrl, caption },
  });
}

// ─── Mark message as read ────────────────────────────────────

export async function markAsRead(messageId: string) {
  return sendWhatsAppRequest({
    messaging_product: "whatsapp",
    status: "read",
    message_id: messageId,
  });
}

// ─── Download media from WhatsApp ────────────────────────────

export async function downloadMedia(mediaId: string): Promise<Buffer> {
  // Step 1: Get media URL
  const metaRes = await fetch(
    `https://graph.facebook.com/${API_VERSION}/${mediaId}`,
    { headers: { Authorization: `Bearer ${ACCESS_TOKEN}` } }
  );
  const meta = await metaRes.json();

  // Step 2: Download the file
  const fileRes = await fetch(meta.url, {
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
  });
  const buffer = Buffer.from(await fileRes.arrayBuffer());
  return buffer;
}

// ─── Verify webhook signature ────────────────────────────────

export function verifyWebhookSignature(
  rawBody: string,
  signature: string
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return true; // Skip in dev if not configured

  const expectedSig = crypto
    .createHmac("sha256", appSecret)
    .update(rawBody)
    .digest("hex");

  return `sha256=${expectedSig}` === signature;
}

// ─── Check if within 24-hour session window ─────────────────

export function isWithinSessionWindow(lastInboundAt: Date | null): boolean {
  if (!lastInboundAt) return false;
  const windowMs = 24 * 60 * 60 * 1000;
  return Date.now() - lastInboundAt.getTime() < windowMs;
}

// ─── Core request helper ─────────────────────────────────────

async function sendWhatsAppRequest(body: Record<string, any>) {
  const response = await fetch(`${BASE_URL}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("[WhatsApp API Error]", JSON.stringify(error, null, 2));
    throw new Error(`WhatsApp API error: ${error.error?.message || response.statusText}`);
  }

  return response.json();
}
