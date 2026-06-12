"use client";

import { useEffect, useRef } from "react";
import { randomBlindboxQuestions } from "@/data/randomBlindboxQuestions";

type Depth = "far" | "mid" | "near";

type FlowItem = {
  text: string;
  x: number;
  y: number;
  baseY: number;
  speed: number;
  direction: -1 | 1;
  fontSize: number;
  alpha: number;
  color: string;
  rotate: number;
  floatPhase: number;
  floatAmp: number;
};

const fallbackQuestions = randomBlindboxQuestions.slice(0, 28);
const FRAME_INTERVAL = 1000 / 30;

export default function HomeQuestionField({ refreshKey = 0, boostKey = 0 }: { refreshKey?: number; boostKey?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const itemsRef = useRef<FlowItem[]>([]);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1, isMobile: false });
  const boostUntilRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const timeRef = useRef(0);
  const lastDrawRef = useRef(0);

  useEffect(() => {
    boostUntilRef.current = performance.now() + 420;
  }, [boostKey]);

  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = motionQuery.matches;

    function createItems() {
      const { width, height, isMobile } = sizeRef.current;
      if (!width || !height) return;

      const count = isMobile ? 16 : 28;

      itemsRef.current = Array.from({ length: count }, (_, index) => {
        const depth = pickDepth();
        const direction: -1 | 1 = index % 2 === 0 ? 1 : -1;
        const metrics = depthMetrics(depth);
        const avoidCenter = Math.random() < 0.55;
        const y = avoidCenter ? edgeWeightedY(height) : randomRange(height * 0.12, height * 0.88);

        return {
          text: fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)],
          x: Math.random() * width,
          y,
          baseY: y,
          speed: randomRange(metrics.speed[0], metrics.speed[1]) * direction,
          direction,
          fontSize: randomRange(metrics.fontSize[0], metrics.fontSize[1]) * (isMobile ? 0.84 : 1),
          alpha: randomRange(metrics.opacity[0], metrics.opacity[1]),
          color: metrics.color,
          rotate: randomRange(-3, 3),
          floatPhase: Math.random() * Math.PI * 2,
          floatAmp: randomRange(1.5, 5)
        };
      });
    }

    function draw(now: number) {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;

      if (!reducedMotionRef.current && now - lastDrawRef.current < FRAME_INTERVAL) {
        frameRef.current = window.requestAnimationFrame(draw);
        return;
      }

      lastDrawRef.current = now;

      const { width, height, dpr } = sizeRef.current;
      const delta = Math.min(34, now - timeRef.current || FRAME_INTERVAL);
      timeRef.current = now;
      const boost = now < boostUntilRef.current ? 2.4 : 1;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.scale(dpr, dpr);

      for (const item of itemsRef.current) {
        context.save();
        context.font = `${item.fontSize}px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
        const widthText = context.measureText(item.text).width;

        if (!reducedMotionRef.current) {
          item.x += item.speed * boost * (delta / 16);
          item.y = item.baseY + Math.sin(now / 1400 + item.floatPhase) * item.floatAmp;
        }

        if (item.direction === 1 && item.x > width + widthText + 40) item.x = -widthText - 60;
        if (item.direction === -1 && item.x < -widthText - 60) item.x = width + widthText + 40;

        context.translate(item.x, item.y);
        context.rotate((item.rotate * Math.PI) / 180);
        context.globalAlpha = item.alpha * centerFade(item.x, item.y, width, height);
        context.fillStyle = item.color;
        context.fillText(item.text, 0, 0);
        context.restore();
      }

      context.restore();

      if (!reducedMotionRef.current) {
        frameRef.current = window.requestAnimationFrame(draw);
      }
    }

    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      sizeRef.current = { width, height, dpr, isMobile: width < 640 };
      createItems();
      draw(performance.now());
    }

    function handleMotionChange() {
      reducedMotionRef.current = motionQuery.matches;
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
      draw(performance.now());
    }

    resize();
    window.addEventListener("resize", resize);
    motionQuery.addEventListener("change", handleMotionChange);

    return () => {
      window.removeEventListener("resize", resize);
      motionQuery.removeEventListener("change", handleMotionChange);
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, [refreshKey]);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-0 h-full w-full" aria-hidden="true" />;
}

function pickDepth(): Depth {
  const roll = Math.random();
  if (roll < 0.48) return "far";
  if (roll < 0.82) return "mid";
  return "near";
}

function depthMetrics(depth: Depth) {
  if (depth === "near") {
    return { fontSize: [20, 26], opacity: [0.2, 0.34], speed: [0.34, 0.54], color: "#435242" };
  }
  if (depth === "mid") {
    return { fontSize: [15, 18], opacity: [0.13, 0.22], speed: [0.18, 0.32], color: "#8b927c" };
  }
  return { fontSize: [12, 14], opacity: [0.07, 0.12], speed: [0.08, 0.18], color: "#cfc6b3" };
}

function centerFade(x: number, y: number, width: number, height: number) {
  const dx = (x - width * 0.72) / Math.max(1, width * 0.28);
  const dy = (y - height * 0.5) / Math.max(1, height * 0.32);
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < 0.9 ? 0.18 + distance * 0.52 : 1;
}

function edgeWeightedY(height: number) {
  return Math.random() > 0.5 ? randomRange(26, height * 0.24) : randomRange(height * 0.76, height - 26);
}

function randomRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}
