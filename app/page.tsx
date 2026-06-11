"use client";

import { useEffect, useMemo, useState } from "react";
import { adjacentCategories, categories, questions } from "@/data/questions";
import { randomBlindboxQuestions } from "@/data/randomBlindboxQuestions";
import { lensMeta } from "@/lib/mockAi";
import type {
  Analysis,
  AnalyzeApiResponse,
  Category,
  CrossLensApiAnalysis,
  ChallengeItem,
  Language,
  LifeLensApiResponse,
  LifeLensResult as LifeLensResultType,
  LensActionItem,
  LensAnalysisItem,
  LensCode,
  Question
} from "@/lib/types";
import HomeQuestionField from "@/components/HomeQuestionField";
import FoldingPrism from "@/components/FoldingPrism";
import CareerActionLab from "@/components/CareerActionLab";
import LifeLensResult from "@/components/LifeLensResult";

type Mode = "home" | "guided" | "blindbox" | "lifeLens" | "analysis";
type DrawMode = "full" | "guided" | "custom";

const copy = {
  cn: {
    title: "同一个问题，不同人生会看见不同的路。",
    subtitle: "CrossLens 用匿名故事、随机问题和跨学科 Lens，帮你看见职业背后的人生、信息差和下一步路径。",
    fullRandom: "完全随机问题盲盒",
    fullRandomHint: "随机打开一个你平时不会主动搜索的问题。",
    guidedRandom: "人生视角盲盒",
    guidedRandomHint: "看看四年级学生、刚毕业的人、服务业工作人员和 80 岁老人，会怎样理解同一个问题。",
    careerStories: "匿名职业故事",
    careerStoriesHint: "看见每一种职业背后的真实一天、自由、消耗和跳板路径。",
    askMyQuestion: "自己提问",
    askMyQuestionHint: "输入你的现实困惑，让 CrossLens 帮你拆成不同位置、不同学科和具体行动。",
    chooseCategory: "选择一个分类",
    categoryNote: "轻随机有 20% 概率从相邻分类抽题，让答案绕一点路。",
    draw: "抽一个问题",
    inputPlaceholder: "输入一个真实问题，例如：我是否应该离开当前工作？",
    analyze: "开始分析",
    backHome: "返回首页",
    redraw: "重新抽题",
    copied: "已复制",
    copyCard: "复制 Thinking Card",
    today: "今日问题",
    reframed: "问题重述",
    lenses: "推荐 Lens",
    interdisciplinary: "跨学科分析",
    emptyInterdisciplinary: "暂时没有生成跨学科分析，请重新生成。",
    ordinaryTakeaway: "普通人最该记住的",
    oneLineConclusion: "一句话结论",
    meaning: "这是什么意思",
    academicHook: "学术小钩子",
    realLifeExample: "现实例子",
    actionTips: "你可以怎么做",
    hiddenAngle: "你可能平时不会看到的角度",
    challenge: "Challenge Me",
    nextActions: "下一步行动",
    thinkingCard: "Thinking Card",
    original: "原问题",
    mostImportantLens: "最重要的 Lens",
    challengedAssumption: "被挑战的默认假设",
    nextAction: "下一步行动",
    emptyInput: "请先输入一个问题",
    loading: "分析中...",
    refreshField: "刷新问题场",
    drawing: "正在从问题流里抽取一个陌生入口...",
    viewLifeLens: "看不同人生怎么看",
    useLensAnalysis: "用跨学科 Lens 拆解",
    summary: "CrossLens 总结",
    coreInsight: "核心洞察",
    defaultAssumption: "被挑战的默认假设",
    quickAction: "下一步行动",
    expandLens: "展开看完整分析",
    collapseLens: "收起",
    quickActionLabel: "快速行动",
    plainExplanation: "这是什么意思",
    actionSectionSubtitle: "点开一条建议，看它怎么变成行动。",
    viewActionPath: "查看行动路径",
    fitFor: "这条建议适合谁",
    whyUseful: "为什么这一步有用",
    howToDo: "具体怎么做",
    minimumVersion: "7 天内可以完成的最小版本",
    pitfalls: "可能踩的坑",
    followUpQuestion: "可以继续问 CrossLens 的问题",
    challengeSubtitle: "这些不是否定你，而是帮你发现默认假设。",
    expandChallenge: "展开挑战",
    whatItChallenges: "这个挑战在质疑什么",
    hiddenAssumption: "你原来的默认假设是什么",
    whyItMightBeWrong: "这个假设哪里可能错",
    counterExample: "一个反例",
    howToVerify: "你应该怎么验证",
    actionLabTitle: "把分析变成行动",
    actionLabSubtitle: "输入你的城市、行业和目标方向，看看这里是不是你的下一阶段跳板。",
    evaluateBridge: "评估我的城市跳板机会",
    generatePlan: "生成我的 30 天行动计划",
    close: "关闭",
    exampleQuestions: [
      "我是否应该离开当前工作？",
      "AI 时代我应该学什么？",
      "我现在的城市有没有跳板机会？",
      "我想转 AI 产品，第一步该做什么？",
      "为什么我总觉得自己被信息困住？"
    ],
    language: "EN"
  },
  en: {
    title: "The same question reveals different paths in different lives.",
    subtitle: "CrossLens uses anonymous stories, random questions, and interdisciplinary lenses to reveal life behind careers, information gaps, and next steps.",
    fullRandom: "Random Question Blind Box",
    fullRandomHint: "Open a question you would not usually search for.",
    guidedRandom: "Life Perspective Blind Box",
    guidedRandomHint: "See how a fourth grader, a new graduate, a service worker, and an 80-year-old may understand the same question.",
    careerStories: "Anonymous Career Stories",
    careerStoriesHint: "See the real day, freedom, exhaustion, and bridge path behind different jobs.",
    askMyQuestion: "Ask My Question",
    askMyQuestionHint: "Enter a real dilemma and let CrossLens split it across positions, disciplines, and concrete actions.",
    chooseCategory: "Choose a category",
    categoryNote: "Guided Random has a 20% chance to draw from a nearby category.",
    draw: "Draw a Question",
    inputPlaceholder: "Enter a real question, e.g. Should I leave my current job?",
    analyze: "Analyze",
    backHome: "Back Home",
    redraw: "Redraw",
    copied: "Copied",
    copyCard: "Copy Thinking Card",
    today: "Today's Question",
    reframed: "Reframed Question",
    lenses: "Selected Lenses",
    interdisciplinary: "Interdisciplinary Analysis",
    emptyInterdisciplinary: "No interdisciplinary analysis was generated yet. Please regenerate.",
    ordinaryTakeaway: "What To Remember",
    oneLineConclusion: "One-Line Conclusion",
    meaning: "What This Means",
    academicHook: "Academic Hook",
    realLifeExample: "Real-Life Example",
    actionTips: "What You Can Do",
    hiddenAngle: "Angle You Might Not Usually See",
    challenge: "Challenge Me",
    nextActions: "Next Actions",
    thinkingCard: "Thinking Card",
    original: "Original Question",
    mostImportantLens: "Most Important Lens",
    challengedAssumption: "Challenged Default Assumption",
    nextAction: "Next Action",
    emptyInput: "Write a question first, then start the analysis.",
    loading: "Analyzing...",
    refreshField: "Refresh Question Field",
    drawing: "Drawing an unfamiliar entry from the question flow...",
    viewLifeLens: "See Different Lives",
    useLensAnalysis: "Analyze With CrossLens",
    summary: "CrossLens Summary",
    coreInsight: "Core Insight",
    defaultAssumption: "Challenged Default Assumption",
    quickAction: "Next Action",
    expandLens: "Expand Full Analysis",
    collapseLens: "Collapse",
    quickActionLabel: "Quick Action",
    plainExplanation: "What This Means",
    actionSectionSubtitle: "Open one suggestion to see how it becomes action.",
    viewActionPath: "View Action Path",
    fitFor: "Who This Fits",
    whyUseful: "Why This Helps",
    howToDo: "How To Do It",
    minimumVersion: "Smallest 7-Day Version",
    pitfalls: "Possible Pitfalls",
    followUpQuestion: "Question To Ask CrossLens Next",
    challengeSubtitle: "These do not reject you. They help reveal default assumptions.",
    expandChallenge: "Expand Challenge",
    whatItChallenges: "What This Challenges",
    hiddenAssumption: "Your Hidden Assumption",
    whyItMightBeWrong: "Why It Might Be Wrong",
    counterExample: "Counterexample",
    howToVerify: "How To Verify",
    actionLabTitle: "Turn Analysis Into Action",
    actionLabSubtitle: "Enter your city, industry, and target direction to see whether this can become your next-stage bridge.",
    evaluateBridge: "Evaluate My Career Bridge",
    generatePlan: "Generate My 30-Day Plan",
    close: "Close",
    exampleQuestions: [
      "Should I leave my current job?",
      "What should I learn in the AI era?",
      "Does my current city have bridge opportunities?",
      "What is the first step toward AI product work?",
      "Why do I always feel trapped by information?"
    ],
    language: "中文"
  }
};

