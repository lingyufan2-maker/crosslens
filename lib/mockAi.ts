import type { Analysis, Language, LensActionItem, LensCode, Question } from "@/lib/types";

export const lensMeta: Record<LensCode, { nameCn: string; nameEn: string; short: string }> = {
  SELF: { nameCn: "个人心理", nameEn: "Self & Psychology", short: "inner patterns" },
  SOC: { nameCn: "社会结构", nameEn: "Social Structure", short: "systems and access" },
  MKT: { nameCn: "商业经济", nameEn: "Business & Economy", short: "incentives and tradeoffs" },
  PROD: { nameCn: "产品用户", nameEn: "Product & Users", short: "behavior design" },
  TECH: { nameCn: "技术 AI", nameEn: "Technology & AI", short: "technical leverage" },
  ETH: { nameCn: "伦理风险", nameEn: "Ethics & Risk", short: "harm and responsibility" },
  CAREER: { nameCn: "职业路径", nameEn: "Career Path", short: "career options" },
  ID: { nameCn: "身份叙事", nameEn: "Identity Narrative", short: "self-story" },
  COMM: { nameCn: "传播表达", nameEn: "Communication", short: "framing and spread" },
  EXEC: { nameCn: "执行落地", nameEn: "Execution", short: "next experiment" }
};

const keywordRules: Array<{ lens: LensCode; keywords: string[] }> = [
  { lens: "TECH", keywords: ["ai", "算法", "模型", "技术", "代码", "自动化", "推荐"] },
  { lens: "CAREER", keywords: ["工作", "职业", "岗位", "转行", "读研", "学习", "career", "job"] },
  { lens: "PROD", keywords: ["平台", "用户", "留存", "产品", "推荐", "scroll", "app"] },
  { lens: "SOC", keywords: ["阶层", "家庭", "城市", "制度", "结构", "公平", "迁移"] },
  { lens: "SELF", keywords: ["孤独", "情绪", "焦虑", "关系", "自我", "害怕", "压力"] },
  { lens: "MKT", keywords: ["商业", "付费", "公司", "裁员", "成本", "消费", "品牌"] },
  { lens: "ETH", keywords: ["伦理", "隐私", "风险", "操控", "伤害", "公平", "责任"] },
  { lens: "COMM", keywords: ["表达", "传播", "内容", "叙事", "观点", "信息"] },
  { lens: "EXEC", keywords: ["行动", "执行", "路径", "验证", "下一步", "选择"] }
];

const lensTemplates: Record<LensCode, { cn: string; en: string }> = {
  SELF: {
    cn: "先观察这个问题触发了什么情绪：焦虑、羡慕、羞耻、兴奋还是防御。情绪不是答案，但它常常暴露真正的需求。",
    en: "Start by noticing which emotion this question activates: anxiety, envy, shame, excitement, or defensiveness. Emotion is not the answer, but it often reveals the real need."
  },
  SOC: {
    cn: "把个人选择放回结构里看：家庭资源、城市机会、制度门槛和关系网络会改变同一个选择的成本。",
    en: "Put the personal choice back into its structure: family resources, city opportunities, institutional gates, and networks change the cost of the same decision."
  },
  MKT: {
    cn: "追问谁在为这个选择付费，谁获得收益，谁承担外部成本。很多看似中性的建议背后都有激励结构。",
    en: "Ask who pays, who benefits, and who absorbs external costs. Many neutral-looking suggestions hide an incentive structure."
  },
  PROD: {
    cn: "从产品机制看，它在奖励什么行为、压低什么摩擦、制造什么默认路径。用户偏好常常是在交互中被训练出来的。",
    en: "From a product lens, ask which behaviors are rewarded, which frictions are removed, and which defaults are created. Preferences are often trained through interaction."
  },
  TECH: {
    cn: "区分技术能力、部署场景和组织采用。技术能做什么，不等于它会如何改变人的位置。",
    en: "Separate technical capability, deployment context, and organizational adoption. What technology can do is not the same as how it changes people's roles."
  },
  ETH: {
    cn: "不要只问是否有效，也要问是否可解释、可退出、可纠错，以及是否把风险转嫁给了更弱的一方。",
    en: "Do not only ask whether it works. Ask whether it is explainable, reversible, correctable, and whether risks are shifted onto weaker parties."
  },
  CAREER: {
    cn: "把问题翻译成职业资产：技能、作品、网络、信誉和选择权。好的决定会增加未来可选择的路径。",
    en: "Translate the issue into career assets: skills, portfolio, network, reputation, and optionality. Good decisions increase future paths."
  },
  ID: {
    cn: "检查你正在维护哪一种自我叙事。很多选择的难点，不是成本本身，而是它挑战了你以为自己是谁。",
    en: "Check which self-story you are protecting. The hard part of many choices is not the cost itself, but how it challenges who you think you are."
  },
  COMM: {
    cn: "看这个问题如何被命名和传播。一个框架会放大某些事实，同时让另一些事实消失。",
    en: "Look at how the issue is named and circulated. A frame amplifies some facts while making others disappear."
  },
  EXEC: {
    cn: "把宏大判断缩小成可验证实验：一周内收集一个证据、访谈一个人、做一个低成本原型或写下一条反证。",
    en: "Shrink the big judgment into a testable experiment: collect one piece of evidence, interview one person, prototype cheaply, or write one disconfirming clue this week."
  }
};

