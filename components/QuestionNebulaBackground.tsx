"use client";

import { useEffect, useMemo, useState } from "react";

type NebulaQuestion = {
  id: string;
  short_question: string;
  full_question: string;
  lenses: string[];
  entry_type: string;
  discussion_value: number;
  information_gap_value: number;
  risk_level: "low" | "medium";
  quality_reason?: string;
};

type NebulaItem = {
  id: string;
  text: string;
  x: number;
  y: number;
  depth: 1 | 2 | 3 | 4;
  delay: number;
  duration: number;
  direction: "lr" | "rl";
};

export default function QuestionNebulaBackground({ refreshKey = 0 }: { refreshKey?: number }) {
  const [questions, setQuestions] = useState<NebulaQuestion[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestions() {
      try {
        const response = await fetch("/questions.json", { cache: "force-cache" });
        const data = (await response.json()) as NebulaQuestion[];
        if (cancelled) return;

        const filtered = Array.isArray(data)
          ? data.filter(
              (item) =>
                item.risk_level === "low" &&
                Number(item.discussion_value) >= 7 &&
                typeof item.short_question === "string" &&
                item.short_question.trim()
            )
          : [];

        setQuestions(filtered);
      } catch {
        setQuestions([]);
      }
    }

    loadQuestions();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mediaQuery.matches);

    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  const items = useMemo(() => {
    if (questions.length === 0) return [];

    const count = isMobile ? 42 : 100;
    return Array.from({ length: count }, (_, index) => {
      const question = questions[Math.floor(Math.random() * questions.length)];
      const depth = randomDepth();
      const nearFactor = 5 - depth;

      return {
        id: `${question.id}-${refreshKey}-${index}`,
        text: question.short_question,
        x: centerWeightedX(),
        y: centerWeightedY(),
        depth,
        delay: -Math.random() * 80,
        duration: 60 + depth * 28 + Math.random() * 45 - nearFactor * 4,
        direction: Math.random() > 0.5 ? "lr" : "rl"
      };
    });
  }, [questions, refreshKey, isMobile]);

  return (
    <div className="question-nebula" aria-hidden="true">
      {items.map((item) => (
        <span
          key={item.id}
          className={`question-item depth-${item.depth} ${item.direction === "lr" ? "driftLR" : "driftRL"}`}
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            animationDelay: `${item.delay}s`,
            animationDuration: `${item.duration}s`
          }}
        >
          {item.text}
        </span>
      ))}
    </div>
  );
}

function centerWeightedX() {
  const r = (Math.random() + Math.random() + Math.random()) / 3;
  return r * 100;
}

function centerWeightedY() {
  const centerPull = (Math.random() + Math.random()) / 2;
  const softNoise = (Math.random() - 0.5) * 22;
  return Math.max(4, Math.min(96, centerPull * 100 + softNoise));
}

function randomDepth(): 1 | 2 | 3 | 4 {
  const roll = Math.random();
  if (roll < 0.18) return 1;
  if (roll < 0.42) return 2;
  if (roll < 0.72) return 3;
  return 4;
}
