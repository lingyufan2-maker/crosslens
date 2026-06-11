"use client";

import { useEffect, useRef } from "react";
import { randomBlindboxQuestions } from "@/data/randomBlindboxQuestions";

type FlowQuestion = {
  short_question?: string;
  discussion_value?: number;
  risk_level?: string;
};

type Depth = "far" | "mid" | "near";

type FlowItem = {
  text: string;
  x: number;
  y: number;
  baseY: number;
  speed: number;
  direction: -1 | 1;
  depth: Depth;
  fontSize: number;
  alpha: number;
  color: string;
  blur: number;
  rotate: number;
  floatPhase: number;
  floatAmp: number;
};

const fallbackQuestions = randomBlindboxQuestions.slice(0, 18);

export default function HomeQuestionField({ refreshKey = 0, boostKey = 0 }: { refreshKey?: number; boostKey?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const questionsRef = useRef<string[]>(fallbackQuestions);
  const itemsRef = useRef<FlowItem[]>([]);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1, isMobile: false });
  const boostUntilRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const timeRef = useRef(0);

  useEffect(() => {
    boostUntilRef.current = performance.now() + 520;
  }, [boostKey]);

  useEffect(() => {
    let cancelled = false;
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;

    function handleMotionChange() {
      reducedMotionRef.current = motionQuery.matches;
    }

    function createItems() {
      const { width, height, isMobile } = sizeRef.current;
      if (!width || !height) return;

      const count = isMobile ? 40 : 82;
      const pool = questionsRef.current.length > 0 ? questionsRef.current : fallbackQuestions;

      itemsRef.current = Array.from({ length: count }, (_, index) => {
        const depth = pickDepth();
        const direction: -1 | 1 = index % 2 === 0 ? 1 : -1;
        const metrics = depthMetrics(depth);
        const centerAvoid = Math.random() < 0.34;
        const y = centerAvoid ? edgeWeightedY(height) : Math.random() * height;

        return {
          text: pool[Math.floor(Math.random() * pool.length)],
          x: Math.random() * width,
          y,
          baseY: y,
          speed: randomRange(metrics.speed[0], metrics.speed[1]) * direction,
          direction,
          depth,
          fontSize: randomRange(metrics.fontSize[0], metrics.fontSize[1]) * (isMobile ? 0.86 : 1),
          alpha: randomRange(metrics.opacity[0], metrics.opacity[1]),
          color: metrics.color,
          blur: metrics.blur,
          rotate: randomRange(-4, 4),
          floatPhase: Math.random() * Math.PI * 2,
          floatAmp: randomRange(2, 8)
        };
      });
    }

    async function loadQuestions() {
      try {
        const response = await fetch("/questions.json", { cache: "force-cache" });
        const data = (await response.json()) as FlowQuestion[];
        if (cancelled) return;

        const questions = Array.isArray(data)
          ? data
              .filter(
                (item) =>
                  item.risk_level === "low" &&
                  Number(item.discussion_value) >= 7 &&
                  typeof item.short_question === "string" &&
                  item.short_question.trim()
              )
              .map((item) => item.short_question?.trim())
              .filter((item): item is string => typeof item === "string" && item.length > 0)
              .filter(isReadableQuestion)
          : [];

        questionsRef.current = questions.length > 0 ? questions : fallbackQuestions;
      } catch {
        questionsRef.current = fallbackQuestions;
      }

      createItems();
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

    function draw(now: number) {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;

      const { width, height, dpr } = sizeRef.current;
      const delta = Math.min(32, now - timeRef.current || 16);
      timeRef.current = now;
      const boost = now < boostUntilRef.current ? 3.4 : 1;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.scale(dpr, dpr);
      context.globalCompositeOperation = "source-over";

      for (const item of itemsRef.current) {
        context.save();
        context.font = `${item.fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        const widthText = context.measureText(item.text).width;

        if (!reducedMotionRef.current) {
          item.x += item.speed * boost * (delta / 16);
          item.y = item.baseY + Math.sin(now / 1200 + item.floatPhase) * item.floatAmp;
        }

        if (item.direction === 1 && item.x > width + widthText + 40) item.x = -widthText - 60;
        if (item.direction === -1 && item.x < -widthText - 60) item.x = width + widthText + 40;

        const centerFade = centerDensityFade(item.x, item.y, width, height);
        context.translate(item.x, item.y);
        context.rotate((item.rotate * Math.PI) / 180);
        context.globalAlpha = item.alpha * centerFade;
        context.fillStyle = item.color;
        context.filter = item.blur > 0 ? `blur(${item.blur}px)` : "none";
        context.fillText(item.text, 0, 0);
        context.restore();
      }

      context.restore();
      frameRef.current = window.requestAnimationFrame(draw);
    }

    resize();
    loadQuestions();
    window.addEventListener("resize", resize);
    motionQuery.addEventListener("change", handleMotionChange);
    frameRef.current = window.requestAnimationFrame(draw);

    return () => {
      cancelled = true;
      window.removeEventListener("resize", resize);
      motionQuery.removeEventListener("change", handleMotionChange);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [refreshKey]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden="true" />;
}

function pickDepth(): Depth {
  const roll = Math.random();
  if (roll < 0.42) return "far";
  if (roll < 0.78) return "mid";
  return "near";
}

function depthMetrics(depth: Depth) {
  if (depth === "near") {
    return { fontSize: [20, 28], opacity: [0.48, 0.68], speed: [0.45, 0.75], color: "#435242", blur: 0 };
  }
  if (depth === "mid") {
    return { fontSize: [15, 18], opacity: [0.28, 0.45], speed: [0.25, 0.45], color: "#8b927c", blur: 0 };
  }
  return { fontSize: [12, 14], opacity: [0.14, 0.22], speed: [0.12, 0.25], color: "#d8d0bd", blur: 1 };
}

function centerDensityFade(x: number, y: number, width: number, height: number) {
  const dx = (x - width / 2) / Math.max(1, width * 0.3);
  const dy = (y - height / 2) / Math.max(1, height * 0.28);
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < 0.74 ? 0.28 + distance * 0.64 : 1;
}

function edgeWeightedY(height: number) {
  return Math.random() > 0.5 ? randomRange(24, height * 0.27) : randomRange(height * 0.73, height - 24);
}

function randomRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

function isReadableQuestion(text: string) {
  return !/[�€璋瑙鍔涔锛紵]/.test(text);
}
