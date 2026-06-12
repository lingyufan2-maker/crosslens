import { NextResponse } from "next/server";
import { callDeepSeekJson } from "@/lib/deepseek";
import { lensMeta, mockAIAnalysis } from "@/lib/mockAi";
import type { AiSourceMeta, Analysis, CrossLensApiAnalysis, DeepSeekAnalysisPayload, Language, LensActionItem, LensCode, Question } from "@/lib/types";

const FALLBACK_NOTICE = "当前为本地演示答案，未连接真实 DeepSeek。";

export const runtime = "nodejs";
export const preferredRegion = "iad1";

const lensCodes: LensCode[] = ["SELF", "SOC", "MKT", "PROD", "TECH", "ETH", "CAREER", "ID", "COMM", "EXEC"];

function isLensCode(value: unknown): value is LensCode {
  return typeof value === "string" && lensCodes.includes(value as LensCode);
}

function lensName(code: LensCode, language: Language) {
  return language === "cn" ? lensMeta[code].nameCn : lensMeta[code].nameEn;
}

function actionFromText(text: string, language: Language): LensActionItem {
  const title = text || (language === "cn" ? "做一个 7 天小行动" : "Run one 7-day action");

  return {
    title,
    shortReason: language === "cn" ? "先把建议变成低成本实验。" : "Turn the suggestion into a low-cost experiment.",
    detail: {
      fitFor: language === "cn" ? "适合已经理解问题，但还缺第一步行动的人。" : "For someone who understands the issue but needs a first step.",
      whyUseful: language === "cn" ? "它能让你用结果修正判断，而不是一直停在想象里。" : "It lets you correct judgment through results instead of imagination.",
      howToDo:
        language === "cn"
          ? ["第一天写下目标和判断标准。", "第二到三天找 3 个参考案例。", "第四到六天做一个最小版本。", "第七天记录结果和下一步。"]
          : ["Day 1: write the goal and criteria.", "Days 2-3: find three references.", "Days 4-6: build the smallest version.", "Day 7: record results and next step."],
      minimumVersion: language === "cn" ? "7 天内完成一个小记录、一次访谈或一个可展示样品。" : "Within 7 days, finish one note, interview, or visible sample.",
      pitfalls:
        language === "cn" ? ["只收藏资料，不实际开始。", "把第一步做得太大。"] : ["Saving resources without starting.", "Making the first step too large."],
      followUpQuestion: language === "cn" ? "我该用哪个最小行动验证这个判断？" : "Which smallest action should I use to test this judgment?"
    }
  };
}

function normalizeAction(action: unknown, language: Language): LensActionItem {
  if (typeof action === "string") return actionFromText(action, language);

  if (typeof action === "object" && action !== null && "title" in action) {
    const item = action as Partial<LensActionItem>;
    const fallback = actionFromText(item.title || "", language);
    const detail = item.detail ?? fallback.detail;

    return {
      title: item.title || fallback.title,
      shortReason: item.shortReason || fallback.shortReason,
      detail: {
        fitFor: detail.fitFor || fallback.detail.fitFor,
        whyUseful: detail.whyUseful || fallback.detail.whyUseful,
        howToDo: Array.isArray(detail.howToDo) && detail.howToDo.length > 0 ? detail.howToDo : fallback.detail.howToDo,
        minimumVersion: detail.minimumVersion || fallback.detail.minimumVersion,
        pitfalls: Array.isArray(detail.pitfalls) && detail.pitfalls.length > 0 ? detail.pitfalls : fallback.detail.pitfalls,
        followUpQuestion: detail.followUpQuestion || fallback.detail.followUpQuestion
      }
    };
  }

  return actionFromText("", language);
}

