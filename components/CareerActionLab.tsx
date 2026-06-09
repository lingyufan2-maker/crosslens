"use client";

import { useState } from "react";
import type { CareerBridgeApiResponse, CareerBridgeInput, CareerBridgeResult, Language } from "@/lib/types";

const emptyForm: CareerBridgeInput = {
  city: "",
  industry: "",
  role: "",
  goal: "",
  resources: ""
};

const labels = {
  cn: {
    kicker: "Career Action Lab",
    intro: "评估你的城市、行业和目标方向之间有没有跳板关系。",
    start: "开始评估",
    title: "城市跳板机会评估",
    subtitle: "把当前位置拆成城市、行业、岗位、目标和资源，看看下一步该往哪里借力。",
    city: "当前城市",
    cityPlaceholder: "例如 香港 / 深圳 / 上海 / 杭州 / 新加坡 / 纽约",
    industry: "当前行业",
    industryPlaceholder: "例如 内容 / AI / 金融 / 教育 / 传媒 / 设计 / 运营",
    role: "当前岗位",
    rolePlaceholder: "例如 学生 / 实习 / 剪辑 / 产品 / UX / 编剧 / 市场",
    goal: "目标方向",
    goalPlaceholder: "例如 AI 产品 / HCI / 海外申请 / 内容科技 / UX Research",
    resources: "你现在有什么资源",
    resourcesPlaceholder: "例如 作品集 / 人脉 / 英语 / 技术 / 实习 / 资金",
    evaluate: "评估我的城市跳板机会",
    plan: "生成我的 30 天行动计划",
    loading: "正在生成你的跳板评估...",
    fallback: "当前使用本地规则版评估，未连接真实 AI。",
    score: "跳板机会指数",
    cityType: "城市判断",
    diagnosis: "缺口诊断",
    gaps: "主要缺口",
    actions: "你可以怎么改变",
    community: "适合发到 CrossLens 社区的问题",
    close: "关闭"
  },
  en: {
    kicker: "Career Action Lab",
    intro: "Evaluate whether your city, industry, and goal can form a career bridge.",
    start: "Start Evaluation",
    title: "Career Bridge Evaluation",
    subtitle: "Break your position into city, industry, role, goal, and resources, then find where to borrow leverage.",
    city: "Current City",
    cityPlaceholder: "e.g. Hong Kong / Shenzhen / Shanghai / Singapore / New York",
    industry: "Current Industry",
    industryPlaceholder: "e.g. Content / AI / Finance / Education / Media / Design / Ops",
    role: "Current Role",
    rolePlaceholder: "e.g. Student / Intern / Editor / Product / UX / Marketing",
    goal: "Target Direction",
    goalPlaceholder: "e.g. AI Product / HCI / Overseas Application / Content Tech / UX Research",
    resources: "Current Resources",
    resourcesPlaceholder: "e.g. Portfolio / Network / English / Tech / Internship / Funds",
    evaluate: "Evaluate My Career Bridge",
    plan: "Generate My 30-Day Plan",
    loading: "Generating your bridge evaluation...",
    fallback: "Using the local rule-based evaluation. Real AI is not connected.",
    score: "Bridge Opportunity Score",
    cityType: "City Type",
    diagnosis: "Gap Diagnosis",
    gaps: "Key Gaps",
    actions: "What To Change",
    community: "Questions For CrossLens Community",
    close: "Close"
  }
};

