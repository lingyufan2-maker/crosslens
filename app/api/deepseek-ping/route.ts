import { NextResponse } from "next/server";
import { callDeepSeekJson } from "@/lib/deepseek";

export const runtime = "nodejs";
export const preferredRegion = "iad1";

export async function GET() {
  const model = process.env.DEEPSEEK_LIFE_MODEL || "deepseek-v4-flash";
  const startedAt = Date.now();
  const result = await callDeepSeekJson<{ ok: boolean }>({
    model,
    maxTokens: 50,
    temperature: 0,
    timeoutMs: 8000,
    thinking: "disabled",
    messages: [
      {
        role: "system",
        content: "Return JSON only."
      },
      {
        role: "user",
        content: "{\"ok\":true}"
      }
    ]
  });

  const latencyMs = Date.now() - startedAt;

  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      model,
      fallbackReason: result.meta.fallbackReason,
      status: result.meta.status ?? null,
      errorBody: result.meta.errorBody ?? "",
      latencyMs
    });
  }

  return NextResponse.json({
    ok: true,
    source: "deepseek",
    model,
    latencyMs
  });
}