function mockToApiAnalysis(question: string, analysis: Analysis, language: Language): CrossLensApiAnalysis {
  const firstLens = analysis.selectedLenses[0] || "SELF";
  const firstAction = analysis.nextActions[0] || "";

  return {
    question,
    summary: analysis.reframedQuestion,
    coreInsight:
      language === "cn"
        ? "先看清默认假设，再决定下一步行动。"
        : "See the default assumption first, then choose the next action.",
    defaultAssumption: analysis.thinkingCard.challengedAssumption,
    nextAction: firstAction,
    lenses: analysis.interdisciplinaryAnalysis.map((item) => ({
      code: item.lens,
      name: item.lensName || lensName(item.lens, language),
      oneSentence: item.oneLineConclusion || item.insight || "",
      plainExplanation: item.meaning || item.blindSpot || "",
      academicHook: item.academicHook || "",
      realExample: item.realLifeExample || item.judgment || "",
      actions:
        Array.isArray(item.actionTips) && item.actionTips.length > 0
          ? item.actionTips.slice(0, 2).map((action) => normalizeAction(action, language))
          : [firstAction].filter(Boolean).map((action) => normalizeAction(action, language))
    })),
    ordinaryTakeaway: analysis.ordinaryTakeaway,
    challengeMe: [
      {
        type: "Assumption Challenge",
        content: analysis.challenge
      },
      {
        type: "Evidence Challenge",
        content:
          language === "cn"
            ? "找一个能推翻你当前判断的现实证据。"
            : "Find one real clue that could overturn your current judgment."
      },
      {
        type: "Alternative View",
        content:
          language === "cn"
            ? "问一个立场不同的人会怎样重新定义这个问题。"
            : "Ask someone with a different stance how they would redefine the problem."
      }
    ],
    thinkingCard: {
      originalQuestion: analysis.thinkingCard.originalQuestion,
      reframedQuestion: analysis.thinkingCard.reframedQuestion,
      keyLens: analysis.thinkingCard.mostImportantLens || firstLens,
      challengedAssumption: analysis.thinkingCard.challengedAssumption,
      nextAction: analysis.thinkingCard.nextAction || firstAction
    }
  };
}

function fallbackAnalysis(question: string, language: Language, sourceQuestion?: Question, meta?: AiSourceMeta) {
  const mock = mockAIAnalysis({ question, language, sourceQuestion });
  const analysis = mockToApiAnalysis(question, mock, language);
  const fallbackMeta: AiSourceMeta = meta ?? {
    source: "fallback",
    model: process.env.DEEPSEEK_ANALYZE_MODEL || process.env.DEEPSEEK_MODEL || "deepseek-v4-pro",
    fallbackReason: "DeepSeek fallback was used.",
    status: null,
    errorBody: ""
  };

  console.log("[CrossLens analyze] Final response shape:", describeShape(analysis, true));

  return NextResponse.json({
    analysis,
    isFallback: true,
    notice: FALLBACK_NOTICE,
    meta: fallbackMeta
  });
}

function parseJsonContent(content: string): DeepSeekAnalysisPayload {
  const clean = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(clean) as DeepSeekAnalysisPayload;
}

function tryParseJsonContent(content: string): DeepSeekAnalysisPayload | null {
  try {
    const parsed = parseJsonContent(content);
    console.log("[CrossLens analyze] JSON parse success:", true);
    return parsed;
  } catch (error) {
    console.log("[CrossLens analyze] JSON parse success:", false);
    console.log("[CrossLens analyze] JSON parse error:", error);
    return null;
  }
}

