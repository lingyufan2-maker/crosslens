"use client";

import { useEffect, useRef } from "react";

type FlowQuestion = {
  short_question?: string;
  discussion_value?: number;
  risk_level?: string;
};

type FlowItem = {
  text: string;
  x: number;
  y: number;
  speed: number;
  direction: -1 | 1;
  depth: 1 | 2 | 3 | 4;
  fontSize: number;
  alpha: number;
  color: string;
};

const fallbackQuestions = [
  "谁更早知道入口？",
  "规则藏在哪里？",
  "努力为何不等价？",
  "城市给谁机会？",
  "什么才算作品？",
  "人脉如何出现？",
  "平台在奖励谁？",
  "转行从哪开始？",
  "身份如何被看见？",
  "哪种经验能迁移？",
  "信息差怎么补？",
  "选择为何变窄？"
];

const colors = {
  1: "42, 74, 49",
  2: "64, 102, 73",
  3: "88, 126, 93",
  4: "112, 146, 116"
} satisfies Record<FlowItem["depth"], string>;

export default function HomeQuestionFlowBackground({ refreshKey = 0 }: { refreshKey?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const questionsRef = useRef<string[]>(fallbackQuestions);
  const itemsRef = useRef<FlowItem[]>([]);
  const frameRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1, isMobile: false });

  useEffect(() => {
    let cancelled = false;

    function createItems() {
      const { width, height, isMobile } = sizeRef.current;
      if (!width || !height) return;

      const count = isMobile ? 44 : 96;
      const pool = questionsRef.current.length > 0 ? questionsRef.current : fallbackQuestions;

      itemsRef.current = Array.from({ length: count }, (_, index) => {
        const depth = randomDepth();
        const direction: -1 | 1 = index % 2 === 0 ? 1 : -1;
        const fontSize = (isMobile ? 11 : 13) + (4 - depth) * 1.7 + Math.random() * 1.8;
        const baseSpeed = isMobile ? 0.12 : 0.18;
        const speed = (baseSpeed + (4 - depth) * 0.035 + Math.random() * 0.045) * direction;

        return {
          text: pool[Math.floor(Math.random() * pool.length)],
          x: direction === 1 ? Math.random() * width : width - Math.random() * width,
          y: centerWeightedY(height),
          speed,
          direction,
          depth,
          fontSize,
          alpha: ({ 1: 0.48, 2: 0.34, 3: 0.22, 4: 0.15 } as Record<FlowItem["depth"], number>)[depth],
          color: colors[depth]
        };
      });
    }

    async function loadQuestions() {
      try {
        const response = await fetch("/questions.json", { cache: "force-cache" });
        const data = (await response.json()) as FlowQuestion[];
        if (cancelled) return;

        const filtered = Array.isArray(data)
          ? data
              .filter(
                (item) =>
                  item.risk_level === "low" &&
                  Number(item.discussion_value) >= 7 &&
                  typeof item.short_question === "string" &&
                  item.short_question.trim().length > 0
              )
              .map((item) => item.short_question?.trim())
              .filter((item): item is string => typeof item === "string" && item.length > 0)
              .filter(isReadableQuestion)
          : [];

        questionsRef.current = filtered.length > 0 ? filtered : fallbackQuestions;
        createItems();
      } catch {
        questionsRef.current = fallbackQuestions;
        createItems();
      }
    }

    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      sizeRef.current = { width, height, dpr, isMobile: width < 640 };
      createItems();
    }

    function draw() {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;

      const { width, height, dpr } = sizeRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.scale(dpr, dpr);
      drawGrid(context, width, height);

      for (const item of itemsRef.current) {
        context.font = `${item.fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        const metrics = context.measureText(item.text);
        item.x += item.speed;

        if (item.direction === 1 && item.x > width + metrics.width + 40) {
          item.x = -metrics.width - Math.random() * 120;
          item.y = centerWeightedY(height);
        }

        if (item.direction === -1 && item.x < -metrics.width - 40) {
          item.x = width + Math.random() * 120;
          item.y = centerWeightedY(height);
        }

        context.fillStyle = `rgba(${item.color}, ${item.alpha})`;
        context.fillText(item.text, item.x, item.y);
      }

      context.restore();
      frameRef.current = window.requestAnimationFrame(draw);
    }

    resize();
    loadQuestions();
    window.addEventListener("resize", resize);
    frameRef.current = window.requestAnimationFrame(draw);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [refreshKey]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden="true" />;
}

function centerWeightedY(height: number) {
  const r = (Math.random() + Math.random() + Math.random()) / 3;
  const middleBias = height * 0.16;
  const y = r * height * 0.84 + height * 0.08 + (Math.random() - 0.5) * middleBias;
  return Math.max(24, Math.min(height - 24, y));
}

function randomDepth(): 1 | 2 | 3 | 4 {
  const roll = Math.random();
  if (roll < 0.18) return 1;
  if (roll < 0.44) return 2;
  if (roll < 0.74) return 3;
  return 4;
}

function drawGrid(context: CanvasRenderingContext2D, width: number, height: number) {
  const grid = 32;
  context.strokeStyle = "rgba(32, 37, 29, 0.035)";
  context.lineWidth = 1;

  for (let x = 0; x <= width; x += grid) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }

  for (let y = 0; y <= height; y += grid) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }
}

function isReadableQuestion(text: string) {
  return !/[�€璋瑙鍔涔锛紵]/.test(text);
}
