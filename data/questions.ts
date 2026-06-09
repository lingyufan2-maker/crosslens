import type { Category, Question } from "@/lib/types";

export const categories: Category[] = [
  "AI 与未来工作",
  "职业转型与教育选择",
  "社会结构与阶层流动",
  "互联网平台与信息茧房",
  "亲密关系与孤独",
  "消费、身份与欲望",
  "城市、迁移与人生路径",
  "伦理、风险与判断力"
];

export const adjacentCategories: Record<Category, Category[]> = {
  "AI 与未来工作": ["职业转型与教育选择", "互联网平台与信息茧房", "伦理、风险与判断力"],
  "职业转型与教育选择": ["AI 与未来工作", "社会结构与阶层流动", "城市、迁移与人生路径"],
  "社会结构与阶层流动": ["职业转型与教育选择", "城市、迁移与人生路径", "消费、身份与欲望"],
  "互联网平台与信息茧房": ["AI 与未来工作", "消费、身份与欲望", "伦理、风险与判断力"],
  "亲密关系与孤独": ["消费、身份与欲望", "城市、迁移与人生路径", "伦理、风险与判断力"],
  "消费、身份与欲望": ["互联网平台与信息茧房", "亲密关系与孤独", "社会结构与阶层流动"],
  "城市、迁移与人生路径": ["职业转型与教育选择", "社会结构与阶层流动", "亲密关系与孤独"],
  "伦理、风险与判断力": ["AI 与未来工作", "互联网平台与信息茧房", "亲密关系与孤独"]
};

