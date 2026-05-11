"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import {
  calculateTotalScore,
  scoreTier,
  type ScoreBreakdown,
} from "@/lib/calculator";
import {
  diagnoseSpecialSupply,
  type MaritalStatus,
  type SpecialSupplyInput,
  type TrackResult,
} from "@/lib/specialSupply";
import { analyzeRegions, type RegionAdvice } from "@/lib/regional";
import { useSound } from "@/lib/useSound";

type TabKey = "score" | "special" | "region";

export default function Home() {
  const [tab, setTab] = useState<TabKey>("score");
  const sound = useSound();

  const [unhousedYears, setUnhousedYears] = useState(5);
  const [dependents, setDependents] = useState(2);
  const [subscriptionYears, setSubscriptionYears] = useState(7);

  const score: ScoreBreakdown = useMemo(
    () => calculateTotalScore(unhousedYears, dependents, subscriptionYears),
    [unhousedYears, dependents, subscriptionYears]
  );
  const tier = useMemo(() => scoreTier(score.totalScore), [score.totalScore]);

  const [ss, setSs] = useState<SpecialSupplyInput>({
    age: 33,
    maritalStatus: "married",
    marriageYears: 3,
    hasChildren: true,
    childrenCount: 1,
    isFirstTimeBuyer: true,
    monthlyIncomeKRW: 6_500_000,
    totalAssetsKRW: 280_000_000,
    isHouseholdHead: true,
    subscriptionMonths: 60,
  });
  const ssTracks: TrackResult[] = useMemo(
    () => diagnoseSpecialSupply(ss),
    [ss]
  );

  const regionAdvice: RegionAdvice[] = useMemo(
    () => analyzeRegions(score.totalScore),
    [score.totalScore]
  );

  return (
    <main className="relative mx-auto max-w-5xl px-4 py-12 md:py-20">
      <header className="mb-12 animate-fade-up">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-brand-200 backdrop-blur">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-gradient-to-r from-brand-400 to-accent-400 shadow-[0_0_10px_rgba(99,102,241,0.7)]" />
              AI 청약 의사결정 플랫폼
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              <span className="text-gradient">청약전략진단</span>
            </h1>
            <p className="mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-slate-300/80">
              내 조건을 입력하면 청약 가점, 특별공급 자격, 지역별 경쟁력을 한
              번에 진단해드립니다. 결과를 보고 맞춤 청약정보를 받아볼 수 있어요.
            </p>
          </div>
          <SoundToggle
            enabled={sound.enabled}
            onClick={() => sound.toggle()}
          />
        </div>
      </header>

      <nav className="mb-6 flex flex-wrap gap-6 border-b border-white/10">
        <TabBtn
          active={tab === "score"}
          onClick={() => {
            sound.play("tab");
            setTab("score");
          }}
          onHover={() => sound.play("hover")}
        >
          ① 청약 점수
        </TabBtn>
        <TabBtn
          active={tab === "special"}
          onClick={() => {
            sound.play("tab");
            setTab("special");
          }}
          onHover={() => sound.play("hover")}
        >
          ② 특별공급 자격
        </TabBtn>
        <TabBtn
          active={tab === "region"}
          onClick={() => {
            sound.play("tab");
            setTab("region");
          }}
          onHover={() => sound.play("hover")}
        >
          ③ 지역별 경쟁력
        </TabBtn>
      </nav>

      <section
        key={tab}
        className="glass animate-fade-up rounded-2xl p-6 shadow-card md:p-8"
      >
        {tab === "score" && (
          <ScoreSection
            unhousedYears={unhousedYears}
            dependents={dependents}
            subscriptionYears={subscriptionYears}
            score={score}
            tier={tier}
            onUnhousedChange={setUnhousedYears}
            onDependentsChange={setDependents}
            onSubscriptionChange={setSubscriptionYears}
          />
        )}
        {tab === "special" && (
          <SpecialSupplySection
            value={ss}
            onChange={setSs}
            tracks={ssTracks}
          />
        )}
        {tab === "region" && (
          <RegionalSection myScore={score.totalScore} advice={regionAdvice} />
        )}
      </section>

      <LeadForm
        defaultScore={score.totalScore}
        defaultIncome={ss.monthlyIncomeKRW}
        playSound={sound.play}
      />

      <footer className="mt-14 text-center text-xs text-slate-500">
        본 진단은 단순화된 모의 룰셋과 데모 데이터에 기반합니다. 실제 청약 시
        공식 공고와 청약홈을 반드시 확인하세요.
      </footer>
    </main>
  );
}