function randomFrom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function questionText(question: Question, language: Language) {
  return language === "cn" ? question.question_cn : question.question_en;
}

function isLensCode(value: string): value is LensCode {
  return value in lensMeta;
}

function normalizeActionItem(action: unknown, language: Language): LensActionItem {
  if (typeof action === "object" && action !== null && "title" in action) {
    const item = action as Partial<LensActionItem>;
    const detail = item.detail ?? {};
    const safeDetail = detail as Partial<LensActionItem["detail"]>;

    return {
      title: item.title || (language === "cn" ? "做一个小行动验证判断" : "Run one small test"),
      shortReason: item.shortReason || (language === "cn" ? "先用低成本行动减少不确定性。" : "Use a low-cost action to reduce uncertainty."),
      detail: {
        fitFor: safeDetail.fitFor || (language === "cn" ? "适合想行动但还不知道从哪里开始的人。" : "For people who want to act but do not know where to start."),
        whyUseful: safeDetail.whyUseful || (language === "cn" ? "它能把抽象判断变成可观察的结果。" : "It turns an abstract judgment into an observable result."),
        howToDo: Array.isArray(safeDetail.howToDo) && safeDetail.howToDo.length > 0 ? safeDetail.howToDo : defaultHowToDo(language),
        minimumVersion:
          safeDetail.minimumVersion ||
          (language === "cn" ? "7 天内完成一个小记录、一次访谈或一个可展示样品。" : "Within 7 days, finish one note, interview, or visible sample."),
        pitfalls:
          Array.isArray(safeDetail.pitfalls) && safeDetail.pitfalls.length > 0
            ? safeDetail.pitfalls
            : language === "cn"
              ? ["只收藏资料，不实际开始。", "把行动做得太大，第一周就卡住。"]
              : ["Saving resources without starting.", "Making the first action too large."],
        followUpQuestion:
          safeDetail.followUpQuestion ||
          (language === "cn" ? "我应该用哪个最小行动验证这个判断？" : "Which smallest action should I use to test this judgment?")
      }
    };
  }

  const title = typeof action === "string" && action.trim() ? action.trim() : language === "cn" ? "做一个小行动验证判断" : "Run one small test";

  return {
    title,
    shortReason: language === "cn" ? "先把建议变成可执行的一周实验。" : "Turn the advice into a one-week experiment.",
    detail: {
      fitFor: language === "cn" ? "适合已经理解问题，但需要迈出第一步的人。" : "For someone who understands the issue and needs a first step.",
      whyUseful: language === "cn" ? "它能让你从想法进入证据，而不是停在焦虑里。" : "It moves you from thought to evidence instead of staying anxious.",
      howToDo: defaultHowToDo(language),
      minimumVersion: language === "cn" ? "不要追求完整方案，先完成一个 7 天记录和一个小成果。" : "Do not chase a full plan. Finish a 7-day note and one small output.",
      pitfalls:
        language === "cn"
          ? ["只收藏，不完成。", "只看概念，不产出作品。", "把行动当成缓解焦虑，而不是产生证据。"]
          : ["Collecting without finishing.", "Reading concepts without producing work.", "Using action to soothe anxiety instead of creating evidence."],
      followUpQuestion:
        language === "cn"
          ? "我如何用一个小项目证明自己真的理解了这一步？"
          : "How can I use one small project to prove I understand this step?"
    }
  };
}

