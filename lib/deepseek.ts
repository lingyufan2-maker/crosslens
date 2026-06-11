type DeepSeekMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type CallDeepSeekJsonInput = {
  messages: DeepSeekMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
};

type DeepSeekMeta = {
  source: "deepseek" | "fallback";
  model: string;
  fallbackReason?: string;
  reasoning?: "high";
};

export type DeepSeekJsonResult<T> =
  | {
      ok: true;
      data: T;
      meta: DeepSeekMeta & { source: "deepseek" };
    }
  | {
      ok: false;
      error: string;
      meta: DeepSeekMeta & { source: "fallback"; fallbackReason: string };
    };

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

export async function callDeepSeekJson<T>({
  messages,
  model = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro",
  maxTokens = 1800,
  temperature = 0.7,
  timeoutMs = 25000
}: CallDeepSeekJsonInput): Promise<DeepSeekJsonResult<T>> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return fail("Missing DEEPSEEK_API_KEY", model);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages,
        thinking: { type: "enabled" },
        reasoning_effort: "high",
        temperature,
        max_tokens: maxTokens,
        stream: false,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal
    });

    const responseBody = await response.text();

    if (!response.ok) {
      console.error("[DeepSeek] Request failed", {
        status: response.status,
        body: responseBody
      });

      return fail(`DeepSeek request failed with status ${response.status}.`, model);
    }

    const payload = JSON.parse(responseBody) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      return fail("DeepSeek returned empty content.", model);
    }

    const data = JSON.parse(stripJsonFences(content)) as T;

    return {
      ok: true,
      data,
      meta: {
        source: "deepseek",
        model,
        reasoning: "high"
      }
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown DeepSeek error.";
    return fail(reason, model);
  } finally {
    clearTimeout(timeout);
  }
}

function fail<T>(reason: string, model: string): DeepSeekJsonResult<T> {
  return {
    ok: false,
    error: reason,
    meta: {
      source: "fallback",
      model,
      fallbackReason: reason
    }
  };
}

function stripJsonFences(content: string) {
  return content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}
