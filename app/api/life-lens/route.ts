import { NextResponse } from "next/server";
import { callDeepSeekJson } from "@/lib/deepseek";
import type { AiSourceMeta, LifeLensMiniLens, LifeLensResult, LifeView } from "@/lib/types";

const FALLBACK_NOTICE = "当前为本地演示答案，未连接真实 DeepSeek。";

export const runtime = "nodejs";
export const maxDuration = 600;
export const preferredRegion = "iad1";

function mockLifeLens(question: string, model: string, fallbackReason: string, meta?: Partial<AiSourceMeta>): LifeLensResult {
  return {
    question: question || "我要去见一个很厉害的人，给他拍照，我是不是应该觉得他比我厉害很多？",
    summary: "同一个问题会被不同坐标系重新解释。有人看专业，有人看资源，有人看权力，也有人看作品和自我价值。",
    lifeViews: [
      {
        lensTitle: "专业维度",
        hiddenPosition: "一个习惯用专业能力衡量关系的人",
        spokenLine: "你看到的是他擅长的那一面。他在金融上厉害，不代表他在所有事情上都比你高。你也有你擅长的领域，只是这次场景不是你展示主场。",
        whatThisLensSees: "这个维度会把人从单一的强弱比较里拿出来，重新放回具体能力和具体场景里看。",
        whyTheyThinkThisWay: "这种人通常更相信专业分工，而不是笼统地崇拜成功者。他会认为每个人都有自己的主场，只是社会更容易奖励某些主场。",
        whatItProtects: "它保护的是自我价值感，避免因为接触到更有资源的人，就自动把自己放到低位。",
        whatItMayMiss: "它可能会低估现实中的资源差距和权力差距。对方的成功不只是专业，也可能带着资本、人脉和平台。",
        crossLensInsight: "这是一种反符号崇拜的视角：它不否认对方厉害，但拒绝把一个人在某个领域的优势扩大成整个人格等级。"
      },
      {
        lensTitle: "资源维度",
        hiddenPosition: "一个习惯从机会入口看事情的人",
        spokenLine: "别急着比较谁高谁低。你这次能见到他，本身就是一个入口。重点不是他多厉害，而是你能不能把这次拍摄变成作品、信任和下一次机会。",
        whatThisLensSees: "这个维度会把一次见面看成资源入口，而不是单纯的身份比较。",
        whyTheyThinkThisWay: "这种人通常经历过信息差，知道机会很多时候不是凭空出现，而是从一次具体接触里延伸出来。",
        whatItProtects: "它保护的是机会感和行动动力，让人不被对方的光环压住，而是去看自己能带走什么。",
        whatItMayMiss: "它可能会把关系过度工具化，忽略当下合作里的尊重、边界和真实感受。",
        crossLensInsight: "这是资源社会里的入口意识：很多机会不是正式邀请，而是一次足够专业的交付。"
      },
      {
        lensTitle: "权力维度",
        hiddenPosition: "一个对关系不平等很敏感的人",
        spokenLine: "你当然可以欣赏他，但也别忘了你现在是在为他提供专业服务。对方有钱有身份，不代表你就要自动矮一截。",
        whatThisLensSees: "这个维度看见了关系里的权力落差，也提醒你不要把服务关系误读成自我贬低。",
        whyTheyThinkThisWay: "这种人可能见过身份、金钱或平台如何影响互动，所以会更敏感地保护自己的位置。",
        whatItProtects: "它保护的是边界感和不被权威压倒的能力。",
        whatItMayMiss: "它可能会让人过度警惕，错过轻松学习或自然合作的空间。",
        crossLensInsight: "权力视角不是让你敌视对方，而是提醒你：尊重别人和放低自己不是一回事。"
      },
      {
        lensTitle: "作品维度",
        hiddenPosition: "一个更关心产出的人",
        spokenLine: "我会先想怎么把照片拍好。人再厉害，最后也要落到画面上。你能不能把他的气质拍出来，才是你真正能带走的东西。",
        whatThisLensSees: "这个维度把注意力从身份比较转回具体作品，关注你能交付什么、留下什么。",
        whyTheyThinkThisWay: "这种人通常相信作品比情绪更能改变处境，也更习惯用结果证明自己。",
        whatItProtects: "它保护的是行动感，让人从焦虑里回到可控制的任务。",
        whatItMayMiss: "它可能会压低情绪的重要性，好像只要作品做好，内心的不安就不需要被看见。",
        crossLensInsight: "作品视角把抽象的自卑变成具体的创作问题：你不是在和他的人生比赛，你是在完成一次表达。"
      },
      {
        lensTitle: "自我价值维度",
        hiddenPosition: "一个不容易被成功符号压倒的人",
        spokenLine: "有些人的厉害是被社会看见了，有些人的厉害还没被放到正确的位置上。你现在不是不厉害，只是还没站到你的展示场。",
        whatThisLensSees: "这个维度看见了社会评价和真实价值之间的距离，不把外部光环等同于人的全部价值。",
        whyTheyThinkThisWay: "这种人通常有比较稳定的自我价值感，或者经历过被低估后重新找到自己位置的过程。",
        whatItProtects: "它保护的是自尊和长期成长的耐心。",
        whatItMayMiss: "它可能会让人暂时低估外部评价系统的现实影响，比如资源、曝光和信任门槛。",
        crossLensInsight: "自我价值视角提醒你：社会看见谁，不等于谁才值得被看见。"
      }
    ],
    crossDisciplinaryLens: [
      {
        lens: "心理学",
        simpleExplanation: "自我价值感会影响一个人如何解释差距。价值感越稳，越不容易把一次见面理解成等级审判。",
        realExample: "同样见到成功者，有人会学习，有人会自卑，有人会立刻问自己能产出什么。"
      },
      {
        lens: "社会学",
        simpleExplanation: "社会会把资源、职业和财富包装成成功符号，人容易把符号误认为人的全部价值。",
        realExample: "金融、名校、大城市这些标签很容易让人自动把对方放到更高位置。"
      },
      {
        lens: "职业发展",
        simpleExplanation: "一次接触能不能变成机会，取决于你是否能留下可信作品和稳定交付。",
        realExample: "拍摄不是只见一个厉害的人，也是在制造作品、信任和下一次合作的证据。"
      }
    ],
    takeaway: ["不要把别人的主场误认为你的低位。", "厉害可以被欣赏，但不必被崇拜成等级。", "把焦虑转成作品，是最可控的下一步。"],
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

  return {
    question: stringValue(payload.question, question),
    summary: stringValue(payload.summary, fallback.summary),
    lifeViews: normalizeLifeViews(payload.lifeViews, fallback.lifeViews),
    crossDisciplinaryLens: normalizeMiniLenses(payload.crossDisciplinaryLens, fallback.crossDisciplinaryLens),
    takeaway: normalizeStringArray(payload.takeaway, fallback.takeaway, 3),
    meta
  };
}

function normalizeLifeViews(value: unknown, fallback: LifeView[]) {
  if (!Array.isArray(value) || value.length === 0) return fallback;

  return value.slice(0, 4).map((item, index) => {
    const view = typeof item === "object" && item !== null ? (item as Partial<LifeView>) : {};
    const fallbackItem = fallback[index] || fallback[0];

    return {
      lensTitle: stringValue(view.lensTitle, fallbackItem.lensTitle),
      hiddenPosition: stringValue(view.hiddenPosition, fallbackItem.hiddenPosition),
      spokenLine: stringValue(view.spokenLine, fallbackItem.spokenLine),
      whatThisLensSees: stringValue(view.whatThisLensSees, fallbackItem.whatThisLensSees),
      whyTheyThinkThisWay: stringValue(view.whyTheyThinkThisWay, fallbackItem.whyTheyThinkThisWay),
      whatItProtects: stringValue(view.whatItProtects, fallbackItem.whatItProtects),
      whatItMayMiss: stringValue(view.whatItMayMiss, fallbackItem.whatItMayMiss),
      crossLensInsight: stringValue(view.crossLensInsight, fallbackItem.crossLensInsight)
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

function buildFastPrompt(question: string) {
  return `你是 CrossLens 的 Life Lens 生成器。
任务：针对用户的问题，生成 4 个不同“理解维度”。
不要写职业模板，不要写城市模板。
重点是不同人的认知坐标系，例如：专业、资源、权力、自我价值、长期主义、关系边界。

用户问题：
${question}

只返回 JSON：
{
  "question": "",
  "summary": "一句话总结",
  "lifeViews": [
    {
      "lensTitle": "专业维度",
      "hiddenPosition": "一个习惯用专业能力衡量关系的人",
      "spokenLine": "像真人说的一段话，50 到 100 字",
      "whatThisLensSees": "这个维度看见什么",
      "whyTheyThinkThisWay": "为什么他会这样想",
      "whatItProtects": "这个视角保护什么",
      "whatItMayMiss": "这个视角可能忽略什么",
      "crossLensInsight": "一句小结"
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
}

要求：
- lifeViews 只能有 4 个。
- spokenLine 必须像真人说话。
- 每个字段都要短。
- 不要 markdown。
- 不要解释 JSON 外的内容。`;
}

function buildPrompt(question: string) {
  return `你是 CrossLens 的 Life Lens 生成器。

CrossLens 不是简单展示“不同职业的人怎么想”，而是展示：同一件事，不同人会用不同的理解维度去解释。

有些差异是显性的，比如城市、行业、年龄、职业。
但更重要的是隐形差异，比如：
资源感、专业感、权力感、阶层敏感度、自我价值感、风险感、长期主义、关系边界、机会识别、情绪保护。

用户问题：
${question}

请生成 4 到 6 个不同的理解维度。

每个 lifeView 必须包含：
1. lensTitle：理解维度
2. hiddenPosition：这个人的隐形位置
3. spokenLine：像真实人说出来的一段话
4. whatThisLensSees：这个维度看见了什么
5. whyTheyThinkThisWay：为什么这种人会这样理解
6. whatItProtects：这个视角保护了什么
7. whatItMayMiss：这个视角可能忽略什么
8. crossLensInsight：一句 CrossLens 小结

要求：
- 不要每张卡都写成“某城市某职业”。
- 可以出现城市/行业，但不能只靠城市/行业分类。
- 必须体现隐形阶层、经验差异和理解维度差异。
- spokenLine 必须像真人说话，不要像 AI 分析，长度 50 到 120 字。
- 不要模板化。
- 不要让每个视角说同一种话。
- 不要刻板化群体。
- 不要输出 markdown。
- 只返回合法 JSON。

返回 JSON 结构：
{
  "question": "",
  "summary": "",
  "lifeViews": [
    {
      "lensTitle": "",
      "hiddenPosition": "",
      "spokenLine": "",
      "whatThisLensSees": "",
      "whyTheyThinkThisWay": "",
      "whatItProtects": "",
      "whatItMayMiss": "",
      "crossLensInsight": ""
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

  const model = process.env.DEEPSEEK_LIFE_MODEL || "deepseek-v4-flash";
  const deepseek = await callDeepSeekJson<Partial<LifeLensResult>>({
    model,
    maxTokens: 900,
    temperature: 0.82,
    routeType: "life-lens",
    thinking: "disabled",
    messages: [
      {
        role: "system",
        content: "只返回合法 JSON。不要 markdown，不要代码块，不要解释。"
      },
      {
        role: "user",
        content: buildFastPrompt(question)
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
