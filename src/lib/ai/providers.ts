// Switchable AI provider — controlled via AI_PROVIDER env var

export interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIProvider {
  chat(messages: AIMessage[]): Promise<string>;
}

// ─── OpenAI Provider ─────────────────────────────────────────

class OpenAIProvider implements AIProvider {
  async chat(messages: AIMessage[]): Promise<string> {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "";
  }
}

// ─── Anthropic (Claude) Provider ─────────────────────────────

class AnthropicProvider implements AIProvider {
  async chat(messages: AIMessage[]): Promise<string> {
    const systemMsg = messages.find((m) => m.role === "system")?.content || "";
    const chatMessages = messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        system: systemMsg,
        messages: chatMessages,
      }),
    });

    const data = await response.json();
    return data.content?.[0]?.text || "";
  }
}

// ─── Grok Provider (xAI, OpenAI-compatible) ──────────────────

class GrokProvider implements AIProvider {
  async chat(messages: AIMessage[]): Promise<string> {
    const { default: OpenAI } = await import("openai");
    const client = new OpenAI({
      apiKey: process.env.GROK_API_KEY,
      baseURL: process.env.GROK_BASE_URL || "https://api.x.ai/v1",
    });

    const response = await client.chat.completions.create({
      model: "grok-2-latest",
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    return response.choices[0]?.message?.content || "";
  }
}

// ─── Factory ─────────────────────────────────────────────────

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER || "openai";

  switch (provider) {
    case "anthropic":
      return new AnthropicProvider();
    case "grok":
      return new GrokProvider();
    case "openai":
    default:
      return new OpenAIProvider();
  }
}