function SoundToggle({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="btn-ghost shrink-0"
      aria-label={enabled ? "효과음 끄기" : "효과음 켜기"}
      title={enabled ? "효과음 끄기" : "효과음 켜기"}
    >
      {enabled ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
        </svg>
      )}
      <span>{enabled ? "효과음 ON" : "효과음 OFF"}</span>
    </button>
  );
}

function TabBtn({
  active,
  onClick,
  onHover,
  children,
}: {
  active: boolean;
  onClick: () => void;
  onHover?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      data-active={active}
      className="tab"
    >
      {children}
    </button>
  );
}

// Ripple-enabled button wrapper
function RippleButton({
  children,
  className = "",
  onClick,
  playSound,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  playSound?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  const handle = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = ref.current;
      if (btn) {
        const rect = btn.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const span = document.createElement("span");
        span.className = "ripple";
        span.style.width = span.style.height = `${size}px`;
        span.style.left = `${e.clientX - rect.left - size / 2}px`;
        span.style.top = `${e.clientY - rect.top - size / 2}px`;
        btn.appendChild(span);
        setTimeout(() => span.remove(), 600);
      }
      playSound?.();
      onClick?.(e);
    },
    [onClick, playSound]
  );

  return (
    <button
      ref={ref}
      onClick={handle}
      className={`ripple-host ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

// ─────────────────────────────────────────────────────────
// ① 청약 점수
// ─────────────────────────────────────────────────────────
function ScoreSection({
  unhousedYears,
  dependents,
  subscriptionYears,
  score,
  tier,
  onUnhousedChange,
  onDependentsChange,
  onSubscriptionChange,
}: {
  unhousedYears: number;
  dependents: number;
  subscriptionYears: number;
  score: ScoreBreakdown;
  tier: { label: string; color: string; hint: string };
  onUnhousedChange: (v: number) => void;
  onDependentsChange: (v: number) => void;
  onSubscriptionChange: (v: number) => void;
}) {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-6">
        <h2 className="text-base font-semibold text-white/90">조건 입력</h2>

        <NumberSlider
          label="무주택 기간"
          unit="년"
          min={0}
          max={20}
          step={1}
          value={unhousedYears}
          onChange={onUnhousedChange}
          help="만 30세 이후 또는 혼인 시점부터 계산 · 최대 32점"
        />
        <NumberSlider
          label="부양가족 수"
          unit="명"
          min={0}
          max={8}
          step={1}
          value={dependents}
          onChange={onDependentsChange}
          help="배우자·직계존비속 포함 · 최대 35점"
        />
        <NumberSlider
          label="청약통장 가입기간"
          unit="년"
          min={0}
          max={20}
          step={1}
          value={subscriptionYears}
          onChange={onSubscriptionChange}
          help="가입일 기준 만년수 · 최대 17점"
        />
      </div>

      <div>
        <h2 className="text-base font-semibold text-white/90">진단 결과</h2>
        <div className="mt-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-6">
          <div className="flex items-baseline gap-3">
            <span className="shimmer-text text-6xl font-bold tabular-nums">
              {score.totalScore}
            </span>
            <span className="text-slate-400">/ 84점</span>
          </div>
          <p className={`mt-2 text-sm font-semibold ${mapTierColor(tier.color)}`}>
            {tier.label}
          </p>
          <p className="mt-2 text-sm text-slate-400">{tier.hint}</p>

          <dl className="mt-6 space-y-3 border-t border-white/10 pt-5 text-sm">
            <ScoreRow label="무주택 기간" value={score.unhousedScore} max={32} />
            <ScoreRow
              label="부양가족 수"
              value={score.dependentsScore}
              max={35}
            />
            <ScoreRow
              label="청약통장 가입기간"
              value={score.subscriptionScore}
              max={17}
            />
          </dl>
        </div>
      </div>
    </div>
  );
}

function mapTierColor(c: string) {
  if (c.includes("emerald")) return "text-emerald-400";
  if (c.includes("amber") || c.includes("yellow")) return "text-amber-300";
  if (c.includes("rose") || c.includes("red")) return "text-rose-400";
  if (c.includes("blue") || c.includes("brand")) return "text-brand-300";
  return "text-slate-200";
}

function ScoreRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between">
        <dt className="text-slate-300">{label}</dt>
        <dd className="font-medium tabular-nums text-white">
          {value}{" "}
          <span className="text-slate-500">/ {max}점</span>
        </dd>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-400 transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function NumberSlider({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
  help,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
  help?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const sliderStyle = { ["--val" as string]: `${pct}%` } as CSSProperties;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <span className="text-sm font-semibold tabular-nums text-white">
          {value}
          <span className="ml-1 text-xs text-slate-400">{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={sliderStyle}
        className="mt-3 w-full"
      />
      {help && <p className="mt-2 text-xs text-slate-500">{help}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ② 특별공급 자격
// ─────────────────────────────────────────────────────────
function SpecialSupplySection({
  value,
  onChange,
  tracks,
}: {
  value: SpecialSupplyInput;
  onChange: (v: SpecialSupplyInput) => void;
  tracks: TrackResult[];
}) {
  function patch<K extends keyof SpecialSupplyInput>(
    key: K,
    v: SpecialSupplyInput[K]
  ) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-white/90">조건 입력</h2>

        <Field label="만 나이">
          <input
            type="number"
            value={value.age}
            onChange={(e) => patch("age", Number(e.target.value))}
            className="input"
          />
        </Field>

        <Field label="혼인 상태">
          <select
            value={value.maritalStatus}
            onChange={(e) =>
              patch("maritalStatus", e.target.value as MaritalStatus)
            }
            className="input"
          >
            <option value="single">미혼</option>
            <option value="married">기혼 (자녀 없음)</option>
            <option value="married_with_kids">기혼 (자녀 있음)</option>
          </select>
        </Field>

        <Field label="혼인 경과 (년)">
          <input
            type="number"
            value={value.marriageYears}
            onChange={(e) => patch("marriageYears", Number(e.target.value))}
            className="input"
          />
        </Field>

        <Field label="자녀 수">
          <input
            type="number"
            value={value.childrenCount}
            onChange={(e) => patch("childrenCount", Number(e.target.value))}
            className="input"
          />
        </Field>

        <Field label="월 소득 (원)">
          <input
            type="number"
            value={value.monthlyIncomeKRW}
            onChange={(e) =>
              patch("monthlyIncomeKRW", Number(e.target.value))
            }
            className="input"
          />
        </Field>

        <Field label="총 자산 (원)">
          <input
            type="number"
            value={value.totalAssetsKRW}
            onChange={(e) => patch("totalAssetsKRW", Number(e.target.value))}
            className="input"
          />
        </Field>

        <Field label="청약통장 가입 (개월)">
          <input
            type="number"
            value={value.subscriptionMonths}
            onChange={(e) =>
              patch("subscriptionMonths", Number(e.target.value))
            }
            className="input"
          />
        </Field>

        <div className="flex flex-wrap gap-4 pt-1">
          <Checkbox
            checked={value.isFirstTimeBuyer}
            onChange={(c) => patch("isFirstTimeBuyer", c)}
          >
            생애최초 주택 구입
          </Checkbox>
          <Checkbox
            checked={value.isHouseholdHead}
            onChange={(c) => patch("isHouseholdHead", c)}
          >
            세대주
          </Checkbox>
        </div>
      </div>

      <div>
        <h2 className="text-base font-semibold text-white/90">트랙별 자격</h2>
        <ul className="mt-4 space-y-3">
          {tracks.map((t) => (
            <li
              key={t.track}
              className={`rounded-xl border p-4 transition ${
                t.eligible
                  ? "border-emerald-400/30 bg-emerald-400/[0.06]"
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{t.track}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    t.eligible
                      ? "bg-emerald-500/90 text-white shadow-[0_0_14px_rgba(16,185,129,0.45)]"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {t.eligible ? "자격 있음" : "자격 미달"}
                </span>
              </div>
              {t.eligible && t.highlights.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-xs text-emerald-300/90">
                  {t.highlights.map((h) => (
                    <li key={h}>· {h}</li>
                  ))}
                </ul>
              )}
              {!t.eligible && (
                <ul className="mt-2 space-y-0.5 text-xs text-slate-400">
                  {t.reasons.map((r) => (
                    <li key={r}>· {r}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function Checkbox({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (c: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300 hover:text-white transition">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 rounded border-white/20 bg-white/5"
      />
      {children}
    </label>
  );
}

// ─────────────────────────────────────────────────────────
// ③ 지역별 경쟁력
// ─────────────────────────────────────────────────────────
function RegionalSection({
  myScore,
  advice,
}: {
  myScore: number;
  advice: RegionAdvice[];
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-white/90">
          내 점수 기준 지역 적합도
        </h2>
        <span className="text-sm text-slate-400">
          현재 점수:{" "}
          <strong className="text-white tabular-nums">{myScore}점</strong>
        </span>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="tbl">
          <thead>
            <tr>
              <th>지역</th>
              <th>평균 당첨선</th>
              <th>경쟁률</th>
              <th>추첨 비중</th>
              <th>진단</th>
            </tr>
          </thead>
          <tbody>
            {advice.map((a) => (
              <tr key={a.region.code}>
                <td className="font-medium text-white">{a.region.name}</td>
                <td className="tabular-nums">{a.region.avgWinningScore}점</td>
                <td className="tabular-nums">
                  {a.region.avgCompetition.toFixed(1)} : 1
                </td>
                <td className="tabular-nums">
                  {Math.round(a.region.lotteryRatio * 100)}%
                </td>
                <td>
                  <VerdictBadge verdict={a.verdict} />
                  <p className="mt-1 text-xs text-slate-500">{a.message}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: RegionAdvice["verdict"] }) {
  const styles: Record<RegionAdvice["verdict"], string> = {
    strong:
      "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30",
    ok: "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30",
    weak: "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/30",
  };
  const labels: Record<RegionAdvice["verdict"], string> = {
    strong: "유리",
    ok: "도전권",
    weak: "불리",
  };
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${styles[verdict]}`}
    >
      {labels[verdict]}
    </span>
  );
}

// ─────────────────────────────────────────────────────────
// 맞춤 청약정보 받아보기 (리드 폼)
// ─────────────────────────────────────────────────────────
function LeadForm({
  defaultScore,
  defaultIncome,
  playSound,
}: {
  defaultScore: number;
  defaultIncome: number;
  playSound: (kind: "click" | "tab" | "toggle" | "success" | "hover") => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [income, setIncome] = useState<number>(defaultIncome);
  const [score, setScore] = useState<number>(defaultScore);
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "ok" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  useEffect(() => {
    if (status.kind === "ok") playSound("success");
  }, [status.kind, playSound]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!agree) {
      setStatus({
        kind: "error",
        message: "개인정보 수집 동의가 필요합니다.",
      });
      return;
    }
    if (!name || !phone) {
      setStatus({ kind: "error", message: "이름과 연락처를 입력해주세요." });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, phone, income, score }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "전송 실패");
      }
      setStatus({ kind: "ok" });
    } catch (err) {
      setStatus({
        kind: "error",
        message: err instanceof Error ? err.message : "전송 실패",
      });
    }
  }

  if (status.kind === "ok") {
    return (
      <section className="mt-12 animate-fade-up overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-8 text-center backdrop-blur">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-300">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="mt-4 text-lg font-semibold text-white">
          접수 완료되었습니다
        </h2>
        <p className="mt-2 text-sm text-emerald-200/80">
          입력하신 정보를 바탕으로 맞춤 청약정보를 정리해 곧 연락드릴게요.
        </p>
      </section>
    );
  }

  return (
    <section className="glass mt-12 rounded-2xl p-6 shadow-card md:p-8">
      <h2 className="text-lg font-semibold text-white">
        맞춤 청약정보 받아보기
      </h2>
      <p className="mt-1 text-sm text-slate-400">
        진단 결과에 맞는 분양 단지·일정을 정리해서 보내드립니다. 입력은 모두
        선택사항이며, 마케팅 목적 외에는 사용하지 않습니다.
      </p>

      <form onSubmit={submit} className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="이름">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="홍길동"
          />
        </Field>
        <Field label="핸드폰 번호">
          <input
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="010-0000-0000"
          />
        </Field>
        <Field label="월 소득 (원)">
          <input
            className="input"
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
          />
        </Field>
        <Field label="청약 점수">
          <input
            className="input"
            type="number"
            value={score}
            onChange={(e) => setScore(Number(e.target.value))}
          />
        </Field>

        <div className="md:col-span-2">
          <Checkbox checked={agree} onChange={setAgree}>
            개인정보 수집·이용에 동의합니다 (이름, 연락처, 소득, 점수)
          </Checkbox>
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <RippleButton
            type="submit"
            disabled={status.kind === "loading"}
            playSound={() => playSound("click")}
            className="btn-primary"
          >
            {status.kind === "loading" ? "전송 중..." : "제출하기"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </RippleButton>
          {status.kind === "error" && (
            <span className="text-sm text-rose-300">{status.message}</span>
          )}
        </div>
      </form>
    </section>
  );
}
