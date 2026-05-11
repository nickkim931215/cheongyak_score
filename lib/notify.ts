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