function defaultHowToDo(language: Language) {
  return language === "cn"
    ? ["第一天写下目标和判断标准。", "第二到三天找 3 个参考案例。", "第四到六天做一个最小版本。", "第七天记录结果和下一步。"]
    : ["Day 1: write the goal and success criteria.", "Days 2-3: find three references.", "Days 4-6: build the smallest version.", "Day 7: record the result and next step."];
}

function normalizeChallengeItem(item: ChallengeItem | undefined, language: Language): ChallengeItem {
  const type = item?.type || "Assumption Challenge";
  const content =
    item?.content ||
    (language === "cn" ? "你现在默认相信的判断，可能只是其中一种解释。" : "What you assume may be only one possible explanation.");
  const detail = (item?.detail ?? {}) as Partial<NonNullable<ChallengeItem["detail"]>>;

  return {
    type,
    content,
    detail: {
      whatItChallenges:
        detail.whatItChallenges || (language === "cn" ? "它在质疑你是否把一个未经验证的前提当成事实。" : "It questions whether you are treating an untested premise as fact."),
      hiddenAssumption:
        detail.hiddenAssumption || (language === "cn" ? "你可能默认当前理解已经足够完整。" : "You may assume your current understanding is already complete."),
      whyItMightBeWrong:
        detail.whyItMightBeWrong || (language === "cn" ? "现实里常常有更低成本、更渐进的路径。" : "Reality often contains lower-cost and more gradual paths."),
      counterExample:
        detail.counterExample || (language === "cn" ? "有些人不是立刻换方向，而是在原位置先做出新成果。" : "Some people do not switch immediately; they create new results from their current role first."),
      howToVerify:
        detail.howToVerify || (language === "cn" ? "用 7 天做一个小实验，看结果是否支持你的判断。" : "Run a 7-day experiment and see whether the result supports your judgment."),
      followUpQuestion:
        detail.followUpQuestion || (language === "cn" ? "我现在最该验证的默认假设是什么？" : "Which default assumption should I test first?")
    }
  };
}

