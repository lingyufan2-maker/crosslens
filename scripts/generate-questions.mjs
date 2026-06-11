import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");
const outputPath = join(rootDir, "public", "questions.json");
const deepseekUrl = "https://api.deepseek.com/chat/completions";

loadEnvLocal();

const apiKey = process.env.DEEPSEEK_API_KEY;
const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-pro";

if (!apiKey) {
  console.log("[CrossLens] DEEPSEEK_API_KEY is missing. Existing public/questions.json was kept.");
  process.exit(0);
}

const generationPrompt = `你是 CrossLens 的问题策展 AI。

CrossLens 是一个“以问题为入口的社交与信息平权平台”。
它希望通过问题帮助用户打开信息差、阶层差、行业差、教育差和人生经验差。
问题要适合普通人阅读，但背后必须有跨学科深度。

请生成 200 个跨学科问题。

总体要求：
1. 每个问题必须至少连接 2 个学科视角。
2. 不要生成鸡汤问题，不要生成空泛问题。
3. 问题要能引发人与人之间的讨论，而不是只有标准答案。
4. 问题要能打开信息差，比如行业规则、教育路径、城市经验、阶层入口、技术变化、心理机制、社会结构。
5. 语言要普通人能懂，不要像论文题目。
6. 问题要适合陌生人围绕它交流。
7. 避免过度敏感、攻击性、歧视性表达。
8. 不要只围绕 AI，要覆盖人生、职业、教育、城市、关系、技术、媒体、消费、法律、文化、心理、经济。

请覆盖这些问题方向：
- 职业路径与行业规则
- AI 与普通人的机会
- 教育资源与信息差
- 阶层流动与隐形规则
- 城市生活与机会结构
- 社交平台与亲密关系
- 媒体、注意力与欲望
- 消费、金钱与时间价值
- 心理创伤、成长与选择
- 法律、伦理与平台治理
- 创作、表达与技术工具
- 全球化、迁移与身份转换

每条问题输出为 JSON，格式如下：

{
  "short_question": "适合背景漂浮的短问题，8-22字",
  "full_question": "适合用户点击讨论的完整问题，30-80字",
  "lenses": ["学科1", "学科2", "学科3"],
  "entry_type": "职业入口 / 阶层入口 / 行业入口 / 城市入口 / 心理入口 / 技术入口 / 教育入口 / 关系入口 / 媒体入口",
  "discussion_value": 1-10,
  "information_gap_value": 1-10,
  "risk_level": "low / medium"
}

只输出 JSON 数组，不要解释，不要 markdown，不要代码块。`;

const reviewPrompt = (questions) => `你是 CrossLens 的问题质量审核 AI。

请审核下面的问题列表，只保留高质量问题。

保留标准：
1. 问题必须能引发真实讨论。
2. 问题必须有跨学科空间，不能只是单一常识问题。
3. 问题必须和信息差、人生路径、社会经验、技术变化、职业选择或阶层入口有关。
4. 问题不能太鸡汤，不能太空泛，不能像营销标题。
5. 背景短问题必须简洁、有钩子、适合漂浮在网页背景。
6. 完整问题必须能让用户愿意点击进入讨论。

删除以下问题：
- “如何变得更优秀”这类空话
- 只有标准答案的问题
- 过度宏大但没有现实入口的问题
- 太像论文题目的问题
- 容易引发攻击、歧视或羞辱的问题

请返回筛选后的 JSON 数组，并给每条问题增加：
"quality_reason": "为什么这个问题值得保留"

只返回 JSON 数组，不要解释，不要 markdown，不要代码块。

问题列表：
${JSON.stringify(questions)}`;

try {
  console.log("[CrossLens] Generating 200 questions with DeepSeek...");
  const generated = await requestJsonArray(generationPrompt);
  console.log(`[CrossLens] Generated ${generated.length} questions. Reviewing quality...`);
  const reviewed = await requestJsonArray(reviewPrompt(generated));
  const normalized = normalizeQuestions(reviewed);

  if (normalized.length === 0) {
    throw new Error("DeepSeek returned no usable questions after review.");
  }

  writeFileSync(outputPath, `${JSON.stringify(normalized, null, 2)}\n`, "utf8");
  console.log(`[CrossLens] Saved ${normalized.length} questions to public/questions.json`);
} catch (error) {
  console.error("[CrossLens] Question generation failed. Existing public/questions.json was kept.");
  console.error(error);
  process.exitCode = 1;
}

function loadEnvLocal() {
  const envPath = join(rootDir, ".env.local");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

async function requestJsonArray(prompt) {
  const response = await fetch(deepseekUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      thinking: { type: "enabled" },
      reasoning_effort: "high",
      temperature: 0.7,
      max_tokens: 6000,
      stream: false,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "你只返回合法 JSON。若用户要求 JSON 数组，请返回形如 {\"questions\": [...]} 的 JSON 对象，不要 markdown，不要代码块。"
        },
        {
          role: "user",
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("DeepSeek returned empty content.");

  const parsed = parseJson(content);
  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.questions)) return parsed.questions;
  if (Array.isArray(parsed.data)) return parsed.data;

  throw new Error("DeepSeek response did not contain a JSON array.");
}

function parseJson(content) {
  const clean = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  return JSON.parse(clean);
}

function normalizeQuestions(questions) {
  return questions
    .filter((item) => item && typeof item === "object")
    .map((item, index) => ({
      id: item.id || `q_${String(index + 1).padStart(3, "0")}`,
      short_question: String(item.short_question || "").slice(0, 32),
      full_question: String(item.full_question || "").slice(0, 120),
      lenses: Array.isArray(item.lenses) ? item.lenses.slice(0, 4).map(String) : [],
      entry_type: String(item.entry_type || "信息入口"),
      discussion_value: clampScore(item.discussion_value),
      information_gap_value: clampScore(item.information_gap_value),
      risk_level: item.risk_level === "medium" ? "medium" : "low",
      quality_reason: String(item.quality_reason || "这个问题有跨学科讨论价值。")
    }))
    .filter((item) => item.short_question && item.full_question);
}

function clampScore(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 7;
  return Math.max(1, Math.min(10, Math.round(number)));
}
