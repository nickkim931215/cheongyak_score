import { promises as fs } from "node:fs";
import path from "node:path";

export interface Submission {
  name: string;
  phone: string;
  income: number;
  score: number;
  receivedAt: string; // ISO string
  ip?: string;
  userAgent?: string;
}

const LOG_PATH = path.join(process.cwd(), "data", "submissions.jsonl");

export async function logSubmission(s: Submission): Promise<void> {
  await fs.mkdir(path.dirname(LOG_PATH), { recursive: true });
  await fs.appendFile(LOG_PATH, JSON.stringify(s) + "\n", "utf8");
}

export async function emailSubmission(s: Submission): Promise<{
  sent: boolean;
  reason?: string;
}> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  const to = process.env.NOTIFY_EMAIL ?? "nickkim931215@gmail.com";

  if (!user || !pass) {
    return {
      sent: false,
      reason:
        "GMAIL_USER / GMAIL_APP_PASSWORD 미설정 — 로컬 로그에만 저장됨",
    };
  }

  // Lazy import so the module doesn't break in environments where
  // nodemailer isn't installed yet (tests, build).
  const nodemailer = (await import("nodemailer")).default;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const subject = `[청약전략진단] 신규 리드 — ${s.name} (${s.score}점)`;
  const text = [
    `이름: ${s.name}`,
    `연락처: ${s.phone}`,
    `월 소득: ${s.income.toLocaleString("ko-KR")}원`,
    `청약 점수: ${s.score}점`,
    `접수 시각: ${s.receivedAt}`,
    s.ip ? `IP: ${s.ip}` : null,
    s.userAgent ? `UA: ${s.userAgent}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    from: `"청약전략진단" <${user}>`,
    to,
    subject,
    text,
  });

  return { sent: true };
}

// ──────────────────────────────────────────────────────────────
// 배너 광고 문의
// ──────────────────────────────────────────────────────────────

export type BannerPeriod = "30" | "60" | "90";

export interface BannerInquiry {
  youtubeUrl: string;
  period: BannerPeriod;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  receivedAt: string;
  ip?: string;
  userAgent?: string;
}

const BANNER_LOG_PATH = path.join(
  process.cwd(),
  "data",
  "banner-inquiries.jsonl"
);

const BANNER_PRICE: Record<BannerPeriod, string> = {
  "30": "30일 / 10만원",
  "60": "60일 / 18만원",
  "90": "90일 / 25만원",
};

export async function logBannerInquiry(b: BannerInquiry): Promise<void> {
  await fs.mkdir(path.dirname(BANNER_LOG_PATH), { recursive: true });
  await fs.appendFile(BANNER_LOG_PATH, JSON.stringify(b) + "\n", "utf8");
}

export async function emailBannerInquiry(b: BannerInquiry): Promise<{
  sent: boolean;
  reason?: string;
}> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  // 배너 문의는 항상 nickkim931215@gmail.com 으로 전송
  const to = "nickkim931215@gmail.com";

  if (!user || !pass) {
    return {
      sent: false,
      reason:
        "GMAIL_USER / GMAIL_APP_PASSWORD 미설정 — 로컬 로그에만 저장됨",
    };
  }

  const nodemailer = (await import("nodemailer")).default;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const subject = `[청약전략진단·배너문의] ${b.name} — ${BANNER_PRICE[b.period]}`;
  const text = [
    `이름: ${b.name}`,
    `연락처: ${b.phone}`,
    b.email ? `이메일: ${b.email}` : null,
    `YouTube 링크: ${b.youtubeUrl}`,
    `기간/금액: ${BANNER_PRICE[b.period]}`,
    b.message ? `메모: ${b.message}` : null,
    `접수 시각: ${b.receivedAt}`,
    b.ip ? `IP: ${b.ip}` : null,
    b.userAgent ? `UA: ${b.userAgent}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  await transporter.sendMail({
    from: `"청약전략진단·배너문의" <${user}>`,
    to,
    subject,
    text,
    replyTo: b.email ?? undefined,
  });

  return { sent: true };
}
