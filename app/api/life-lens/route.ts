import { NextResponse } from "next/server";
import { callDeepSeekJson } from "@/lib/deepseek";
import type { AiSourceMeta, LifeLensMiniLens, LifeLensResult, LifeView } from "@/lib/types";

const FALLBACK_NOTICE = "当前为本地演示答案，未连接真实 DeepSeek。";

export const runtime = "nodejs";
export const preferredRegion = "iad1";

function mockLifeLens(question: string, model: string, fallbackReason: string, meta?: Partial<AiSourceMeta>): LifeLensResult {
  return {
    question,
    summary: "这个问题不是只有一个答案。不同位置的人，可能会先看见自己的压力、机会和可承受的风险。",
    lifeViews: [
      {
        position: "一个年轻人",
        firstReaction: "可能会先想到自己还来不来得及、会不会输给同龄人。",
        whatTheyCareAbout: "他们更在意选择会不会影响履历、机会和未来几年的方向。",
        blindSpot: "可能低估了慢慢积累的价值，也容易把短期焦虑当成真实判断。",
        tinyStory: "晚上刷到同学换行业的动态，他一边收藏经验帖，一边担心自己起步太晚。",
        whatThisReveals: "年轻人的问题常常不是不知道答案，而是缺少可验证的小入口。"
      },
      {
        position: "一个工作中的人",
        firstReaction: "可能会先问：这件事会不会影响收入、晋升和每天的消耗。",
        whatTheyCareAbout: "他们更在意现实成本，比如房租、稳定性、上司评价和可见成果。",
        blindSpot: "可能把稳定看得太绝对，忽略了岗位内部也能做小幅转向。",
        tinyStory: "午休时他想学新工具，但下午还有会、客户消息和月底指标。",
        whatThisReveals: "成年人理解问题时，常常会先计算代价，而不是先谈理想。"
      },
      {
        position: "一个年长的人",
        firstReaction: "可能会想到这件事最后会不会让人更安稳、更少后悔。",
        whatTheyCareAbout: "他们更在意身体、关系、长期安全感和人生到后面是否能承受。",
        blindSpot: "可能不够理解年轻人面对技术、城市和竞争变化时的速度感。",
        tinyStory: "散步时他听孩子说想换方向，第一反应不是反对，而是担心对方摔得太疼。",
        whatThisReveals: "年长视角会提醒我们：选择不只关乎机会，也关乎可持续。"
      },
      {
        position: "资源位置不同的人",
        firstReaction: "可能会先问：我有没有人能问、钱能垫、时间能试错。",
        whatTheyCareAbout: "他们更在意信息入口、试错成本和失败后有没有退路。",
        blindSpot: "资源少的人可能过度保守，资源多的人可能低估别人行动有多难。",
        tinyStory: "同样想转行，一个人能找前辈内推，另一个人只能在网上反复搜关键词。",
        whatThisReveals: "很多选择差异不是性格差异，而是信息和退路的差异。"
      }
    ],
    crossDisciplinaryLens: [
      {
        lens: "心理学",
        simpleExplanation: "人会用自己的经历解释问题，这叫认知框架，简单说就是每个人都戴着自己的眼镜。",
        realExample: "同样看到改变，有人想到机会，有人先想到失控。"
      },
      {
        lens: "社会学",
        simpleExplanation: "资源和环境会影响一个人能看见什么选择，不是所有人都站在同一个入口前。",
        realExample: "有人很早知道行业规则，有人到毕业才第一次听说。"
      },
      {
        lens: "经济学",
        simpleExplanation: "选择有成本。资源越少的人，越需要先考虑失败后能不能承受。",
        realExample: "同样换方向，有存款和没存款的人，风险完全不同。"
      }
    ],
    takeaway: ["先看见人站在哪里，再评价他的选择。", "同一个问题，常常藏着不同的风险账本。", "经验差异本身，就是一种信息差。"],
    meta: {
      source: "fallback",
      model,
      fallbackReason,
      status: meta?.status ?? null,
      errorBody: meta?.errorBody ?? ""
    }
  };
}

function normalizeResult(payload: Partial<LifeLensResult>, question: string, meta: AiSourceMeta): LifeLensResult {
  const fallback = mockLifeLens(question, meta.model, meta.fallbackReason || "Invalid DeepSeek payload.", meta);
  const lifeViews = normalizeLifeViews(payload.lifeViews, fallback.lifeViews);
  const lenses = normalizeMiniLenses(payload.crossDisciplinaryLens, fallback.crossDisciplinaryLens);
  const takeaway = normalizeStringArray(payload.takeaway, fallback.takeaway, 3);

  return {
    question: stringValue(payload.question, question),
    summary: stringValue(payload.summary, fallback.summary),
    lifeViews,
    crossDisciplinaryLens: lenses,
    takeaway,
    meta
  };
}