function normalizeDeepSeekPayload(payload: DeepSeekAnalysisPayload, question: string, language: Language): CrossLensApiAnalysis {
  const rawLenses = Array.isArray(payload.lenses) ? payload.lenses : [];
  const rawLegacyAnalysis = Array.isArray(payload.interdisciplinaryAnalysis) ? payload.interdisciplinaryAnalysis : [];
  const rawChallengeMe = Array.isArray(payload.challengeMe) ? payload.challengeMe : [];
  const rawTakeaway = Array.isArray(payload.ordinaryTakeaway) ? payload.ordinaryTakeaway : [];

  const normalizedLenses = rawLenses
    .filter((item) => isLensCode(item.code))
    .map((item) => ({
      code: item.code,
      name: item.name || lensName(item.code, language),
      oneSentence: item.oneSentence || "",
      plainExplanation: item.plainExplanation || "",
      academicHook: item.academicHook || "",
      realExample: item.realExample || "",
      actions: Array.isArray(item.actions) ? item.actions.slice(0, 2).map((action) => normalizeAction(action, language)) : []
    }));

  const legacyLenses = rawLegacyAnalysis
    .filter((item) => isLensCode(item.lens))
    .map((item) => ({
      code: item.lens,
      name: item.lensName || lensName(item.lens, language),
      oneSentence: item.oneLineConclusion || item.insight || "",
      plainExplanation: item.meaning || item.blindSpot || "",
      academicHook: item.academicHook || "",
      realExample: item.realLifeExample || item.judgment || "",
      actions: Array.isArray(item.actionTips) ? item.actionTips.slice(0, 2).map((action) => normalizeAction(action, language)) : []
    }));

  const lenses = normalizedLenses.length > 0 ? normalizedLenses : legacyLenses;
  const firstLens = lenses[0]?.code || "SELF";

  return {
    question: payload.question || question,
    summary: payload.summary || payload.reframedQuestion || question,
    coreInsight: payload.coreInsight || payload.summary || payload.reframedQuestion || "",
    defaultAssumption: payload.defaultAssumption || payload.thinkingCard?.challengedAssumption || "",
    nextAction: payload.nextAction || payload.thinkingCard?.nextAction || payload.nextActions?.[0] || "",
    lenses,
    ordinaryTakeaway: rawTakeaway.slice(0, 3),
    challengeMe: rawChallengeMe.map((item) => ({
      type: item.type || "Assumption Challenge",
      content: item.content || "",
      detail: item.detail
    })),
    thinkingCard: {
      originalQuestion: payload.thinkingCard?.originalQuestion || question,
      reframedQuestion: payload.thinkingCard?.reframedQuestion || payload.summary || payload.reframedQuestion || question,
      keyLens: isLensCode(payload.thinkingCard?.keyLens) ? payload.thinkingCard.keyLens : firstLens,
      challengedAssumption: payload.thinkingCard?.challengedAssumption || payload.defaultAssumption || "",
      nextAction: payload.thinkingCard?.nextAction || payload.nextAction || ""
    },
    interdisciplinaryAnalysis: rawLegacyAnalysis
  };
}

function describeShape(analysis: CrossLensApiAnalysis, isFallback = false) {
  return {
    question: typeof analysis.question,
    summary: typeof analysis.summary,
    coreInsight: typeof analysis.coreInsight,
    defaultAssumption: typeof analysis.defaultAssumption,
    nextAction: typeof analysis.nextAction,
    lenses: Array.isArray(analysis.lenses),
    lensesLength: analysis.lenses.length,
    ordinaryTakeaway: Array.isArray(analysis.ordinaryTakeaway),
    challengeMe: Array.isArray(analysis.challengeMe),
    thinkingCard: typeof analysis.thinkingCard,
    isFallback
  };
}