export function pickLenses(question: string, suggestedLensPool: LensCode[] = []): LensCode[] {
  const normalized = question.toLowerCase();
  const scores = new Map<LensCode, number>();

  suggestedLensPool.forEach((lens, index) => {
    scores.set(lens, (scores.get(lens) ?? 0) + 2.5 - index * 0.15);
  });

  keywordRules.forEach((rule) => {
    const hitCount = rule.keywords.filter((keyword) => normalized.includes(keyword.toLowerCase())).length;
    if (hitCount > 0) {
      scores.set(rule.lens, (scores.get(rule.lens) ?? 0) + hitCount * 2);
    }
  });

  const fallback: LensCode[] = ["SELF", "SOC", "MKT", "TECH", "ETH", "EXEC"];
  fallback.forEach((lens) => scores.set(lens, scores.get(lens) ?? 0.5));

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lens]) => lens)
    .slice(0, Math.max(3, Math.min(5, scores.size)));
}

function mockAction(title: string, language: Language): LensActionItem {
  return {
    title,
    shortReason: language === "cn" ? "先把建议变成一个可以完成的小实验。" : "Turn the suggestion into a small experiment you can finish.",
    detail: {
      fitFor: language === "cn" ? "适合已经看懂问题，但不知道第一步怎么做的人。" : "For someone who understands the issue but needs a first step.",
      whyUseful: language === "cn" ? "它能让你用真实结果修正判断，而不是只靠想象。" : "It lets you correct your judgment through real results, not imagination.",
      howToDo:
        language === "cn"
          ? ["第一天写下目标和判断标准。", "第二到三天找 3 个参考案例。", "第四到六天做一个最小版本。", "第七天记录结果和下一步。"]
          : ["Day 1: write the goal and criteria.", "Days 2-3: find three references.", "Days 4-6: build the smallest version.", "Day 7: record results and next step."],
      minimumVersion: language === "cn" ? "7 天内完成一个小记录、一次访谈或一个可展示样品。" : "Within 7 days, finish one note, interview, or visible sample.",
      pitfalls:
        language === "cn" ? ["只收藏资料，不实际开始。", "把第一步做得太大。", "用学习缓解焦虑，但没有产出。"] : ["Saving resources without starting.", "Making the first step too large.", "Learning to soothe anxiety without output."],
      followUpQuestion: language === "cn" ? "我该用哪个小项目证明自己理解了这一步？" : "Which small project can prove I understand this step?"
    }
  };
}

