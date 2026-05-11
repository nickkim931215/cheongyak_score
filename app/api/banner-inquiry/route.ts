import { NextRequest, NextResponse } from "next/server";
import {
  emailBannerInquiry,
  logBannerInquiry,
  type BannerInquiry,
  type BannerPeriod,
} from "@/lib/notify";

export const runtime = "nodejs";

interface Body {
  youtubeUrl?: unknown;
  period?: unknown;
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  message?: unknown;
}

function asString(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

function asOptionalString(v: unknown, max = 1000): string | undefined {
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > max) return undefined;
  return trimmed;
}

function asPeriod(v: unknown): BannerPeriod | null {
  if (v === "30" || v === "60" || v === "90") return v;
  return null;
}

function isYoutubeUrl(s: string): boolean {
  try {
    const u = new URL(s);
    const host = u.hostname.replace(/^www\./, "");
    return (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtu.be" ||
      host === "youtube-nocookie.com"
    );
  } catch {
    return false;
  }
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

  const youtubeUrl = asString(body.youtubeUrl, 500);
  const period = asPeriod(body.period);
  const name = asString(body.name, 50);
  const phone = asString(body.phone, 30);
  const email = asOptionalString(body.email, 100);
  const message = asOptionalString(body.message, 1000);

  if (!youtubeUrl || !period || !name || !phone) {
    return NextResponse.json(
      { error: "YouTube 링크, 기간, 이름, 연락처를 모두 입력해주세요." },
      { status: 400 }
    );
  }

  if (!isYoutubeUrl(youtubeUrl)) {
    return NextResponse.json(
      { error: "YouTube 링크 형식이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const inquiry: BannerInquiry = {
    youtubeUrl,
    period,
    name,
    phone,
    email,
    message,
    receivedAt: new Date().toISOString(),
    ip: req.headers.get("x-forwarded-for") ?? undefined,
    userAgent: req.headers.get("user-agent") ?? undefined,
  };

  try {
    await logBannerInquiry(inquiry);
  } catch (err) {
    console.error("[banner-inquiry] log failed:", err);
  }

  let emailResult: Awaited<ReturnType<typeof emailBannerInquiry>> = {
    sent: false,
  };
  try {
    emailResult = await emailBannerInquiry(inquiry);
  } catch (err) {
    console.error("[banner-inquiry] email failed:", err);
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