function apiAnalysisToUiAnalysis(apiAnalysis: CrossLensApiAnalysis, language: Language): Analysis {
  const lensItems = Array.isArray(apiAnalysis.lenses) ? apiAnalysis.lenses : [];
  const selectedLensItems = Array.isArray(apiAnalysis.selectedLenses) ? apiAnalysis.selectedLenses : [];
  const interdisciplinaryAnalysis = Array.isArray(apiAnalysis.interdisciplinaryAnalysis) ? apiAnalysis.interdisciplinaryAnalysis : [];
  const challengeMe = Array.isArray(apiAnalysis.challengeMe) ? apiAnalysis.challengeMe : [];
  const nextActions = Array.isArray(apiAnalysis.nextActions) ? apiAnalysis.nextActions : [apiAnalysis.nextAction].filter(Boolean);
  const selectedLenses = (lensItems.length > 0 ? lensItems.map((lens) => lens.code) : selectedLensItems.map((lens) => lens.code))
    .filter(isLensCode)
    .slice(0, 5);
  const safeSelectedLenses: LensCode[] = selectedLenses.length > 0 ? selectedLenses : ["SELF", "SOC", "EXEC"];
  const keyLens = isLensCode(apiAnalysis.thinkingCard.keyLens) ? apiAnalysis.thinkingCard.keyLens : safeSelectedLenses[0];
  const normalizedLenses =
    lensItems.length > 0
      ? lensItems
          .filter((item) => isLensCode(item.code))
          .map((item) => ({
            code: item.code,
            name: item.name || (language === "cn" ? lensMeta[item.code].nameCn : lensMeta[item.code].nameEn),
            oneSentence: item.oneSentence || "",
            plainExplanation: item.plainExplanation || "",
            academicHook: item.academicHook || "",
            realExample: item.realExample || "",
            actions: Array.isArray(item.actions) ? item.actions.map((action) => normalizeActionItem(action, language)) : []
          }))
      : interdisciplinaryAnalysis
          .filter((item) => isLensCode(item.lens))
          .map((item) => ({
            code: item.lens,
            name: item.lensName || (language === "cn" ? lensMeta[item.lens].nameCn : lensMeta[item.lens].nameEn),
            oneSentence: item.oneLineConclusion || item.insight || "",
            plainExplanation: item.meaning || item.blindSpot || "",
            academicHook: item.academicHook || "",
            realExample: item.realLifeExample || item.judgment || "",
            actions: Array.isArray(item.actionTips) ? item.actionTips.map((action) => normalizeActionItem(action, language)) : []
          }));
  const normalizedChallenges =
    challengeMe.length > 0
      ? challengeMe.slice(0, 3).map((item) => normalizeChallengeItem(item, language))
      : [
          normalizeChallengeItem(
            {
              type: "Assumption Challenge",
              content: apiAnalysis.thinkingCard.challengedAssumption || ""
            },
            language
          )
        ];

  return {
    question: apiAnalysis.question,
    summary: apiAnalysis.summary || apiAnalysis.reframedQuestion || "",
    coreInsight: apiAnalysis.coreInsight || "",
    defaultAssumption: apiAnalysis.defaultAssumption || apiAnalysis.thinkingCard.challengedAssumption || "",
    nextAction: apiAnalysis.nextAction || apiAnalysis.thinkingCard.nextAction || nextActions[0] || "",
    lenses: normalizedLenses,
    reframedQuestion: apiAnalysis.thinkingCard.reframedQuestion || apiAnalysis.summary || apiAnalysis.reframedQuestion || "",
    selectedLenses: safeSelectedLenses,
    interdisciplinaryAnalysis: normalizedLenses.map((item) => ({
      lens: item.code,
      lensName: item.name,
      oneLineConclusion: item.oneSentence,
      meaning: item.plainExplanation,
      academicHook: item.academicHook,
      realLifeExample: item.realExample,
      actionTips: item.actions
    })),
    analysis: interdisciplinaryAnalysis
      .filter((item) => isLensCode(item.lens))
      .map((item) => ({
        lens: item.lens,
        title: language === "cn" ? lensMeta[item.lens].nameCn : lensMeta[item.lens].nameEn,
        body: [item.insight, item.blindSpot, item.judgment].filter(Boolean).join("\n\n")
    })),
    hiddenAngle: apiAnalysis.antiBubbleAngle || "",
    challenge: challengeMe.map((item) => `${item.type}: ${item.content}`).join("\n\n"),
    challengeMe: normalizedChallenges,
    nextActions,
    ordinaryTakeaway: Array.isArray(apiAnalysis.ordinaryTakeaway) ? apiAnalysis.ordinaryTakeaway : [],
    thinkingCard: {
      originalQuestion: apiAnalysis.thinkingCard.originalQuestion,
      reframedQuestion: apiAnalysis.thinkingCard.reframedQuestion,
      mostImportantLens: keyLens,
      challengedAssumption: apiAnalysis.thinkingCard.challengedAssumption,
      nextAction: apiAnalysis.thinkingCard.nextAction
    }
  };
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("cn");
  const [mode, setMode] = useState<Mode>("home");
  const [drawMode, setDrawMode] = useState<DrawMode>("full");
  const [selectedCategory, setSelectedCategory] = useState<Category>(categories[0]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [analysisNotice, setAnalysisNotice] = useState("");
  const [blindboxQuestion, setBlindboxQuestion] = useState("");
  const [isDrawingBlindbox, setIsDrawingBlindbox] = useState(false);
  const [lifeLensQuestion, setLifeLensQuestion] = useState("");
  const [lifeLensResult, setLifeLensResult] = useState<LifeLensResultType | null>(null);
  const [lifeLensNotice, setLifeLensNotice] = useState("");
  const [isLifeLensLoading, setIsLifeLensLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputWarning, setInputWarning] = useState("");
  const [copied, setCopied] = useState(false);
  const [questionFlowRefreshKey, setQuestionFlowRefreshKey] = useState(0);
  const [questionFlowBoostKey, setQuestionFlowBoostKey] = useState(0);
  const [prismDrawKey, setPrismDrawKey] = useState(0);

  const t = copy[language];

  const displayedQuestion = useMemo(() => {
    if (drawMode === "custom") return customQuestion.trim();
    return currentQuestion ? questionText(currentQuestion, language) : "";
  }, [currentQuestion, customQuestion, drawMode, language]);

  async function requestAnalysis(question: string, targetLanguage: Language, sourceQuestion?: Question) {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        question,
        language: targetLanguage,
        sourceQuestion
      })
    });

    if (!response.ok) {
      throw new Error("Analysis request failed.");
    }

    return (await response.json()) as AnalyzeApiResponse;
  }

  async function requestLifeLens(question: string) {
    const response = await fetch("/api/life-lens", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });

    if (!response.ok) {
      throw new Error("Life Lens request failed.");
    }

    return (await response.json()) as LifeLensApiResponse;
  }

  async function runAnalysis(question: string, sourceQuestion?: Question, nextDrawMode: DrawMode = drawMode, targetLanguage = language) {
    setDrawMode(nextDrawMode);
    setMode("analysis");
    setCopied(false);
    setInputWarning("");
    setAnalysis(null);
    setIsAnalyzing(true);

    try {
      const result = await requestAnalysis(question, targetLanguage, sourceQuestion);
      setAnalysis(apiAnalysisToUiAnalysis(result.analysis, targetLanguage));
      setAnalysisNotice(result.isFallback ? result.notice ?? "当前为本地演示答案，未连接真实 DeepSeek。" : "");
    } catch {
      setAnalysisNotice("当前为本地演示答案，未连接真实 DeepSeek。");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function drawFullRandom() {
    const picked = randomFrom(questions);
    setCurrentQuestion(picked);
    setCustomQuestion("");
    void runAnalysis(questionText(picked, language), picked, "full");
  }

  function drawQuestionBlindbox() {
    setMode("blindbox");
    const picked = randomFrom(randomBlindboxQuestions);
    setBlindboxQuestion(picked);
    setCustomQuestion(picked);
    setCurrentQuestion(null);
    setLifeLensResult(null);
    setLifeLensNotice("");
    setIsDrawingBlindbox(true);
    setQuestionFlowBoostKey((value) => value + 1);
    setPrismDrawKey((value) => value + 1);

    window.setTimeout(() => {
      setIsDrawingBlindbox(false);
    }, 980);
  }

  async function openLifeLens(question: string) {
    const trimmed = question.trim();
    if (!trimmed) return;

    setMode("lifeLens");
    setLifeLensQuestion(trimmed);
    setLifeLensResult(null);
    setLifeLensNotice("");
    setIsLifeLensLoading(true);

    try {
      const data = await requestLifeLens(trimmed);
      setLifeLensResult(data.result);
      setLifeLensNotice(data.isFallback ? data.notice ?? "当前为本地演示答案，未连接真实 DeepSeek。" : "");
    } catch {
      setLifeLensNotice("当前为本地演示答案，未连接真实 DeepSeek。");
    } finally {
      setIsLifeLensLoading(false);
    }
  }

  function openCareerStoryLens() {
    void openLifeLens("为什么每一种职业背后，都有别人看不见的真实一天、自由、消耗和跳板路径？");
  }

  function drawGuidedRandom(category = selectedCategory) {
    const shouldDrift = Math.random() < 0.2;
    const actualCategory = shouldDrift ? randomFrom(adjacentCategories[category]) : category;
    const pool = questions.filter((question) => question.category === actualCategory);
    const picked = randomFrom(pool.length > 0 ? pool : questions);
    setCurrentQuestion(picked);
    setCustomQuestion("");
    void runAnalysis(questionText(picked, language), picked, "guided");
  }

  function analyzeCustom() {
    const trimmed = customQuestion.trim();
    if (!trimmed) {
      setInputWarning(t.emptyInput);
      return;
    }
    setCurrentQuestion(null);
    void runAnalysis(trimmed, undefined, "custom");
  }

  function redraw() {
    if (drawMode === "guided") {
      drawGuidedRandom();
      return;
    }

    if (drawMode === "full") {
      drawFullRandom();
      return;
    }

    analyzeCustom();
  }

  function toggleLanguage() {
    const nextLanguage: Language = language === "cn" ? "en" : "cn";
    setLanguage(nextLanguage);

    if (analysis) {
      const nextQuestion =
        drawMode === "custom"
          ? customQuestion.trim()
          : currentQuestion
            ? questionText(currentQuestion, nextLanguage)
            : displayedQuestion;
      void runAnalysis(nextQuestion, currentQuestion ?? undefined, drawMode, nextLanguage);
    }
  }

  async function copyThinkingCard() {
    if (!analysis) return;

    const card = analysis.thinkingCard;
    const text = [
      `CrossLens Thinking Card`,
      `${t.original}: ${card.originalQuestion}`,
      `${t.reframed}: ${card.reframedQuestion}`,
      `${t.mostImportantLens}: ${card.mostImportantLens} - ${
        language === "cn" ? lensMeta[card.mostImportantLens].nameCn : lensMeta[card.mostImportantLens].nameEn
      }`,
      `${t.challengedAssumption}: ${card.challengedAssumption}`,
      `${t.nextAction}: ${card.nextAction}`
    ].join("\n");

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  }

  return (
    <main className={mode === "home" ? "home-landing text-ink" : "lab-grid relative min-h-screen overflow-hidden bg-[#f5f1e8] px-3 py-3 text-ink sm:px-6 sm:py-5 lg:px-8"}>
      {(mode === "home" || mode === "blindbox") && <HomeQuestionField refreshKey={questionFlowRefreshKey} boostKey={questionFlowBoostKey} />}

      {mode === "home" && (
        <>
          <header className="home-topbar">
            <button type="button" onClick={() => setMode("home")} className="brand-mark">
              <span className="brand-symbol">
                <span />
                <span />
              </span>
              <span>CrossLens</span>
            </button>

            <nav className="home-nav" aria-label="Home navigation">
              <button type="button" onClick={drawQuestionBlindbox}>探索问题</button>
              <button type="button" onClick={openCareerStoryLens}>真实经验</button>
              <button type="button" onClick={openCareerStoryLens}>匿名社区</button>
              <button type="button" onClick={() => setQuestionFlowRefreshKey((value) => value + 1)}>关于我们</button>
            </nav>

            <div className="top-actions">
              <button type="button" className="login-button">登录 / 注册</button>
              <button type="button" onClick={toggleLanguage} className="theme-button" aria-label="切换语言">
                ☼
              </button>
            </div>
          </header>

          <section className="hero-layout">
            <div className="hero-cube-zone">
              <FoldingPrism />
            </div>

            <div className="hero-copy-panel">
              <div className="hero-wordmark">
                <span className="lens-logo">
                  <span />
                  <span />
                </span>
                <span>CrossLens</span>
              </div>

              <h1>
                同一个问题，
                <br />
                不同人生会看见不同的路。
              </h1>

              <p className="hero-subline">
                从<span>跨学科问题</span>开始，进入真实人生经验与<strong>匿名社区</strong>。
              </p>

              <form
                className="hero-search"
                onSubmit={(event) => {
                  event.preventDefault();
                  void analyzeCustom();
                }}
              >
                <input
                  id="home-question-input"
                  value={customQuestion}
                  onChange={(event) => {
                    setCustomQuestion(event.target.value);
                    setInputWarning("");
                  }}
                  placeholder="输入你的问题，开启多元视角..."
                />
                <button type="submit" aria-label="开始分析" disabled={isAnalyzing}>
                  ◇
                </button>
              </form>
              {inputWarning && <p className="hero-warning">{inputWarning}</p>}

              <div className="hero-cta-row">
                <button type="button" onClick={drawQuestionBlindbox} className="hero-cta-primary">
                  <span className="button-icon">▧</span>
                  随机打开一个问题
                </button>

                <button
                  type="button"
                  onClick={() => {
                    document.getElementById("home-question-input")?.focus();
                    setInputWarning("");
                  }}
                  className="hero-cta-secondary"
                >
                  <span className="button-icon">✎</span>
                  输入我的困惑
                </button>
              </div>

              <div className="hero-pill-row">
                <button
                  type="button"
                  onClick={() => {
                    const picked = randomFrom(randomBlindboxQuestions);
                    setBlindboxQuestion(picked);
                    setCustomQuestion(picked);
                    void openLifeLens(picked);
                  }}
                >
                  ▧ 人生视角盲盒 ›
                </button>
                <button type="button" onClick={openCareerStoryLens}>☵ 匿名职业故事 ›</button>
                <button
                  type="button"
                  onClick={() => {
                    const picked = randomFrom(randomBlindboxQuestions);
                    setCustomQuestion(picked);
                    void runAnalysis(picked, undefined, "custom");
                  }}
                >
                  ◎ 跨学科 Lens ›
                </button>
              </div>

              <div className="hero-proof-card">
                <div className="proof-star">✧</div>
                <div className="proof-divider" />
                <div className="proof-content">
                  <p className="proof-main">在这里，每个问题都值得被多角度看见。</p>
                  <p className="proof-sub">
                    <span className="avatar-row">
                      <span />
                      <span />
                      <span />
                      <span />
                      <span />
                    </span>
                    来自 132,742+ 匿名用户的真实经验与思考
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {mode !== "home" && (
      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-ink/10 pb-3 sm:pb-4">
          <button
            type="button"
            onClick={() => setMode("home")}
            className="text-left text-xl font-semibold tracking-[0.08em]"
          >
            CrossLens
          </button>
          <button
            type="button"
            onClick={toggleLanguage}
            className="h-10 border border-ink bg-white px-4 text-sm font-semibold shadow-sm transition hover:border-moss hover:bg-lab sm:border-ink/15"
          >
            {t.language}
          </button>
        </header>

        {mode === "blindbox" && (
          <section className="grid flex-1 place-items-center gap-3 py-6">
            <FoldingPrism activeQuestion={blindboxQuestion} isDrawing={isDrawingBlindbox} drawKey={prismDrawKey} />
            <div className="w-full max-w-2xl rounded-md border border-ink/12 bg-white/84 p-5 text-center shadow-soft backdrop-blur sm:p-8">
              {isDrawingBlindbox ? (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">Question Blind Box</p>
                  <p className="mt-4 text-xl font-semibold text-moss">{t.drawing}</p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">你抽到了</p>
                  <h1 className="mt-4 text-2xl font-semibold leading-tight text-ink sm:text-4xl">{blindboxQuestion}</h1>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => void openLifeLens(blindboxQuestion)}
                      className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss"
                    >
                      {t.viewLifeLens}
                    </button>
                    <button
                      type="button"
                      onClick={() => void runAnalysis(blindboxQuestion, undefined, "custom")}
                      className="rounded-md border border-moss bg-white px-4 py-3 text-sm font-semibold text-moss transition hover:bg-lab"
                    >
                      {t.useLensAnalysis}
                    </button>
                  </div>
                  <button type="button" onClick={drawQuestionBlindbox} className="mt-4 text-sm font-semibold text-ink/55 hover:text-moss">
                    {t.redraw}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {mode === "lifeLens" && !lifeLensResult && (
          <section className="grid flex-1 place-items-center py-8">
            <div className="w-full max-w-2xl rounded-md border border-moss/25 bg-lab/85 p-5 shadow-soft sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">你抽到的问题</p>
              <h1 className="mt-3 text-2xl font-semibold leading-tight text-ink">{lifeLensQuestion || blindboxQuestion || customQuestion}</h1>
              {isLifeLensLoading ? (
                <div className="mt-5 grid gap-2 text-sm font-semibold text-moss">
                  <p className="rounded-md bg-white/65 p-3">正在生成不同人生视角...</p>
                  <p className="rounded-md bg-white/65 p-3">正在寻找四个不同位置...</p>
                  <p className="rounded-md bg-white/65 p-3">正在用跨学科 Lens 拆开问题...</p>
                </div>
              ) : (
                <p className="mt-5 rounded-md bg-white/65 p-3 text-sm font-semibold text-moss">{lifeLensNotice || t.loading}</p>
              )}
            </div>
          </section>
        )}

        {mode === "lifeLens" && lifeLensResult && (
          <LifeLensResult
            result={lifeLensResult}
            notice={lifeLensNotice}
            onBack={() => setMode("home")}
            onRedraw={() => {
              const picked = randomFrom(randomBlindboxQuestions);
              setBlindboxQuestion(picked);
              setCustomQuestion(picked);
              void openLifeLens(picked);
            }}
            onAnalyze={() => void runAnalysis(lifeLensResult.question, undefined, "custom")}
          />
        )}

        {mode === "guided" && (
          <section className="flex flex-1 items-start py-5 sm:items-center sm:py-10">
            <div className="w-full">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-7 sm:flex-row sm:items-end">
                <div>
                  <h1 className="text-3xl font-semibold sm:text-4xl">{t.chooseCategory}</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/65 sm:mt-3 sm:text-base">{t.categoryNote}</p>
                </div>
                <button type="button" onClick={() => setMode("home")} className="border border-ink/15 bg-white/55 px-4 py-3 text-sm font-medium">
                  {t.backHome}
                </button>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(category);
                      drawGuidedRandom(category);
                    }}
                    className={`min-h-14 border p-4 text-left transition active:translate-y-px sm:min-h-28 ${
                      selectedCategory === category
                        ? "border-moss bg-moss text-white shadow-soft"
                        : "border-ink/12 bg-white/70 hover:border-moss"
                    }`}
                  >
                    <span className="text-sm font-semibold">{category}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {mode === "analysis" && !analysis && (
          <section className="grid flex-1 place-items-center py-8">
            <div className="w-full border border-moss/25 bg-lab p-5 text-center text-sm font-semibold text-moss shadow-soft sm:max-w-md">
              {t.loading}
            </div>
          </section>
        )}

        {mode === "analysis" && analysis && (
          <AnalysisView
            analysis={analysis}
            displayedQuestion={displayedQuestion}
            language={language}
            onBack={() => setMode("home")}
            onRedraw={redraw}
            onCopy={copyThinkingCard}
            copied={copied}
            isAnalyzing={isAnalyzing}
            notice={analysisNotice}
            labels={t}
          />
        )}
      </div>
      )}
    </main>
  );
}

function ActionPanel({
  title,
  description,
  marker,
  onClick
}: {
  title: string;
  description: string;
  marker: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full cursor-pointer border border-ink/12 bg-white/70 p-4 text-left shadow-soft backdrop-blur transition active:translate-y-px hover:-translate-y-0.5 hover:border-moss hover:bg-white sm:p-5"
    >
      <p className="text-xs font-semibold text-copper">{marker}</p>
      <div className="mt-3 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-ink/62">{description}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-ink/15 text-lg transition group-hover:border-moss group-hover:bg-moss group-hover:text-white">
          &gt;
        </span>
      </div>
    </button>
  );
}

function AnalysisView({
  analysis,
  displayedQuestion,
  language,
  labels,
  copied,
  isAnalyzing,
  notice,
  onBack,
  onRedraw,
  onCopy
}: {
  analysis: Analysis;
  displayedQuestion: string;
  language: Language;
  labels: (typeof copy)["cn"];
  copied: boolean;
  isAnalyzing: boolean;
  notice: string;
  onBack: () => void;
  onRedraw: () => void;
  onCopy: () => void;
}) {
  const [selectedAction, setSelectedAction] = useState<LensActionItem | null>(null);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeItem | null>(null);
  const lensCards = Array.isArray(analysis.lenses) && analysis.lenses.length > 0 ? analysis.lenses : [];
  const ordinaryTakeaway = Array.isArray(analysis.ordinaryTakeaway) ? analysis.ordinaryTakeaway : [];
  const challengeItems = Array.isArray(analysis.challengeMe) ? analysis.challengeMe : [];

  return (
    <section className="mx-auto w-full max-w-[1180px] py-5 sm:py-7">
      {notice && (
        <div className="mb-3 border border-copper/30 bg-white/85 p-3 text-sm font-semibold text-copper shadow-sm sm:mb-4">
          {notice}
        </div>
      )}

      {isAnalyzing && (
        <div className="mb-3 border border-moss/25 bg-lab p-3 text-sm font-semibold text-moss shadow-sm sm:mb-4">
          {labels.loading}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="break-words border border-ink/12 bg-white/82 p-4 shadow-soft lg:sticky lg:top-5">
          <SectionLabel>{labels.today}</SectionLabel>
          <h1 className="mt-3 text-xl font-semibold leading-tight">{displayedQuestion}</h1>

          <div className="mt-5 grid gap-4 border-t border-ink/10 pt-4">
            <CardLine label={labels.defaultAssumption} value={analysis.defaultAssumption || analysis.thinkingCard.challengedAssumption} />
            <CardLine label={labels.quickAction} value={analysis.nextAction || analysis.thinkingCard.nextAction} />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" onClick={onBack} className="border border-ink/15 bg-white px-3 py-2 text-sm font-semibold hover:border-moss">
              {labels.backHome}
            </button>
            <button type="button" onClick={onRedraw} className="border border-ink/15 bg-white px-3 py-2 text-sm font-semibold hover:border-moss">
              {labels.redraw}
            </button>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <section className="break-words border border-ink/12 bg-white/82 p-5 shadow-soft sm:p-6">
            <SectionLabel>{labels.summary}</SectionLabel>
            <p className="mt-3 text-2xl font-semibold leading-tight text-ink sm:text-3xl">{analysis.coreInsight}</p>
            <p className="mt-4 text-sm leading-7 text-ink/72 sm:text-base">{analysis.summary || analysis.reframedQuestion}</p>
          </section>

          <section className="border border-ink/12 bg-white/78 p-4 shadow-soft sm:p-6">
            <SectionLabel>{labels.interdisciplinary}</SectionLabel>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {lensCards.length === 0 ? (
                <p className="border border-copper/20 bg-paper/55 p-4 text-sm leading-7 text-ink/70 md:col-span-2">
                  {labels.emptyInterdisciplinary}
                </p>
              ) : (
                lensCards.map((item) => <LensCard key={item.code} item={item} labels={labels} onActionSelect={setSelectedAction} />)
              )}
            </div>
          </section>

          {ordinaryTakeaway.length > 0 && (
            <section className="break-words border border-ink/12 bg-white/82 p-4 shadow-soft sm:p-6">
              <SectionLabel>{labels.ordinaryTakeaway}</SectionLabel>
              <ul className="mt-4 grid gap-2">
                {ordinaryTakeaway.slice(0, 3).map((item) => (
                  <li key={item} className="border border-ink/8 bg-paper/45 p-3 text-sm leading-7 text-ink/72">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="break-words border border-ink/12 bg-white/82 p-4 shadow-soft sm:p-6">
            <SectionLabel>{labels.challenge}</SectionLabel>
            <p className="mt-2 text-sm leading-6 text-ink/62">{labels.challengeSubtitle}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {challengeItems.map((item) => (
                <ChallengeCard key={`${item.type}-${item.content}`} item={item} labels={labels} onOpen={setSelectedChallenge} />
              ))}
            </div>
          </section>

          <section className="break-words border border-ink/12 bg-white/82 p-4 shadow-soft sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <SectionLabel>{labels.thinkingCard}</SectionLabel>
              <button
                type="button"
                onClick={onCopy}
                className="w-full border border-ink bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss sm:w-auto sm:py-2"
              >
                {copied ? labels.copied : labels.copyCard}
              </button>
            </div>
            <dl className="mt-4 grid gap-4 text-sm leading-6 sm:grid-cols-2">
              <CardLine label={labels.original} value={analysis.thinkingCard.originalQuestion} />
              <CardLine label={labels.reframed} value={analysis.thinkingCard.reframedQuestion} />
              <CardLine
                label={labels.mostImportantLens}
                value={`${analysis.thinkingCard.mostImportantLens} - ${
                  language === "cn"
                    ? lensMeta[analysis.thinkingCard.mostImportantLens].nameCn
                    : lensMeta[analysis.thinkingCard.mostImportantLens].nameEn
                }`}
              />
              <CardLine label={labels.nextAction} value={analysis.thinkingCard.nextAction} />
            </dl>
          </section>

          <section className="break-words rounded-md border border-moss/20 bg-lab/75 p-4 shadow-soft sm:p-6">
            <SectionLabel>{labels.actionLabTitle}</SectionLabel>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-ink/70">{labels.actionLabSubtitle}</p>
            <CareerActionLab language={language} variant="bottom" />
          </section>
        </div>
      </div>
      {selectedAction && <ActionDetailDrawer action={selectedAction} labels={labels} onClose={() => setSelectedAction(null)} />}
      {selectedChallenge && <ChallengeDetailDrawer challenge={selectedChallenge} labels={labels} onClose={() => setSelectedChallenge(null)} />}
    </section>
  );
}

function LensCard({ item, labels, onActionSelect }: { item: LensAnalysisItem; labels: (typeof copy)["cn"]; onActionSelect: (action: LensActionItem) => void }) {
  const quickAction = Array.isArray(item.actions) ? item.actions[0] : "";
  const actions = Array.isArray(item.actions) ? item.actions.filter(Boolean) : [];

  return (
    <article className="min-w-0 break-words rounded-md border border-ink/10 bg-white/85 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-moss">
          {item.code} | {item.name}
        </p>
      </div>

      <div className="mt-4 grid gap-3">
        <LensField title={labels.oneLineConclusion} value={item.oneSentence} emphasized />
        <LensField title={labels.academicHook} value={item.academicHook} />
      </div>

      <details className="group mt-4 border-t border-ink/10 pt-3">
        <summary className="cursor-pointer list-none text-sm font-semibold text-moss outline-none transition hover:text-ink">
          <span className="group-open:hidden">{labels.expandLens}</span>
          <span className="hidden group-open:inline">{labels.collapseLens}</span>
        </summary>
        <div className="mt-4 grid gap-4">
          <LensField title={labels.plainExplanation} value={item.plainExplanation} />
          <LensField title={labels.realLifeExample} value={item.realExample} />
          {actions.length > 0 && (
            <div>
              <p className="text-sm font-bold text-ink">{labels.actionTips}</p>
              <p className="mt-1 text-xs leading-5 text-ink/56">{labels.actionSectionSubtitle}</p>
              <ul className="mt-3 grid gap-2">
                {actions.map((action) => (
                  <li key={action.title}>
                    <button
                      type="button"
                      onClick={() => onActionSelect(action)}
                      className="w-full rounded-md border border-ink/8 bg-paper/55 p-3 text-left transition hover:border-moss hover:bg-lab"
                    >
                      <span className="block text-sm font-semibold text-ink">{action.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-ink/62">{action.shortReason}</span>
                      <span className="mt-2 block text-xs font-bold text-moss">{labels.viewActionPath}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </details>
    </article>
  );
}

function LensField({ title, value, emphasized = false }: { title: string; value: string; emphasized?: boolean }) {
  if (!value) return null;

  return (
    <div>
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className={`mt-1 text-sm leading-7 ${emphasized ? "font-semibold text-ink" : "text-ink/72"}`}>{value}</p>
    </div>
  );
}

function ChallengeCard({ item, labels, onOpen }: { item: ChallengeItem; labels: (typeof copy)["cn"]; onOpen: (item: ChallengeItem) => void }) {
  return (
    <article className="rounded-md border border-ink/10 bg-paper/50 p-4">
      <p className="text-sm font-bold text-moss">{item.type}</p>
      <p className="mt-3 text-sm leading-7 text-ink/72">{item.content}</p>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="mt-4 w-full rounded-md border border-moss bg-white px-3 py-2 text-sm font-semibold text-moss transition hover:bg-lab"
      >
        {labels.expandChallenge}
      </button>
    </article>
  );
}

function ActionDetailDrawer({ action, labels, onClose }: { action: LensActionItem; labels: (typeof copy)["cn"]; onClose: () => void }) {
  return (
    <DetailShell title={action.title} subtitle={action.shortReason} closeLabel={labels.close} onClose={onClose}>
      <DetailText title={labels.fitFor} value={action.detail.fitFor} />
      <DetailText title={labels.whyUseful} value={action.detail.whyUseful} />
      <DetailList title={labels.howToDo} items={action.detail.howToDo} />
      <DetailText title={labels.minimumVersion} value={action.detail.minimumVersion} />
      <DetailList title={labels.pitfalls} items={action.detail.pitfalls} />
      <DetailText title={labels.followUpQuestion} value={action.detail.followUpQuestion} highlighted />
    </DetailShell>
  );
}

function ChallengeDetailDrawer({ challenge, labels, onClose }: { challenge: ChallengeItem; labels: (typeof copy)["cn"]; onClose: () => void }) {
  const detail = challenge.detail;

  if (!detail) return null;

  return (
    <DetailShell title={challenge.type} subtitle={challenge.content} closeLabel={labels.close} onClose={onClose}>
      <DetailText title={labels.whatItChallenges} value={detail.whatItChallenges} />
      <DetailText title={labels.hiddenAssumption} value={detail.hiddenAssumption} />
      <DetailText title={labels.whyItMightBeWrong} value={detail.whyItMightBeWrong} />
      <DetailText title={labels.counterExample} value={detail.counterExample} />
      <DetailText title={labels.howToVerify} value={detail.howToVerify} />
      <DetailText title={labels.followUpQuestion} value={detail.followUpQuestion} highlighted />
    </DetailShell>
  );
}

function DetailShell({
  title,
  subtitle,
  closeLabel,
  children,
  onClose
}: {
  title: string;
  subtitle: string;
  closeLabel: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[1000]">
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 h-full w-full animate-[modalFadeIn_180ms_ease-out] bg-[rgba(31,41,37,0.28)] backdrop-blur-[8px]"
      />
      <section className="fixed bottom-3 left-3 right-3 max-h-[86vh] overflow-y-auto rounded-[24px] border border-moss/20 bg-[rgba(255,252,246,0.96)] p-4 shadow-[0_30px_100px_rgba(31,41,37,0.26)] animate-[modalPopIn_200ms_ease-out] min-[721px]:left-1/2 min-[721px]:top-1/2 min-[721px]:bottom-auto min-[721px]:right-auto min-[721px]:w-[min(680px,calc(100vw-40px))] min-[721px]:max-h-[min(760px,calc(100vh-48px))] min-[721px]:-translate-x-1/2 min-[721px]:-translate-y-1/2 min-[721px]:rounded-[28px] min-[721px]:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 pr-2">
            <h2 className="text-2xl font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/66">{subtitle}</p>
          </div>
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/15 bg-white text-lg font-semibold text-ink transition hover:border-moss hover:text-moss"
          >
            ×
          </button>
        </div>
        <div className="mt-5 grid gap-3">{children}</div>
      </section>
    </div>
  );
}

function DetailText({ title, value, highlighted = false }: { title: string; value: string; highlighted?: boolean }) {
  if (!value) return null;

  return (
    <section className={`rounded-md border p-4 ${highlighted ? "border-moss/25 bg-lab" : "border-ink/10 bg-white/85"}`}>
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className="mt-2 text-sm leading-7 text-ink/72">{value}</p>
    </section>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  return (
    <section className="rounded-md border border-ink/10 bg-white/85 p-4">
      <p className="text-sm font-bold text-ink">{title}</p>
      <ol className="mt-3 grid gap-2">
        {safeItems.map((item, index) => (
          <li key={`${item}-${index}`} className="rounded-md border border-ink/8 bg-paper/55 p-3 text-sm leading-6 text-ink/72">
            {item}
          </li>
        ))}
      </ol>
    </section>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">{children}</p>;
}

function LensSection({ title, children }: { title: string; children: React.ReactNode }) {
  if (!children) return null;

  return (
    <div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 whitespace-pre-line text-sm leading-7 text-ink/72">{children}</p>
    </div>
  );
}

function ContentBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="break-words border border-ink/12 bg-white/75 p-4 shadow-soft sm:p-6">
      <SectionLabel>{title}</SectionLabel>
      <p className="mt-3 whitespace-pre-line text-sm leading-7 text-ink/75 sm:text-base sm:leading-8">{children}</p>
    </section>
  );
}

function CardLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-semibold text-ink">{label}</dt>
      <dd className="mt-1 break-words text-ink/68">{value}</dd>
    </div>
  );
}