function buildPrompt(question: string, language: Language) {
  const outputLanguage = language === "cn" ? "Chinese" : "English";

  return `You are CrossLens, an anti-filter-bubble interdisciplinary reasoning assistant.

Please output interdisciplinary analysis as JSON only. Do not output Markdown.
Analyze the user's question in ${outputLanguage}.

Goal:
Help ordinary users understand the core conclusion at a glance. Do not generate a long essay.

Each lens must contain:
1. oneSentence: one-sentence conclusion, 20-40 Chinese characters when writing Chinese.
2. plainExplanation: plain-language explanation, within 80 Chinese characters.
3. academicHook: keep only one academic concept and immediately explain it in ordinary language, within 60 Chinese characters.
4. realExample: real-life example, within 80 Chinese characters.
5. actions: 1-2 clickable action objects. Each action must contain title, shortReason, and detail.

Each lens action must contain:
- title
- shortReason
- detail.fitFor
- detail.whyUseful
- detail.howToDo: 3-5 concrete steps
- detail.minimumVersion
- detail.pitfalls: 2-3 items
- detail.followUpQuestion

Each Challenge Me item must contain detail:
- whatItChallenges
- hiddenAssumption
- whyItMightBeWrong
- counterExample
- howToVerify
- followUpQuestion

Overall requirements:
- 80% plain human explanation + 10% academic concept + 10% action advice.
- Do not write long paragraphs.
- Do not stack academic terms.
- Do not write like a paper.
- Do not write like a research report.
- Do not output markdown.
- Do not output \`\`\`json code blocks.
- Return valid JSON only.
- Default visible content must be short.
- Details will be shown by the frontend in collapsed cards.
- Sound like a smart friend explaining, not a professor grading a paper.
- Do not give vague advice like "improve your ability".
- Actions must be specific to what the user can do.

Select 3-5 lenses from this fixed code list only:
SELF, SOC, MKT, PROD, TECH, ETH, CAREER, ID, COMM, EXEC.

Return exactly this JSON structure:
{
  "question": "",
  "summary": "",
  "coreInsight": "",
  "defaultAssumption": "",
  "nextAction": "",
  "lenses": [
    {
      "code": "SOC",
      "name": "社会学",
      "oneSentence": "",
      "plainExplanation": "",
      "academicHook": "",
      "realExample": "",
      "actions": [
        {
          "title": "",
          "shortReason": "",
          "detail": {
            "fitFor": "",
            "whyUseful": "",
            "howToDo": ["", "", ""],
            "minimumVersion": "",
            "pitfalls": ["", ""],
            "followUpQuestion": ""
          }
        }
      ]
    }
  ],
  "ordinaryTakeaway": ["", "", ""],
  "challengeMe": [
    {
      "type": "Assumption Challenge",
      "content": "",
      "detail": {
        "whatItChallenges": "",
        "hiddenAssumption": "",
        "whyItMightBeWrong": "",
        "counterExample": "",
        "howToVerify": "",
        "followUpQuestion": ""
      }
    },
    {
      "type": "Evidence Challenge",
      "content": "",
      "detail": {
        "whatItChallenges": "",
        "hiddenAssumption": "",
        "whyItMightBeWrong": "",
        "counterExample": "",
        "howToVerify": "",
        "followUpQuestion": ""
      }
    },
    {
      "type": "Alternative View",
      "content": "",
      "detail": {
        "whatItChallenges": "",
        "hiddenAssumption": "",
        "whyItMightBeWrong": "",
        "counterExample": "",
        "howToVerify": "",
        "followUpQuestion": ""
      }
    }
  ],
  "thinkingCard": {
    "originalQuestion": "",
    "reframedQuestion": "",
    "keyLens": "",
    "challengedAssumption": "",
    "nextAction": ""
  }
}

User question:
${question}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    question?: string;
    language?: Language;
    sourceQuestion?: Question;
  } | null;

  const question = body?.question?.trim();
  const language: Language = body?.language === "en" ? "en" : "cn";

  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const model = process.env.DEEPSEEK_ANALYZE_MODEL || process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";
  const deepseek = await callDeepSeekJson<DeepSeekAnalysisPayload>({
    model,
    maxTokens: 2200,
    temperature: 0.7,
    timeoutMs: 25000,
    messages: [
      {
        role: "system",
        content: "Return valid raw JSON only. Never include markdown, code fences, or explanatory text."
      },
      {
        role: "user",
        content: buildPrompt(question, language)
      }
    ]
  });

  if (!deepseek.ok) {
    return fallbackAnalysis(question, language, body?.sourceQuestion, deepseek.meta);
  }

  try {
    console.log("[CrossLens analyze] DeepSeek parsed response:", deepseek.data);

    const finalAnalysis = normalizeDeepSeekPayload(deepseek.data, question, language);
    console.log("[CrossLens analyze] Final response shape:", describeShape(finalAnalysis));

    return NextResponse.json({
      analysis: finalAnalysis,
      isFallback: false,
      meta: deepseek.meta
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "Unknown analyze normalization error.";
    return fallbackAnalysis(question, language, body?.sourceQuestion, {
      source: "fallback",
      model,
      fallbackReason: `DeepSeek response normalization failed: ${reason}`,
      status: null,
      errorBody: ""
    });
  }
}
