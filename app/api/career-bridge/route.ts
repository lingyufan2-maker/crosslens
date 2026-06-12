import { NextResponse } from "next/server";
import { callDeepSeekJson } from "@/lib/deepseek";
import type { CareerBridgeInput, CareerBridgeResult, Language } from "@/lib/types";

const FALLBACK_NOTICE = "当前使用本地规则版评估，未连接真实 AI。";
const cityTypes = ["学习城市", "赚钱城市", "资源城市", "过渡城市", "跳板城市", "强跳板城市"];
const gapPool = ["技能", "项目", "人脉", "学历", "语言", "行业入口"];

export const runtime = "nodejs";
export const preferredRegion = "iad1";

function cleanInput(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function clampScore(score: unknown) {
  const numeric = typeof score === "number" ? score : Number(score);
  if (Number.isNaN(numeric)) return 55;
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

function asStringArray(value: unknown, fallback: string[], limit = 4) {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
  return items.length > 0 ? items.slice(0, limit) : fallback;
}

function estimateScore(input: CareerBridgeInput) {
  const text = `${input.city} ${input.industry} ${input.role} ${input.goal} ${input.resources}`.toLowerCase();
  let score = 42;

  if (/ai|hci|ux|product|产品|技术|研究|设计/.test(text)) score += 14;
  if (/香港|深圳|上海|杭州|新加坡|纽约|北京|shenzhen|shanghai|hangzhou|singapore|new york|hong kong/.test(text)) score += 14;
  if (/作品|portfolio|项目|实习|intern|英语|english|人脉|network|技术|代码|资金/.test(text)) score += 18;
  if (/学生|实习|转行|运营|内容|剪辑|市场|student|intern|content|marketing/.test(text)) score += 6;

  return Math.max(28, Math.min(92, score));
}

function inferCityType(input: CareerBridgeInput, score: number) {
  const city = input.city.toLowerCase();
  const goal = input.goal.toLowerCase();

  if (score >= 82) return "强跳板城市";
  if (/香港|新加坡|纽约|上海|北京|hong kong|singapore|new york|shanghai|beijing/.test(city)) return "资源城市";
  if (/深圳|杭州|shenzhen|hangzhou/.test(city) || /ai|产品|product|tech|技术/.test(goal)) return "跳板城市";
  if (score < 48) return "过渡城市";
  return "学习城市";
}

function fallbackCareerBridge(input: CareerBridgeInput, language: Language): CareerBridgeResult {
  const score = estimateScore(input);
  const cityType = inferCityType(input, score);
  const hasProject = /作品|portfolio|项目|case|实习|intern/.test(input.resources.toLowerCase());
  const hasLanguage = /英语|english|ielts|toefl|雅思|托福/.test(input.resources.toLowerCase());
  const gaps = [
    hasProject ? "行业入口" : "项目",
    hasLanguage ? "人脉" : "语言",
    input.goal ? "技能" : "行业入口"
  ];

  if (language === "en") {
    return {
      score,
      cityType,
      diagnosis: [
        `${input.city || "Your city"} can be useful if you turn it into access to people, projects, and information.`,
        `The bridge from ${input.industry || "your current field"} to ${input.goal || "your target"} needs visible proof, not only intent.`
      ],
      gaps,
      actions: [
        "This week, list 20 people or teams already doing your target work and sort them by reachability.",
        "Build one small public case: explain a problem, your approach, and what result you can show.",
        "Ask three insiders what portfolio or signal would make them take you seriously."
      ],
      communityQuestions: [
        `In ${input.city || "my city"}, what is the most realistic entry point into ${input.goal || "my target direction"}?`,
        `What proof would make a ${input.role || "beginner"} from ${input.industry || "another field"} credible?`
      ]
    };
  }

  return {
    score,
    cityType,
    diagnosis: [
      `${input.city || "你所在城市"}不是自动的跳板，关键是它能不能帮你接触到人、项目和信息。`,
      `从${input.industry || "当前行业"}去${input.goal || "目标方向"}，最缺的通常不是决心，而是别人能看见的证据。`
    ],
    gaps,
    actions: [
      "本周列出 20 个目标方向的人或团队，按“能否接触到”排序。",
      "做一个小型公开作品：写清问题、你的方法、可展示的结果。",
      "找 3 个业内人问：什么作品或经历会让他们愿意认真看你。"
    ],
    communityQuestions: [
      `在${input.city || "这个城市"}，进入${input.goal || "目标方向"}最现实的入口是什么？`,
      `${input.role || "新人"}从${input.industry || "当前行业"}转向${input.goal || "目标方向"}，最该补哪种证据？`
    ]
  };
}

function parseJsonContent(content: string) {
  const clean = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(clean) as Partial<CareerBridgeResult>;
}

function normalizeResult(payload: Partial<CareerBridgeResult>, input: CareerBridgeInput, language: Language): CareerBridgeResult {
  const fallback = fallbackCareerBridge(input, language);
  const cityType = typeof payload.cityType === "string" && payload.cityType.trim() ? payload.cityType.trim() : fallback.cityType;

  return {
    score: clampScore(payload.score ?? fallback.score),
    cityType: cityTypes.includes(cityType) ? cityType : fallback.cityType,
    diagnosis: asStringArray(payload.diagnosis, fallback.diagnosis, 3),
    gaps: asStringArray(payload.gaps, fallback.gaps, 6).filter((gap) => gapPool.includes(gap)).slice(0, 6),
    actions: asStringArray(payload.actions, fallback.actions, 3),
    communityQuestions: asStringArray(payload.communityQuestions, fallback.communityQuestions, 2)
  };
}

function buildPrompt(input: CareerBridgeInput, language: Language) {
  const outputLanguage = language === "en" ? "English" : "Chinese";

  return `You are CrossLens Career Action Lab.
You are not a generic career coach. You help users judge whether their current city, industry, and role can become a bridge to the next stage.

Analyze this user input in ${outputLanguage}:
- Current city: ${input.city}
- Current industry: ${input.industry}
- Current role: ${input.role}
- Target direction: ${input.goal}
- Existing resources: ${input.resources}

Return strict JSON only:
{
  "score": 0,
  "cityType": "",
  "diagnosis": [],
  "gaps": [],
  "actions": [],
  "communityQuestions": []
}

Judgment dimensions:
1. Whether the city has target industry resources.
2. Whether the current industry and target direction have a transferable path.
3. Whether the user has visible work or projects.
4. Whether the user has language, network, degree, money, or experience as bridge resources.
5. Whether the city is better for learning, earning, accumulating, transitioning, or leaving.
6. Next actions must be concrete. Avoid empty advice.

Allowed cityType values only:
学习城市, 赚钱城市, 资源城市, 过渡城市, 跳板城市, 强跳板城市

Allowed gaps values only:
技能, 项目, 人脉, 学历, 语言, 行业入口

Style:
- 80% plain language.
- 10% concept.
- 10% action advice.
- No motivational fluff.
- Do not say vague things like "improve yourself".
- Actions must be specific to this week or this month, who to contact, what artifact to make, or where to find information.
- No markdown.
- No code fences.
- Valid JSON only.`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as (Partial<CareerBridgeInput> & { language?: Language }) | null;
  const language: Language = body?.language === "en" ? "en" : "cn";
  const input: CareerBridgeInput = {
    city: cleanInput(body?.city),
    industry: cleanInput(body?.industry),
    role: cleanInput(body?.role),
    goal: cleanInput(body?.goal),
    resources: cleanInput(body?.resources)
  };

  const model = process.env.DEEPSEEK_CAREER_MODEL || "deepseek-v4-flash";
  const deepseek = await callDeepSeekJson<Partial<CareerBridgeResult>>({
    model,
    maxTokens: 1800,
    temperature: 0.75,
    timeoutMs: 22000,
    thinking: "disabled",
    messages: [
      {
        role: "system",
        content: "Return valid raw JSON only. Never include markdown, code fences, or explanatory text."
      },
      {
        role: "user",
        content: buildPrompt(input, language)
      }
    ]
  });

  if (!deepseek.ok) {
    return NextResponse.json({
      result: fallbackCareerBridge(input, language),
      isFallback: true,
      notice: FALLBACK_NOTICE,
      meta: deepseek.meta
    });
  }

  try {
    const result = normalizeResult(deepseek.data, input, language);

    return NextResponse.json({
      result,
      isFallback: false,
      meta: deepseek.meta
    });
  } catch {
    return NextResponse.json({
      result: fallbackCareerBridge(input, language),
      isFallback: true,
      notice: FALLBACK_NOTICE,
      meta: {
        source: "fallback",
        model,
        fallbackReason: "Invalid DeepSeek career bridge payload.",
        status: null,
        errorBody: ""
      }
    });
  }
}