export default function CareerActionLab({ language, variant = "card" }: { language: Language; variant?: "card" | "bottom" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<CareerBridgeInput>(emptyForm);
  const [result, setResult] = useState<CareerBridgeResult | null>(null);
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const t = labels[language];

  function updateField(field: keyof CareerBridgeInput, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitLab() {
    setIsLoading(true);
    setNotice("");

    try {
      const response = await fetch("/api/career-bridge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          language
        })
      });

      if (!response.ok) {
        throw new Error("Career bridge request failed.");
      }

      const data = (await response.json()) as CareerBridgeApiResponse;
      setResult(data.result);
      setNotice(data.isFallback ? data.notice ?? t.fallback : "");
    } catch {
      setNotice(t.fallback);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {variant === "bottom" ? (
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss"
          >
            {t.evaluate}
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="rounded-md border border-moss bg-white px-4 py-3 text-sm font-semibold text-moss transition hover:bg-white/70"
          >
            {t.plan}
          </button>
        </div>
      ) : (
        <div className="mt-4 rounded-md border border-moss/20 bg-lab/70 p-3">
          <p className="text-sm font-bold text-ink">{t.kicker}</p>
          <p className="mt-1 text-sm leading-6 text-ink/68">{t.intro}</p>
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="mt-3 w-full rounded-md bg-moss px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-ink"
          >
            {t.start}
          </button>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label={t.close}
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 h-full w-full bg-ink/28 backdrop-blur-sm"
          />
          <section className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-y-auto rounded-t-2xl border border-ink/10 bg-paper p-4 shadow-2xl sm:inset-x-auto sm:right-4 sm:top-4 sm:h-[calc(100vh-32px)] sm:w-[min(560px,calc(100vw-32px))] sm:rounded-2xl sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">{t.kicker}</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{t.title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink/66">{t.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold text-ink hover:border-moss"
              >
                {t.close}
              </button>
            </div>

            <div className="mt-5 grid gap-3">
              <Field label={t.city} value={form.city} placeholder={t.cityPlaceholder} onChange={(value) => updateField("city", value)} />
              <Field
                label={t.industry}
                value={form.industry}
                placeholder={t.industryPlaceholder}
                onChange={(value) => updateField("industry", value)}
              />
              <Field label={t.role} value={form.role} placeholder={t.rolePlaceholder} onChange={(value) => updateField("role", value)} />
              <Field label={t.goal} value={form.goal} placeholder={t.goalPlaceholder} onChange={(value) => updateField("goal", value)} />
              <Field
                label={t.resources}
                value={form.resources}
                placeholder={t.resourcesPlaceholder}
                onChange={(value) => updateField("resources", value)}
                multiline
              />
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={submitLab}
                disabled={isLoading}
                className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss disabled:cursor-wait disabled:opacity-65"
              >
                {t.evaluate}
              </button>
              <button
                type="button"
                onClick={submitLab}
                disabled={isLoading}
                className="rounded-md border border-moss bg-white px-4 py-3 text-sm font-semibold text-moss transition hover:bg-lab disabled:cursor-wait disabled:opacity-65"
              >
                {t.plan}
              </button>
            </div>

            {isLoading && <p className="mt-4 rounded-md border border-moss/20 bg-lab p-3 text-sm font-semibold text-moss">{t.loading}</p>}
            {notice && <p className="mt-4 rounded-md border border-copper/25 bg-white p-3 text-sm font-semibold text-copper">{notice}</p>}
            {result && <CareerResult result={result} labels={t} />}
          </section>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  value,
  placeholder,
  multiline = false,
  onChange
}: {
  label: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const baseClass =
    "mt-1 w-full rounded-md border border-ink/12 bg-white/75 px-3 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink/35 focus:border-moss";

  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">{label}</span>
      {multiline ? (
        <textarea value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={`${baseClass} min-h-24 resize-none`} />
      ) : (
        <input value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={baseClass} />
      )}
    </label>
  );
}

function CareerResult({ result, labels: t }: { result: CareerBridgeResult; labels: (typeof labels)["cn"] }) {
  const score = Math.max(0, Math.min(100, Math.round(result.score || 0)));

  return (
    <div className="mt-5 grid gap-3">
      <section className="rounded-md border border-ink/10 bg-white/85 p-4">
        <p className="text-sm font-bold text-ink">{t.score}</p>
        <div className="mt-3 flex items-center gap-4">
          <div
            className="grid h-24 w-24 shrink-0 place-items-center rounded-full"
            style={{ background: `conic-gradient(#4f6f52 ${score * 3.6}deg, rgba(32, 37, 29, 0.1) 0deg)` }}
          >
            <div className="grid h-16 w-16 place-items-center rounded-full bg-paper text-xl font-bold text-ink">{score}</div>
          </div>
          <div>
            <p className="text-sm font-bold text-copper">{t.cityType}</p>
            <p className="mt-1 text-lg font-semibold text-ink">{result.cityType}</p>
          </div>
        </div>
      </section>

      <ListCard title={t.diagnosis} items={result.diagnosis} />
      <TagCard title={t.gaps} items={result.gaps} />
      <ListCard title={t.actions} items={result.actions} />
      <ListCard title={t.community} items={result.communityQuestions} />
    </div>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  return (
    <section className="rounded-md border border-ink/10 bg-white/85 p-4">
      <p className="text-sm font-bold text-ink">{title}</p>
      <ul className="mt-3 grid gap-2">
        {safeItems.map((item) => (
          <li key={item} className="rounded-md border border-ink/8 bg-paper/55 p-3 text-sm leading-6 text-ink/72">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

function TagCard({ title, items }: { title: string; items: string[] }) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) return null;

  return (
    <section className="rounded-md border border-ink/10 bg-white/85 p-4">
      <p className="text-sm font-bold text-ink">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {safeItems.map((item) => (
          <span key={item} className="rounded-full border border-moss/20 bg-lab px-3 py-1 text-sm font-semibold text-moss">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
