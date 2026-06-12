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
  routeType?: "life-lens" | "analyze" | "career";
  thinking?: "enabled" | "disabled";
  reasoningEffort?: "high";
};

type DeepSeekMeta = {
  source: "deepseek" | "fallback";
  model: string;
  fallbackReason?: string;
  status?: number | null;
  errorBody?: string;
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
  model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
  maxTokens = 1800,
  temperature = 0.7,
  timeoutMs,
  routeType,
  thinking = "disabled",
  reasoningEffort
}: CallDeepSeekJsonInput): Promise<DeepSeekJsonResult<T>> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const effectiveTimeoutMs = timeoutMs ?? getDeepSeekTimeout(model, routeType);

  if (!apiKey) {
    return fail("Missing DEEPSEEK_API_KEY", model, null);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), effectiveTimeoutMs);

  try {
    const requestBody: Record<string, unknown> = {
      model,
      messages,
      thinking: { type: thinking },
      temperature,
      max_tokens: maxTokens,
      stream: false,
      response_format: { type: "json_object" }
    };

    if (thinking === "enabled" && reasoningEffort) {
      requestBody.reasoning_effort = reasoningEffort;
    }

    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    const responseBody = await response.text();

    if (!response.ok) {
      const errorBody = responseBody.slice(0, 500);
      console.error("[DeepSeek] Request failed", {
        status: response.status,
        model,
        errorBody
      });

      return fail(`DeepSeek API error: status ${response.status}`, model, response.status, errorBody);
    }

    let payload: {
      choices?: Array<{ message?: { content?: string } }>;
    };

    try {
      payload = JSON.parse(responseBody) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown JSON parse error.";
      return fail(`DeepSeek response JSON parse failed: ${reason}`, model, null, responseBody.slice(0, 500));
    }

    const content = payload.choices?.[0]?.message?.content;

    if (!content) {
      return fail("DeepSeek returned empty content.", model, null, responseBody.slice(0, 500));
    }

    let data: T;

    try {
      data = JSON.parse(stripJsonFences(content)) as T;
    } catch (error) {
      const reason = error instanceof Error ? error.message : "Unknown JSON parse error.";
      return fail(`DeepSeek content JSON parse failed: ${reason}`, model, null, content.slice(0, 500));
    }

    return {
      ok: true,
      data,
      meta: {
        source: "deepseek",
        model,
        ...(thinking === "enabled" && reasoningEffort ? { reasoning: reasoningEffort } : {})
      }
    };
  } catch (error) {
    const reason =
      error instanceof Error && error.name === "AbortError"
        ? `DeepSeek timeout after ${effectiveTimeoutMs}ms`
        : error instanceof Error
          ? error.message
          : "Unknown DeepSeek error.";
    return fail(reason, model, null);
  } finally {
    clearTimeout(timeout);
  }
}

export function getDeepSeekTimeout(model: string, routeType?: "life-lens" | "analyze" | "career") {
  const isPro = model.includes("pro");

  if (isPro) {
    return 580000;
  }

  if (routeType === "life-lens") {
    return 15000;
  }

  if (routeType === "analyze") {
    return 22000;
  }

  if (routeType === "career") {
    return 18000;
  }

  return 20000;
}

function fail<T>(reason: string, model: string, status: number | null, errorBody = ""): DeepSeekJsonResult<T> {
  return {
    ok: false,
    error: reason,
    meta: {
      source: "fallback",
      model,
      fallbackReason: reason,
      status,
      errorBody
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