export const questions: Question[] = [
  {
    id: "q001",
    category: "AI 与未来工作",
    difficulty: "medium",
    question_cn: "如果 AI 能完成我 60% 的工作，我应该把自己训练成专家，还是训练成会调用专家系统的人？",
    question_en: "If AI can do 60% of my work, should I train myself as an expert or as someone who can orchestrate expert systems?",
    likely_user_bias: "把 AI 只看成替代工具，忽略工作被重新拆分的可能。",
    anti_bubble_angle: "真正变化的也许不是岗位消失，而是可信判断、问题定义和组织协调的溢价上升。",
    suggested_lens_pool: ["TECH", "CAREER", "MKT", "EXEC"]
  },
  {
    id: "q002",
    category: "AI 与未来工作",
    difficulty: "hard",
    question_cn: "当模型越来越便宜时，什么能力反而会变贵？",
    question_en: "When models become cheaper, which human capabilities become more valuable?",
    likely_user_bias: "默认技术越强，人越不重要。",
    anti_bubble_angle: "廉价生成会抬高稀缺约束的价值：信任、分发、品味、责任和现场知识。",
    suggested_lens_pool: ["TECH", "MKT", "CAREER", "ETH"]
  },
  {
    id: "q003",
    category: "AI 与未来工作",
    difficulty: "medium",
    question_cn: "我害怕被 AI 取代，背后害怕的是收入下降、身份失效，还是学习速度不够？",
    question_en: "When I fear being replaced by AI, am I afraid of income loss, identity loss, or falling behind in learning speed?",
    likely_user_bias: "把复杂焦虑压缩成单一的技术恐惧。",
    anti_bubble_angle: "恐惧可能来自身份叙事，而不只是技能差距。",
    suggested_lens_pool: ["SELF", "TECH", "CAREER", "ID"]
  },
  {
    id: "q004",
    category: "AI 与未来工作",
    difficulty: "hard",
    question_cn: "公司用 AI 提效后，节省的时间会回到员工身上，还是变成新的绩效基线？",
    question_en: "After companies use AI to increase productivity, will saved time return to employees or become the new performance baseline?",
    likely_user_bias: "只从个人工具效率看 AI，而忽略组织激励。",
    anti_bubble_angle: "效率收益的归属，取决于议价能力和制度设计。",
    suggested_lens_pool: ["MKT", "SOC", "TECH", "ETH"]
  },
  {
    id: "q005",
    category: "职业转型与教育选择",
    difficulty: "medium",
    question_cn: "我想转行，是因为新行业更适合我，还是因为旧路径让我看不到尊严和增长？",
    question_en: "Do I want to switch careers because the new field fits me better, or because my current path no longer offers dignity and growth?",
    likely_user_bias: "把逃离当成选择，把疲惫当成兴趣。",
    anti_bubble_angle: "转型前需要分清行业问题、组织问题和自我叙事问题。",
    suggested_lens_pool: ["CAREER", "SELF", "ID", "EXEC"]
  },
  {
    id: "q006",
    category: "职业转型与教育选择",
    difficulty: "medium",
    question_cn: "读研是在增加选择权，还是在推迟一次必须面对的职业判断？",
    question_en: "Is graduate school increasing my options, or postponing a career judgment I need to make?",
    likely_user_bias: "把学历视为通用安全感。",
    anti_bubble_angle: "教育投资的价值取决于它是否改变信息、网络和准入门槛。",
    suggested_lens_pool: ["CAREER", "MKT", "SOC", "EXEC"]
  },
  {
    id: "q007",
    category: "职业转型与教育选择",
    difficulty: "easy",
    question_cn: "我应该追求热爱，还是先建立一个能养活热爱的职业结构？",
    question_en: "Should I pursue passion directly, or first build a career structure that can sustain it?",
    likely_user_bias: "把热爱和现实放在二选一的位置。",
    anti_bubble_angle: "热爱可以被职业结构保护，也可能被过早商业化消耗。",
    suggested_lens_pool: ["CAREER", "SELF", "MKT", "EXEC"]
  },
  {
    id: "q008",
    category: "职业转型与教育选择",
    difficulty: "hard",
    question_cn: "如果未来五年岗位变化很快，我现在该学习稳定知识，还是学习迁移能力？",
    question_en: "If roles change quickly over the next five years, should I learn stable knowledge or transferable capabilities?",
    likely_user_bias: "把学习内容和学习能力对立起来。",
    anti_bubble_angle: "最有用的组合可能是稳定底层模型加快速场景迁移。",
    suggested_lens_pool: ["CAREER", "TECH", "EXEC", "ID"]
  },
  {
    id: "q009",
    category: "社会结构与阶层流动",
    difficulty: "hard",
    question_cn: "努力为什么有时不能带来流动，是因为个人不够努力，还是赛道入口被结构性限制？",
    question_en: "When hard work does not lead to mobility, is it personal effort or structural access that is constrained?",
    likely_user_bias: "用个人成败解释所有社会结果。",
    anti_bubble_angle: "努力的回报率并不均匀，它受家庭、城市、制度和网络影响。",
    suggested_lens_pool: ["SOC", "CAREER", "MKT", "ETH"]
  },
  {
    id: "q010",
    category: "社会结构与阶层流动",
    difficulty: "medium",
    question_cn: "我相信的公平竞争，是否默认了每个人都有相似的起跑资源？",
    question_en: "Does my belief in fair competition assume that everyone starts with similar resources?",
    likely_user_bias: "把规则公平等同于结果机会公平。",
    anti_bubble_angle: "同一规则在不同资源基础上会产生不同风险。",
    suggested_lens_pool: ["SOC", "ETH", "ID", "COMM"]
  },
  {
    id: "q011",
    category: "社会结构与阶层流动",
    difficulty: "hard",
    question_cn: "一个人的选择，是自由意志更多，还是可见选项更多？",
    question_en: "Are people shaped more by free will or by the options they can actually see?",
    likely_user_bias: "高估选择本身，低估可见性和可达性。",
    anti_bubble_angle: "很多人生差异来自问题菜单不同，而不是答案能力不同。",
    suggested_lens_pool: ["SOC", "SELF", "ID", "ETH"]
  },
  {
    id: "q012",
    category: "社会结构与阶层流动",
    difficulty: "medium",
    question_cn: "家庭给我的限制，哪些是现实约束，哪些是我内化后的边界？",
    question_en: "Which limits from my family are real constraints, and which have become internalized boundaries?",
    likely_user_bias: "要么全怪家庭，要么全怪自己。",
    anti_bubble_angle: "结构影响和个人能动性可以同时存在。",
    suggested_lens_pool: ["SOC", "SELF", "ID", "EXEC"]
  },
  {
    id: "q013",
    category: "互联网平台与信息茧房",
    difficulty: "medium",
    question_cn: "我每天看到的信息，是我选择的，还是平台替我训练出的偏好？",
    question_en: "Is the information I see each day chosen by me, or by preferences that platforms have trained in me?",
    likely_user_bias: "把点击当成自主选择。",
    anti_bubble_angle: "偏好可能是互动、推荐和商业目标共同塑造的结果。",
    suggested_lens_pool: ["PROD", "TECH", "COMM", "ETH"]
  },
  {
    id: "q014",
    category: "互联网平台与信息茧房",
    difficulty: "hard",
    question_cn: "推荐算法是在帮我节省时间，还是在降低我遇见陌生思想的概率？",
    question_en: "Are recommendation algorithms saving my time, or reducing my chance of encountering unfamiliar ideas?",
    likely_user_bias: "只从便利性评价推荐系统。",
    anti_bubble_angle: "效率和认知多样性之间存在隐性交易。",
    suggested_lens_pool: ["TECH", "PROD", "ETH", "COMM"]
  },
  {
    id: "q015",
    category: "互联网平台与信息茧房",
    difficulty: "medium",
    question_cn: "为什么我越刷越累，却还是停不下来？",
    question_en: "Why do I feel more exhausted the more I scroll, yet still cannot stop?",
    likely_user_bias: "把上瘾完全理解为意志力问题。",
    anti_bubble_angle: "疲惫可能来自产品机制、情绪调节和社交比较的叠加。",
    suggested_lens_pool: ["SELF", "PROD", "MKT", "ETH"]
  },
  {
    id: "q016",
    category: "互联网平台与信息茧房",
    difficulty: "hard",
    question_cn: "当内容平台奖励极端表达时，温和复杂的观点如何生存？",
    question_en: "When content platforms reward extreme expression, how can nuanced views survive?",
    likely_user_bias: "默认好内容自然会被看见。",
    anti_bubble_angle: "传播机制可能惩罚复杂度，而不是简单反映大众偏好。",
    suggested_lens_pool: ["COMM", "PROD", "MKT", "ETH"]
  },
  {
    id: "q017",
    category: "亲密关系与孤独",
    difficulty: "medium",
    question_cn: "我想要亲密关系，是想被理解，还是想摆脱独自面对人生的压力？",
    question_en: "Do I want intimacy because I want to be understood, or because I want relief from facing life alone?",
    likely_user_bias: "把孤独简单等同于缺少伴侣。",
    anti_bubble_angle: "关系无法完全替代自我承接能力。",
    suggested_lens_pool: ["SELF", "ID", "SOC", "EXEC"]
  },
  {
    id: "q018",
    category: "亲密关系与孤独",
    difficulty: "hard",
    question_cn: "为什么越强调独立的人，有时越难建立稳定连接？",
    question_en: "Why do people who emphasize independence sometimes struggle to build stable connection?",
    likely_user_bias: "把独立和依赖看成绝对对立。",
    anti_bubble_angle: "健康连接需要可协商的依赖，而不是没有需求。",
    suggested_lens_pool: ["SELF", "ID", "COMM", "ETH"]
  },
  {
    id: "q019",
    category: "亲密关系与孤独",
    difficulty: "medium",
    question_cn: "我在关系中的高标准，是清醒的边界，还是对受伤的预防性控制？",
    question_en: "Are my high standards in relationships clear boundaries, or preventive control against being hurt?",
    likely_user_bias: "把防御包装成理性标准。",
    anti_bubble_angle: "边界保护真实需要，控制则避免真实暴露。",
    suggested_lens_pool: ["SELF", "ID", "COMM", "EXEC"]
  },
  {
    id: "q020",
    category: "亲密关系与孤独",
    difficulty: "easy",
    question_cn: "孤独是一个需要解决的问题，还是一个需要被理解的信号？",
    question_en: "Is loneliness a problem to solve, or a signal to understand?",
    likely_user_bias: "急于消除不舒服的感受。",
    anti_bubble_angle: "孤独可能在提示连接质量、生活结构或自我关系的问题。",
    suggested_lens_pool: ["SELF", "SOC", "ID", "EXEC"]
  },
  {
    id: "q021",
    category: "消费、身份与欲望",
    difficulty: "medium",
    question_cn: "我买的东西是在满足需要，还是在购买一种想成为的自己？",
    question_en: "Am I buying what I need, or buying an image of who I want to become?",
    likely_user_bias: "把消费选择看成纯粹个人偏好。",
    anti_bubble_angle: "消费常常是身份叙事、阶层想象和平台刺激的交汇点。",
    suggested_lens_pool: ["ID", "MKT", "SELF", "SOC"]
  },
  {
    id: "q022",
    category: "消费、身份与欲望",
    difficulty: "hard",
    question_cn: "为什么越追求精致生活，我越容易觉得自己不够好？",
    question_en: "Why can pursuing a refined life make me feel increasingly inadequate?",
    likely_user_bias: "把审美升级看成单纯的自我提升。",
    anti_bubble_angle: "欲望被持续升级时，满足感会被新的比较对象吞噬。",
    suggested_lens_pool: ["SELF", "MKT", "ID", "COMM"]
  },
  {
    id: "q023",
    category: "消费、身份与欲望",
    difficulty: "medium",
    question_cn: "付费课程是在购买知识，还是在购买一种改变的希望？",
    question_en: "When I buy a paid course, am I buying knowledge or the hope of transformation?",
    likely_user_bias: "把购买行为误认为行动完成。",
    anti_bubble_angle: "真正稀缺的可能不是信息，而是反馈、约束和持续执行。",
    suggested_lens_pool: ["MKT", "SELF", "EXEC", "CAREER"]
  },
  {
    id: "q024",
    category: "消费、身份与欲望",
    difficulty: "hard",
    question_cn: "当品牌卖给我价值观时，我是在表达自我，还是在外包身份？",
    question_en: "When brands sell me values, am I expressing myself or outsourcing identity?",
    likely_user_bias: "把价值消费视为天然更高级。",
    anti_bubble_angle: "身份表达也可能被商业语言预先格式化。",
    suggested_lens_pool: ["ID", "MKT", "COMM", "ETH"]
  },
  {
    id: "q025",
    category: "城市、迁移与人生路径",
    difficulty: "medium",
    question_cn: "我留在大城市，是因为机会更多，还是因为我害怕承认另一种生活也可能成立？",
    question_en: "Do I stay in a big city because there are more opportunities, or because I fear admitting another life could also work?",
    likely_user_bias: "默认大城市等于更优人生。",
    anti_bubble_angle: "城市选择不只是资源选择，也是身份、网络和风险偏好的选择。",
    suggested_lens_pool: ["SOC", "CAREER", "ID", "SELF"]
  },
  {
    id: "q026",
    category: "城市、迁移与人生路径",
    difficulty: "hard",
    question_cn: "迁移到一个新城市，究竟改变的是机会、关系，还是我对自己的想象？",
    question_en: "When moving to a new city, what changes most: opportunities, relationships, or my imagination of myself?",
    likely_user_bias: "把换城市当成自动换人生。",
    anti_bubble_angle: "环境改变可以打开脚本，但旧习惯可能会复制到新地点。",
    suggested_lens_pool: ["SOC", "SELF", "ID", "EXEC"]
  },
  {
    id: "q027",
    category: "城市、迁移与人生路径",
    difficulty: "medium",
    question_cn: "回家乡发展是退路，还是一种被低估的长期策略？",
    question_en: "Is returning to my hometown a fallback, or an underestimated long-term strategy?",
    likely_user_bias: "用单一城市等级评价人生选择。",
    anti_bubble_angle: "低成本、强关系和本地机会可能形成不同的复利。",
    suggested_lens_pool: ["CAREER", "SOC", "MKT", "ID"]
  },
  {
    id: "q028",
    category: "伦理、风险与判断力",
    difficulty: "hard",
    question_cn: "一个选择只要对我有利，就足够合理吗？",
    question_en: "If a choice benefits me, is that enough to make it reasonable?",
    likely_user_bias: "把个人收益当作唯一判断标准。",
    anti_bubble_angle: "长期判断需要看外部性、可复制性和对他人的影响。",
    suggested_lens_pool: ["ETH", "SELF", "SOC", "EXEC"]
  },
  {
    id: "q029",
    category: "伦理、风险与判断力",
    difficulty: "medium",
    question_cn: "我拒绝一个新技术，是因为看见了风险，还是因为不愿重新学习规则？",
    question_en: "When I reject a new technology, am I seeing real risks or resisting the need to relearn the rules?",
    likely_user_bias: "把不适感直接解释为伦理立场。",
    anti_bubble_angle: "风险判断需要同时区分真实伤害、未知成本和学习抗拒。",
    suggested_lens_pool: ["ETH", "TECH", "SELF", "EXEC"]
  },
  {
    id: "q030",
    category: "伦理、风险与判断力",
    difficulty: "hard",
    question_cn: "如果一个产品能提高效率但会操控注意力，我们应该如何判断它的价值？",
    question_en: "If a product improves efficiency but manipulates attention, how should we judge its value?",
    likely_user_bias: "只用效率或只用道德直觉做判断。",
    anti_bubble_angle: "技术价值需要同时评估收益、伤害、选择权和退出成本。",
    suggested_lens_pool: ["ETH", "PROD", "TECH", "MKT"]
  }
];
