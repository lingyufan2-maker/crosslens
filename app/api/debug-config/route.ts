import { NextResponse } from "next/server";
import { getDeepSeekTimeout } from "@/lib/deepseek";

export const runtime = "nodejs";

export async function GET() {
  const lifeModel = process.env.DEEPSEEK_LIFE_MODEL || "deepseek-v4-flash";
  const globalModel = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
  const isPro = lifeModel.includes("pro");
  const timeoutMs = getDeepSeekTimeout(lifeModel, "life-lens");

  return NextResponse.json({
    lifeModel,
    globalModel,
    isPro,
    timeoutMs,
    nodeEnv: process.env.NODE_ENV
  });
}
