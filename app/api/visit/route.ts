import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from 'fs';
import { join } from 'path';

// Helper function to ensure log directory exists
async function ensureLogDirectory(dir: string) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error) {
    // Ignore error if directory already exists
    if ((error as NodeJS.ErrnoException)?.code !== 'EEXIST') {
      throw error;
    }
  }
}

async function logVisit(data: any) {
  const logDir = join(process.cwd(), 'logs');
  await ensureLogDirectory(logDir);
  const logFile = join(logDir, 'visits.jsonl');
  const logEntry = JSON.stringify({
    ...data,
    receivedAt: new Date().toISOString(),
  });
  await fs.appendFile(logFile, logEntry + '\n');
}

export async function POST(req: NextRequest) {
  try {
    const visitData = {
      ip: req.headers.get("x-forwarded-for") ?? undefined,
      userAgent: req.headers.get("user-agent") ?? undefined,
      // You can add more data to track here
    };

    await logVisit(visitData);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[visit] log failed:", err);
    return NextResponse.json(
      { error: "방문 기록을 저장하는데 실패했습니다." },
      { status: 500 }
    );
  }
}
