import { NextRequest, NextResponse } from "next/server";

// Proxy route to send WhatsApp messages via Meta Cloud API
// API keys come from client-side localStorage via headers

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, message, type = "text", templateName, templateParams } = body;

    const accessToken = req.headers.get("x-wa-token");
    const phoneNumberId = req.headers.get("x-wa-phone-id");

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json(
        { success: false, error: "WhatsApp API keys not configured. Go to Settings." },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone number required" }, { status: 400 });
    }

    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    let payload: any;

    if (type === "template" && templateName) {
      payload = {
        messaging_product: "whatsapp",
        to: phone.replace(/[^0-9]/g, ""),
        type: "template",
        template: {
          name: templateName,
          language: { code: "hi" },
          components: templateParams
            ? [{ type: "body", parameters: templateParams.map((p: string) => ({ type: "text", text: p })) }]
            : [],
        },
      };
    } else {
      payload = {
        messaging_product: "whatsapp",
        to: phone.replace(/[^0-9]/g, ""),
        type: "text",
        text: { preview_url: false, body: message },
      };
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp] Send error:", data);
      return NextResponse.json(
        { success: false, error: data.error?.message || "Failed to send message" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("[WhatsApp] Send error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
