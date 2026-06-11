import { NextResponse } from "next/server";
import type { LifeLensResult, LifeView } from "@/lib/types";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const FALLBACK_NOTICE = "当前为本地演示答案，未连接真实 DeepSeek。";

const positions = [
  "四年级学生",
  "高中生",
  "大学生",
  "刚毕业的人",
  "服务业工作人员",
  "白领",
  "自由职业者",
  "父母",
  "创业者",
  "退休老人",
  "80 岁老人",
  "资源较少的人",
  "资源更多的人",
  "小城市的人",
  "一线城市的人"
];

function pickPositions() {
  const shuffled = [...positions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6);
}

function mockLifeLens(question: string): LifeLensResult {
  const lifeViews: LifeView[] = pickPositions().map((position) => ({
    position,
    viewpoint: `${position}可能会先把这个问题和自己眼前最真实的压力联系起来，而不是急着找标准答案。`,
    whyTheySeeItThisWay: "人会从自己的年龄、工作、城市和资源出发理解问题。看见的不是全部世界，而是自己能碰到的那一部分。",
    whatThisReveals: "同一个问题背后，常常藏着不同人的机会、风险、信息差和安全感。"
  }));

  return {
    question,
    summary: "这个问题没有一个统一答案。它更像一面镜子，会照出不同人生位置的人正在担心什么、相信什么、错过什么。",
    lifeViews,
    crossDisciplinaryLens: [
      {
        lens: "心理学",
        simpleExplanation: "人会用自己的经验解释世界，这叫认知框架，简单说就是每个人都戴着自己的眼镜。",
        realExample: "同样是“改变”，有人看到机会，有人先想到失控。"
      },
      {
        lens: "社会学",
        simpleExplanation: "资源和环境会影响一个人能看见的选择，不是所有人站在同一个起点。",
        realExample: "有人很早知道行业入口，有人到毕业才第一次听说。"
      },
      {
        lens: "经济学",
        simpleExplanation: "选择有成本。资源越少的人，越需要先考虑失败后能不能承受。",
        realExample: "同样转行，有存款的人和没有存款的人风险完全不同。"
      }
    ],
    takeaway: ["同一个问题，不同人生会看见不同风险。", "不要急着评判别人选择慢或保守。", "看见差异，本身就是一种信息差补课。"]
  };
}

function parseJsonContent(content: string) {
  const clean = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(clean) as Partial<LifeLensResult>;
}

function normalizeResult(payload: Partial<LifeLensResult>, question: string): LifeLensResult {
  const fallback = mockLifeLens(question);
  const lifeViews = Array.isArray(payload.lifeViews) && payload.lifeViews.length > 0 ? payload.lifeViews : fallback.lifeViews;
  const lenses =
    Array.isArray(payload.crossDisciplinaryLens) && payload.crossDisciplinaryLens.length > 0
      ? payload.crossDisciplinaryLens
      : fallback.crossDisciplinaryLens;
  const takeaway = Array.isArray(payload.takeaway) && payload.takeaway.length > 0 ? payload.takeaway : fallback.takeaway;

  return {
    question: payload.question || question,
    summary: payload.summary || fallback.summary,
    lifeViews: lifeViews.slice(0, 6).map((item) => ({
      position: item.position || "匿名人生位置",
      viewpoint: item.viewpoint || "这个位置的人可能会先从自己的现实处境理解这个问题。",
      whyTheySeeItThisWay: item.whyTheySeeItThisWay || "不同经历会改变一个人看问题的入口。",
      whatThisReveals: item.whatThisReveals || "它提醒我们，同一个问题背后可能有不同的信息差。"
    })),
    crossDisciplinaryLens: lenses.slice(0, 3).map((item) => ({
      lens: item.lens || "心理学",
      simpleExplanation: item.simpleExplanation || "用一个简单概念帮助理解这个问题。",
      realExample: item.realExample || "现实里，不同人会因为处境不同而做出不同判断。"
    })),
    takeaway: takeaway.slice(0, 3)
  };
}

function buildPrompt(question: string) {
  return `你是 CrossLens 的人生视角分析 AI。

CrossLens 是一个匿名人生经验社区。它希望让用户看见：同一个问题，不同年龄、职业、城市、资源背景的人，会看到完全不同的世界。

请分析用户的问题，生成不同人生位置的人可能会如何理解它。

用户问题：
${question}

要求：
- 不要输出标准答案。
- 不要刻板化群体。
- 每个视角都要具体、有人味。
- 语言要像聪明朋友解释，不要像论文。
- 80% 人话，10% 简单学术概念，10% 行动启发。
- 每个 position 都用“可能会这样看”的方式表达。
- 不要使用“穷人 / 富人”这种粗暴标签。
- 可以使用“资源较少的人 / 资源更多的人”。
- 每次生成 5-6 个 lifeViews。
- lifeViews 从不同年龄、职业、城市、资源背景中选择。
- 简单跨学科 Lens 只给 3 个，短一点。
- 最后给 3 条 takeaway，告诉用户这个问题真正揭示了什么。
- 不要输出 markdown，不要输出代码块，只返回合法 JSON。

返回严格 JSON：
{
  "question": "",
  "summary": "",
  "lifeViews": [
    {
      "position": "四年级学生",
      "viewpoint": "",
      "whyTheySeeItThisWay": "",
      "whatThisReveals": ""
    }
  ],
  "crossDisciplinaryLens": [
    {
      "lens": "心理学",
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

  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || "deepseek-reasoner";

  if (!apiKey) {
    return NextResponse.json({
      result: mockLifeLens(question),
      isFallback: true,
      notice: FALLBACK_NOTICE
    });
  }

  try {
    const modelsToTry = model === "deepseek-reasoner" ? ["deepseek-reasoner", "deepseek-chat"] : [model];
    let response: Response | null = null;

    for (const candidateModel of modelsToTry) {
      response = await fetch(DEEPSEEK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: candidateModel,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content: "只返回合法 JSON。不要 markdown，不要代码块，不要解释。"
            },
            {
              role: "user",
              content: buildPrompt(question)
            }
          ],
          temperature: 0.75
        })
      });

      if (response.ok) break;
    }

    if (!response || !response.ok) throw new Error("DeepSeek life lens request failed.");

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("DeepSeek returned empty content.");

    return NextResponse.json({
      result: normalizeResult(parseJsonContent(content), question),
      isFallback: false
    });
  } catch {
    return NextResponse.json({
      result: mockLifeLens(question),
      isFallback: true,
      notice: FALLBACK_NOTICE
    });
  }
}
