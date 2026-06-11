"use client";

import { useEffect, useState } from "react";

type StoryForm = {
  identity: string;
  city: string;
  experience: string;
  reminder: string;
  reflection: string;
};

const emptyForm: StoryForm = {
  identity: "",
  city: "",
  experience: "",
  reminder: "",
  reflection: ""
};

export default function AnonymousStoryModal({ question, isOpen, onClose }: { question: string; isOpen: boolean; onClose: () => void }) {
  const [form, setForm] = useState<StoryForm>(emptyForm);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function updateField(field: keyof StoryForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  function saveStory() {
    const existing = JSON.parse(window.localStorage.getItem("crosslens_anonymous_stories") || "[]") as Array<StoryForm & { question: string; createdAt: string }>;
    existing.push({
      ...form,
      question,
      createdAt: new Date().toISOString()
    });
    window.localStorage.setItem("crosslens_anonymous_stories", JSON.stringify(existing));
    setSaved(true);
  }

  return (
    <div className="fixed inset-0 z-[1000]">
      <button type="button" aria-label="关闭" onClick={onClose} className="absolute inset-0 h-full w-full bg-[rgba(31,41,37,0.28)] backdrop-blur-[8px]" />
      <section className="fixed bottom-3 left-3 right-3 max-h-[86vh] overflow-y-auto rounded-[24px] border border-moss/20 bg-[rgba(255,252,246,0.96)] p-4 shadow-[0_30px_100px_rgba(31,41,37,0.26)] min-[721px]:left-1/2 min-[721px]:top-1/2 min-[721px]:bottom-auto min-[721px]:right-auto min-[721px]:w-[min(680px,calc(100vw-40px))] min-[721px]:max-h-[min(760px,calc(100vh-48px))] min-[721px]:-translate-x-1/2 min-[721px]:-translate-y-1/2 min-[721px]:rounded-[28px] min-[721px]:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">Anonymous Story</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">我也匿名回答这个问题</h2>
            <p className="mt-2 text-sm leading-6 text-ink/66">{question}</p>
          </div>
          <button type="button" aria-label="关闭" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-ink/15 bg-white text-lg font-semibold text-ink hover:border-moss hover:text-moss">
            ×
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          <Field label="我是谁（可选）" placeholder="学生 / 服务业 / 白领 / 自由职业 / 退休 / 其他" value={form.identity} onChange={(value) => updateField("identity", value)} />
          <Field label="我所在城市（可选）" placeholder="例如 深圳 / 香港 / 小城市 / 海外" value={form.city} onChange={(value) => updateField("city", value)} />
          <Field label="我的真实经历" placeholder="你经历过什么？这个问题为什么让你有感觉？" value={form.experience} onChange={(value) => updateField("experience", value)} multiline />
          <Field label="我想提醒别人" placeholder="如果有人也遇到类似问题，你想提醒他什么？" value={form.reminder} onChange={(value) => updateField("reminder", value)} multiline />
          <Field label="这个问题让我想到" placeholder="一个人、一个选择、一次经历，或一个没被看见的现实。" value={form.reflection} onChange={(value) => updateField("reflection", value)} multiline />
        </div>

        <p className="mt-4 rounded-md border border-copper/20 bg-white/70 p-3 text-xs leading-5 text-copper">
          当前版本只保存在你的浏览器本地，不会公开发布。请不要填写真实姓名、电话、地址或其他敏感个人信息。
        </p>

        <button type="button" onClick={saveStory} className="mt-4 w-full rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-moss">
          保存到本地
        </button>

        {saved && <p className="mt-3 rounded-md border border-moss/20 bg-lab p-3 text-sm font-semibold text-moss">你的故事已经保存在本地。正式社区版本会支持匿名发布。</p>}
      </section>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  multiline = false,
  onChange
}: {
  label: string;
  placeholder: string;
  value: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  const className =
    "mt-1 w-full rounded-md border border-ink/12 bg-white/75 px-3 py-3 text-sm leading-6 text-ink outline-none transition placeholder:text-ink/35 focus:border-moss";

  return (
    <label className="block">
      <span className="text-sm font-bold text-ink">{label}</span>
      {multiline ? (
        <textarea className={`${className} min-h-24 resize-none`} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <input className={className} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
      )}
    </label>
  );
}
