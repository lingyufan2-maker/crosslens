"use client";

import { useState } from "react";
import type { LifeLensResult as LifeLensResultType } from "@/lib/types";
import AnonymousStoryModal from "@/components/AnonymousStoryModal";

export default function LifeLensResult({
  result,
  notice,
  onRedraw,
  onAnalyze,
  onBack
}: {
  result: LifeLensResultType;
  notice?: string;
  onRedraw: () => void;
  onAnalyze: () => void;
  onBack: () => void;
}) {
  const [isStoryOpen, setIsStoryOpen] = useState(false);
  const meta = result.meta;

  return (
    <section className="mx-auto w-full max-w-[1180px] py-5 sm:py-7">
      {notice && <p className="mb-4 rounded-md border border-copper/25 bg-white/80 p-3 text-sm font-semibold text-copper">{notice}</p>}

      <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold text-ink/62">
        <span className="rounded-full border border-moss/15 bg-white/70 px-3 py-1">AI source: {meta?.source ?? "unknown"}</span>
        <span className="rounded-full border border-moss/15 bg-white/70 px-3 py-1">Model: {meta?.model ?? "unknown"}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="rounded-md border border-ink/12 bg-white/82 p-4 shadow-soft lg:sticky lg:top-5">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">你抽到的问题</p>
          <h1 className="mt-3 text-xl font-semibold leading-tight">{result.question}</h1>
          <div className="mt-5 grid gap-2">
            <button type="button" onClick={onBack} className="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-semibold hover:border-moss">
              返回首页
            </button>
            <button type="button" onClick={onRedraw} className="rounded-md border border-moss bg-lab px-3 py-2 text-sm font-semibold text-moss hover:bg-white">
              再抽一个问题
            </button>
          </div>
        </aside>

        <div className="min-w-0 space-y-4">
          <section className="rounded-md border border-ink/12 bg-white/82 p-5 shadow-soft sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">CrossLens 先说一句</p>
            <p className="mt-3 text-xl font-semibold leading-8 text-ink sm:text-2xl">{result.summary}</p>
          </section>

          <section className="rounded-md border border-ink/12 bg-white/78 p-4 shadow-soft sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">不同人生怎么看</p>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {result.lifeViews.map((view) => (
                <details key={`${view.position}-${view.firstReaction}`} className="group rounded-md border border-ink/10 bg-paper/55 p-4">
                  <summary className="cursor-pointer list-none">
                    <span className="inline-flex rounded-full border border-moss/20 bg-lab px-3 py-1 text-xs font-bold text-moss">{view.position}</span>
                    <p className="mt-3 text-sm leading-7 text-ink/76">{view.firstReaction}</p>
                    <span className="mt-3 inline-block text-xs font-bold text-moss group-open:hidden">展开这个人生视角</span>
                    <span className="mt-3 hidden text-xs font-bold text-moss group-open:inline-block">收起</span>
                  </summary>
                  <div className="mt-4 grid gap-3 border-t border-ink/10 pt-4">
                    <MiniBlock title="他们在意什么" value={view.whatTheyCareAbout} />
                    <MiniBlock title="可能没看见什么" value={view.blindSpot} />
                    <MiniBlock title="一个小场景" value={view.tinyStory} />
                    <MiniBlock title="这揭示了什么" value={view.whatThisReveals} />
                  </div>
                </details>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-ink/12 bg-white/82 p-4 shadow-soft sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">简单跨学科 Lens</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {result.crossDisciplinaryLens.map((lens) => (
                <article key={lens.lens} className="rounded-md border border-ink/10 bg-paper/45 p-4">
                  <p className="text-sm font-bold text-moss">{lens.lens}</p>
                  <p className="mt-2 text-sm leading-6 text-ink/72">{lens.simpleExplanation}</p>
                  <p className="mt-3 rounded-md bg-white/65 p-3 text-sm leading-6 text-ink/62">{lens.realExample}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-ink/12 bg-white/82 p-4 shadow-soft sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-copper">普通人最该记住的</p>
            <ul className="mt-4 grid gap-2">
              {result.takeaway.map((item) => (
                <li key={item} className="rounded-md border border-ink/8 bg-paper/45 p-3 text-sm leading-7 text-ink/72">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-md border border-moss/20 bg-lab/75 p-4 shadow-soft sm:p-6">
            <div className="grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={onRedraw} className="rounded-md border border-moss bg-white px-4 py-3 text-sm font-semibold text-moss hover:bg-lab">
                再抽一个问题
              </button>
              <button type="button" onClick={() => setIsStoryOpen(true)} className="rounded-md bg-ink px-4 py-3 text-sm font-semibold text-white hover:bg-moss">
                我也匿名回答这个问题
              </button>
              <button type="button" onClick={onAnalyze} className="rounded-md border border-ink/15 bg-white px-4 py-3 text-sm font-semibold text-ink hover:border-moss">
                用完整 CrossLens 分析
              </button>
            </div>
          </section>
        </div>
      </div>

      <AnonymousStoryModal question={result.question} isOpen={isStoryOpen} onClose={() => setIsStoryOpen(false)} />
    </section>
  );
}

function MiniBlock({ title, value }: { title: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-bold text-ink">{title}</p>
      <p className="mt-1 text-sm leading-7 text-ink/70">{value}</p>
    </div>
  );
}
