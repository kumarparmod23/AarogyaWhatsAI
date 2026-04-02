import { NextRequest, NextResponse } from "next/server";

// Bulk broadcast via WhatsApp Business API
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { recipients, message, templateName, templateParams } = body;

    const accessToken = req.headers.get("x-wa-token");
    const phoneNumberId = req.headers.get("x-wa-phone-id");

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json(
        { success: false, error: "WhatsApp API keys not configured." },
        { status: 400 }
      );
    }

    if (!recipients?.length) {
      return NextResponse.json({ success: false, error: "No recipients" }, { status: 400 });
    }

    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      try {
        const phone = (recipient.phone || recipient).replace(/[^0-9]/g, "");

        let payload: any;
        if (templateName) {
          const params = templateParams
            ? templateParams.map((p: string) =>
                p.replace("{{name}}", recipient.name || "Patient")
              )
            : [recipient.name || "Patient"];

          payload = {
            messaging_product: "whatsapp",
            to: phone,
            type: "template",
            template: {
              name: templateName,
              language: { code: "hi" },
              components: [
                { type: "body", parameters: params.map((p: string) => ({ type: "text", text: p })) },
              ],
            },
          };
        } else {
          const personalizedMsg = (message || "")
            .replace("{{name}}", recipient.name || "Patient");

          payload = {
            messaging_product: "whatsapp",
            to: phone,
            type: "text",
            text: { preview_url: false, body: personalizedMsg },
          };
        }

        const response = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          sent++;
        } else {
          const errData = await response.json();
          failed++;
          errors.push(`${phone}: ${errData.error?.message || "Failed"}`);
        }

        // Rate limit: ~50ms between messages (WhatsApp limit ~80/sec)
        await new Promise((r) => setTimeout(r, 50));
      } catch (err: any) {
        failed++;
        errors.push(`${recipient.phone || recipient}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      data: { sent, failed, total: recipients.length, errors: errors.slice(0, 10) },
    });
  } catch (error: any) {
    console.error("[Broadcast] Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