export function analyzeQuestion(input: {
  question: string;
  language: Language;
  sourceQuestion?: Question;
}): Analysis {
  const { question, language, sourceQuestion } = input;
  const selectedLenses = pickLenses(question, sourceQuestion?.suggested_lens_pool);
  const mostImportantLens = selectedLenses[0];
  const bias =
    sourceQuestion?.likely_user_bias ??
    (language === "cn" ? "默认自己已经看到了问题的全貌。" : "Assuming you have already seen the whole problem.");
  const antiBubble =
    sourceQuestion?.anti_bubble_angle ??
    (language === "cn"
      ? "换一个切口：这个问题也许不是要立刻找到答案，而是先暴露你没有检查过的前提。"
      : "A different cut: the point may not be to answer immediately, but to expose an assumption you have not inspected.");

  const reframedQuestion =
    language === "cn"
      ? `与其问“${question}”，不如问：我正在用哪些默认假设定义这个问题，哪些利益、结构和情绪被我暂时忽略了？`
      : `Instead of asking "${question}", ask: which default assumptions define this problem, and which incentives, structures, or emotions am I leaving out?`;

  const analysis = selectedLenses.map((lens) => ({
    lens,
    title: language === "cn" ? lensMeta[lens].nameCn : lensMeta[lens].nameEn,
    body: lensTemplates[lens][language]
  }));

  const nextActions =
    language === "cn"
      ? [
          "写下你最想保护的那个结论，然后列出三个可能推翻它的证据。",
          "找一个与你立场不同的人，问他会如何重新定义这个问题。",
          "把下一步缩小到 30 分钟内能完成的动作，并记录结果。"
        ]
      : [
          "Write down the conclusion you most want to protect, then list three pieces of evidence that could overturn it.",
          "Ask someone with a different stance how they would redefine the problem.",
          "Shrink the next step into a 30-minute action and record what happens."
        ];

  return {
    question,
    summary: reframedQuestion,
    coreInsight:
      language === "cn"
        ? "先看清你默认相信了什么，再决定下一步怎么做。"
        : "First see what you are assuming, then decide what to do next.",
    defaultAssumption: bias,
    nextAction: nextActions[0],
    lenses: analysis.map((item) => ({
      code: item.lens,
      name: language === "cn" ? lensMeta[item.lens].nameCn : lensMeta[item.lens].nameEn,
      oneSentence:
        language === "cn"
          ? `从${lensMeta[item.lens].nameCn}看，关键是先换一个判断角度。`
          : `From ${lensMeta[item.lens].nameEn}, the key is to change the judging lens first.`,
      plainExplanation: item.body,
      academicHook:
        language === "cn"
          ? `${lensMeta[item.lens].short}（把问题拆小一点，判断会更清楚）`
          : `${lensMeta[item.lens].short} (make the question smaller so the judgment gets clearer).`,
      realExample:
        language === "cn"
          ? "比如做职业、学习或关系选择时，卡住的常常不是信息不够，而是不知道该用哪把尺子。"
          : "For example, in work, study, or relationships, the blocker is often not missing information, but using the wrong yardstick.",
      actions:
        language === "cn"
          ? [mockAction("?????????????", language), mockAction("??????????", language)]
          : [mockAction("Write one judgment from this lens", language), mockAction("Find one real clue to test it", language)]
    })),
    reframedQuestion,
    selectedLenses,
    interdisciplinaryAnalysis: analysis.map((item) => ({
      lens: item.lens,
      lensName: language === "cn" ? lensMeta[item.lens].nameCn : lensMeta[item.lens].nameEn,
      oneLineConclusion:
        language === "cn"
          ? `从${lensMeta[item.lens].nameCn}看，关键不是马上下结论，而是换一种方式看问题。`
          : `From the ${lensMeta[item.lens].nameEn} lens, the key is to reframe before rushing to a conclusion.`,
      meaning: item.body,
      academicHook:
        language === "cn"
          ? `${lensMeta[item.lens].short}（把复杂问题拆成更容易判断的一小块）`
          : `${lensMeta[item.lens].short} (a simple handle for breaking the issue into a smaller judgment).`,
      realLifeExample:
        language === "cn"
          ? "比如你在做职业、学习或关系选择时，真正卡住的常常不是信息不够，而是不知道该用哪把尺子判断。"
          : "For example, when choosing a job, study path, or relationship move, the hard part is often not missing information, but not knowing which yardstick to use.",
      actionTips:
        language === "cn"
          ? ["写下这个视角下最重要的一个判断。", "找一个现实证据验证它。"]
          : ["Write down the most important judgment from this lens.", "Find one real-world clue that can test it."],
      insight: item.body,
      blindSpot: "",
      judgment: ""
    })),
    analysis,
    hiddenAngle: antiBubble,
    challenge:
      language === "cn"
        ? `?????????${bias}?????????????????????`
        : `Default assumption being challenged: ${bias} Treat it as a hypothesis to test, not a fact.`,
    challengeMe: [
      {
        type: "Assumption Challenge",
        content:
          language === "cn"
            ? "?????????????????????????????"
            : "Do you really need to change paths now, or can you create new evidence from where you are?",
        detail: {
          whatItChallenges: language === "cn" ? "??????????????????" : "It questions whether you are treating action as all-or-nothing.",
          hiddenAssumption: bias,
          whyItMightBeWrong: language === "cn" ? "????????????????????????????" : "Many real paths start with small proof before a full switch.",
          counterExample: language === "cn" ? "???????? AI ????????????????" : "A content editor can first build an AI topic tool instead of immediately becoming a product manager.",
          howToVerify: language === "cn" ? "? 7 ??????????????? AI ????????????" : "Use 7 days to improve one current work or study step with AI and show a small result.",
          followUpQuestion: language === "cn" ? "????????????????? AI ???" : "Which part of my current role is best suited for a first AI upgrade?"
        }
      }
    ],
    nextActions,
    ordinaryTakeaway:
      language === "cn"
        ? ["先把问题问准。", "别只听熟悉的答案。", "用一个小行动验证判断。"]
        : ["Ask the sharper question first.", "Do not trust only familiar answers.", "Test the judgment with one small action."],
    thinkingCard: {
      originalQuestion: question,
      reframedQuestion,
      mostImportantLens,
      challengedAssumption: bias,
      nextAction: nextActions[0]
    }
  };
}

export const mockAIAnalysis = analyzeQuestion;
