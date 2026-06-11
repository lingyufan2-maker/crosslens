export type Language = "cn" | "en";

export type Category =
  | "AI 与未来工作"
  | "职业转型与教育选择"
  | "社会结构与阶层流动"
  | "互联网平台与信息茧房"
  | "亲密关系与孤独"
  | "消费、身份与欲望"
  | "城市、迁移与人生路径"
  | "伦理、风险与判断力";

export type Difficulty = "easy" | "medium" | "hard";

export type LensCode =
  | "SELF"
  | "SOC"
  | "MKT"
  | "PROD"
  | "TECH"
  | "ETH"
  | "CAREER"
  | "ID"
  | "COMM"
  | "EXEC";

export type Question = {
  id: string;
  category: Category;
  difficulty: Difficulty;
  question_cn: string;
  question_en: string;
  likely_user_bias: string;
  anti_bubble_angle: string;
  suggested_lens_pool: LensCode[];
};

export type Analysis = {
  question: string;
  summary: string;
  coreInsight: string;
  defaultAssumption: string;
  nextAction: string;
  lenses: LensAnalysisItem[];
  reframedQuestion: string;
  selectedLenses: LensCode[];
  interdisciplinaryAnalysis: InterdisciplinaryAnalysisItem[];
  analysis: Array<{
    lens: LensCode;
    title: string;
    body: string;
  }>;
  hiddenAngle: string;
  challenge: string;
  challengeMe: ChallengeItem[];
  nextActions: string[];
  ordinaryTakeaway: string[];
  thinkingCard: {
    originalQuestion: string;
    reframedQuestion: string;
    mostImportantLens: LensCode;
    challengedAssumption: string;
    nextAction: string;
  };
};

export type AnalyzeApiResponse = {
  analysis: CrossLensApiAnalysis;
  isFallback: boolean;
  notice?: string;
  meta?: AiSourceMeta;
};

export type AiSourceMeta = {
  source: "deepseek" | "fallback";
  model: string;
  fallbackReason?: string;
  reasoning?: "high";
};

export type DeepSeekLens = {
  code: LensCode;
  name: string;
  reason: string;
};

export type InterdisciplinaryAnalysisItem = {
  lens: LensCode;
  lensName: string;
  oneLineConclusion: string;
  meaning: string;
  academicHook: string;
  realLifeExample: string;
  actionTips: Array<string | LensActionItem>;
  insight?: string;
  blindSpot?: string;
  judgment?: string;
};

export type LensAnalysisItem = {
  code: LensCode;
  name: string;
  oneSentence: string;
  plainExplanation: string;
  academicHook: string;
  realExample: string;
  actions: LensActionItem[];
};

export type LensActionDetail = {
  fitFor: string;
  whyUseful: string;
  howToDo: string[];
  minimumVersion: string;
  pitfalls: string[];
  followUpQuestion: string;
};

export type LensActionItem = {
  title: string;
  shortReason: string;
  detail: LensActionDetail;
};

export type ChallengeDetail = {
  whatItChallenges: string;
  hiddenAssumption: string;
  whyItMightBeWrong: string;
  counterExample: string;
  howToVerify: string;
  followUpQuestion: string;
};

export type ChallengeItem = {
  type: "Assumption Challenge" | "Evidence Challenge" | "Alternative View" | string;
  content: string;
  detail?: ChallengeDetail;
};

export type CrossLensApiAnalysis = {
  question: string;
  summary: string;
  coreInsight: string;
  defaultAssumption: string;
  nextAction: string;
  lenses: LensAnalysisItem[];
  challengeMe: ChallengeItem[];
  ordinaryTakeaway: string[];
  thinkingCard: {
    originalQuestion: string;
    reframedQuestion: string;
    keyLens: LensCode | string;
    challengedAssumption: string;
    nextAction: string;
  };
  reframedQuestion?: string;
  selectedLenses?: DeepSeekLens[];
  interdisciplinaryAnalysis?: InterdisciplinaryAnalysisItem[];
  antiBubbleAngle?: string;
  nextActions?: string[];
};

export type DeepSeekAnalysisPayload = CrossLensApiAnalysis;

export type CareerBridgeInput = {
  city: string;
  industry: string;
  role: string;
  goal: string;
  resources: string;
};

export type CareerBridgeResult = {
  score: number;
  cityType: string;
  diagnosis: string[];
  gaps: string[];
  actions: string[];
  communityQuestions: string[];
};

export type CareerBridgeApiResponse = {
  result: CareerBridgeResult;
  isFallback: boolean;
  notice?: string;
  meta?: AiSourceMeta;
};

export type LifeView = {
  position: string;
  firstReaction: string;
  whatTheyCareAbout: string;
  blindSpot: string;
  tinyStory: string;
  whatThisReveals: string;
};

export type LifeLensMiniLens = {
  lens: string;
  simpleExplanation: string;
  realExample: string;
};

export type LifeLensResult = {
  question: string;
  summary: string;
  lifeViews: LifeView[];
  crossDisciplinaryLens: LifeLensMiniLens[];
  takeaway: string[];
  meta: AiSourceMeta;
};

export type LifeLensApiResponse = {
  result: LifeLensResult;
  isFallback: boolean;
  notice?: string;
  meta?: AiSourceMeta;
};