function normalizeLifeViews(value: unknown, fallback: LifeView[]) {
  if (!Array.isArray(value) || value.length === 0) return fallback;

  return value.slice(0, 4).map((item, index) => {
    const view = typeof item === "object" && item !== null ? (item as Partial<LifeView>) : {};
    const fallbackItem = fallback[index] || fallback[0];

    return {
      position: stringValue(view.position, fallbackItem.position),
      firstReaction: stringValue(view.firstReaction, fallbackItem.firstReaction),
      whatTheyCareAbout: stringValue(view.whatTheyCareAbout, fallbackItem.whatTheyCareAbout),
      blindSpot: stringValue(view.blindSpot, fallbackItem.blindSpot),
      tinyStory: stringValue(view.tinyStory, fallbackItem.tinyStory),
      whatThisReveals: stringValue(view.whatThisReveals, fallbackItem.whatThisReveals)
    };
  });
}

function normalizeMiniLenses(value: unknown, fallback: LifeLensMiniLens[]) {
  if (!Array.isArray(value) || value.length === 0) return fallback;

  return value.slice(0, 3).map((item, index) => {
    const lens = typeof item === "object" && item !== null ? (item as Partial<LifeLensMiniLens>) : {};
    const fallbackItem = fallback[index] || fallback[0];

    return {
      lens: stringValue(lens.lens, fallbackItem.lens),
      simpleExplanation: stringValue(lens.simpleExplanation, fallbackItem.simpleExplanation),
      realExample: stringValue(lens.realExample, fallbackItem.realExample)
    };
  });
}

function normalizeStringArray(value: unknown, fallback: string[], limit: number) {
  if (!Array.isArray(value)) return fallback;
  const items = value.filter((item): item is string => typeof item === "string" && item.trim().length > 0).map((item) => item.trim());
  return items.length > 0 ? items.slice(0, limit) : fallback;
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function buildPrompt(question: string) {
  return `你是 CrossLens 的人生视角分析 AI。
CrossLens 是一个匿名人生经验社区。请分析同一个问题在不同人生位置里可能被怎样理解。

用户问题：${question}

只返回合法 JSON，不要 markdown，不要代码块。

生成要求：
- 只生成 4 个 lifeViews：一个年轻人、一个工作中的人、一个年长的人、一个城市或资源位置不同的人。
- 每个 position 都用“可能会这样看”的方式表达，不要绝对化，不要刻板化。
- 每个视角必须有具体生活场景，比如考试、房租、排班、晋升、身体、关系、信息入口、试错成本。
- 语言简单，像聪明朋友解释，80% 人话，10% 简单概念，10% 行动启发。
- crossDisciplinaryLens 只给 3 个，必须短。
- takeaway 给 3 句，不要鸡汤。

禁止使用这些万能句：
- 把这个问题和自己眼前最真实的压力联系起来
- 不是急着找标准答案
- 看见的不是全部世界
- 同一个问题背后藏着不同人的机会、风险、信息差和安全感

返回 JSON 结构：
{
  "question": "",
  "summary": "",
  "lifeViews": [
    {
      "position": "",
      "firstReaction": "",
      "whatTheyCareAbout": "",
      "blindSpot": "",
      "tinyStory": "",
      "whatThisReveals": ""
    }
  ],
  "crossDisciplinaryLens": [
    {
      "lens": "",
      "simpleExplanation": "",
      "realExample": ""
    }
  ],
  "takeaway": ["", "", ""]
}`;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { question?: string } | null;
  const question = body?.question?.trim();

  if (!question) {
    return NextResponse.json({ error: "Question is required." }, { status: 400 });
  }

  const model = process.env.DEEPSEEK_LIFE_MODEL || process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";
  const deepseek = await callDeepSeekJson<Partial<LifeLensResult>>({
    model,
    maxTokens: 1600,
    temperature: 0.7,
    timeoutMs: 25000,
    messages: [
      {
        role: "system",
        content: "只返回合法 JSON。不要 markdown，不要代码块，不要解释。"
      },
      {
        role: "user",
        content: buildPrompt(question)
      }
    ]
  });

  if (!deepseek.ok) {
    const result = mockLifeLens(question, model, deepseek.meta.fallbackReason, deepseek.meta);

    return NextResponse.json({
      result,
      isFallback: true,
      notice: FALLBACK_NOTICE,
      meta: result.meta
    });
  }

  const result = normalizeResult(deepseek.data, question, deepseek.meta);

  return NextResponse.json({
    result,
    isFallback: false,
    meta: result.meta
  });
}
