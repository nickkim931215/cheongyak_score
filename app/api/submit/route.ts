import { NextRequest, NextResponse } from "next/server";
import {
  emailSubmission,
  logSubmission,
  type Submission,
} from "@/lib/notify";

export const runtime = "nodejs";

interface Body {
  name?: unknown;
  phone?: unknown;
  income?: unknown;
  score?: unknown;
}

function asString(v: unknown, max = 200): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function asNumber(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  if (n < min || n > max) return null;
  return n;
}

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { error: "잘못된 요청 형식입니다." },
      { status: 400 }
    );
  }

  const name = asString(body.name, 50);
  const phone = asString(body.phone, 30);
  const income = asNumber(body.income, 0, 1_000_000_000);
  const score = asNumber(body.score, 0, 84);

  if (!name || !phone || income === null || score === null) {
    return NextResponse.json(
      { error: "입력값을 확인해주세요." },
      { status: 400 }
    );
  }

  const submission: Submission = {
    name,
    phone,
    income,
    score,
    receivedAt: new Date().toISOString(),
    ip: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  };

  // 항상 로컬 JSONL에 백업
  try {
    await logSubmission(submission);
  } catch (err) {
    console.error("[submit] log failed:", err);
  }

  // 이메일은 환경변수가 있을 때만
  let emailResult: Awaited<ReturnType<typeof emailSubmission>> = {
    sent: false,
  };
  try {
    emailResult = await emailSubmission(submission);
  } catch (err) {
    console.error("[submit] email failed:", err);
    emailResult = {
      sent: false,
      reason: err instanceof Error ? err.message : "이메일 전송 오류",
    };
  }

  return NextResponse.json({
    ok: true,
    emailSent: emailResult.sent,
    note: emailResult.reason,
  });
}
