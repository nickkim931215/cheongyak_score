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
import { useBackgroundMusic } from "@/lib/useBackgroundMusic";

type TabKey = "score" | "special" | "region";

export default function Home() {
  useEffect(() => {
    // Send a POST request to the visit API endpoint to log the visit.
    fetch('/api/visit', { method: 'POST' })
      .catch(console.error); // Log any errors to the console
  }, []); // The empty dependency array ensures this effect runs only once on mount.

  const [tab, setTab] = useState<TabKey>("score");
  const sound = useSound();
  const bgm = useBackgroundMusic();

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
    <main className="relative mx-auto max-w-5xl px-4 py-8 md:py-20">
      <header className="mb-8 animate-fade-up md:mb-12">
        <div className="flex flex-col-reverse gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium tracking-wide text-brand-200 backdrop-blur md:text-xs">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-gradient-to-r from-brand-400 to-accent-400 shadow-[0_0_10px_rgba(99,102,241,0.7)]" />
              AI 청약 의사결정 플랫폼
            </span>
            <h1 className="mt-3 text-[2rem] font-bold leading-[1.15] tracking-tight md:mt-4 md:text-5xl">
              <span className="text-gradient">청약전략진단</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300/80 md:mt-4 md:text-[0.95rem]">
              내 조건을 입력하면 청약 가점, 특별공급 자격, 지역별 경쟁력을 한
              번에 진단해드립니다. 결과를 보고 맞춤 청약정보를 받아볼 수 있어요.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 self-end md:self-auto">
            <BgmToggle
              enabled={bgm.enabled}
              onClick={() => {
                sound.play("click");
                bgm.toggle();
              }}
            />
            <SoundToggle
              enabled={sound.enabled}
              onClick={() => sound.toggle()}
            />
          </div>
        </div>
      </header>

      <nav className="mb-6 flex flex-wrap gap-x-4 gap-y-1 border-b border-white/10 md:gap-x-6">
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
        className="glass animate-fade-up rounded-2xl p-5 shadow-card md:p-8"
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

      <BannerSection playSound={sound.play} />

      <footer className="mt-10 text-center text-[11px] leading-relaxed text-slate-500 md:mt-14 md:text-xs">
        본 진단은 단순화된 모의 룰셋과 데모 데이터에 기반합니다.
        <br className="sm:hidden" />
        <span className="hidden sm:inline"> </span>
        실제 청약 시 공식 공고와 청약홈을 반드시 확인하세요.
      </footer>
    </main>
  );
}

function BgmToggle({
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
      aria-label={enabled ? "배경음악 끄기" : "배경음악 켜기"}
      title={enabled ? "배경음악 끄기 (클래식)" : "배경음악 켜기 (클래식)"}
    >
      {enabled ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-pulse-soft"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
          <line x1="3" y1="3" x2="21" y2="21" />
        </svg>
      )}
      <span className="hidden sm:inline">{enabled ? "BGM ON" : "BGM OFF"}</span>
    </button>
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
      <span className="hidden sm:inline">{enabled ? "효과음 ON" : "효과음 OFF"}</span>
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
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
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
            <span className="shimmer-text text-5xl font-bold tabular-nums md:text-6xl">
              {score.totalScore}
            </span>
            <span className="text-sm text-slate-400 md:text-base">/ 84점</span>
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
    <div className="grid gap-6 md:grid-cols-2 md:gap-8">
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

      <div className="mt-4 -mx-5 overflow-x-auto md:mx-0 md:rounded-xl md:border md:border-white/10">
        <table className="tbl min-w-[600px]">
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
    <section className="glass mt-10 rounded-2xl p-5 shadow-card md:mt-12 md:p-8">
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

        <div className="md:col-span-2 flex flex-wrap items-center gap-3">
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

// ─────────────────────────────────────────────────────────
// 부동산 YouTube 배너 (광고 슬롯 3개 + 문의 폼)
// ─────────────────────────────────────────────────────────

type BannerSlot = {
  id: 1 | 2 | 3;
  youtubeUrl?: string;
  title?: string;
  caption?: string;
};

// YouTube 링크를 채워두면 자동으로 썸네일·제목이 노출됩니다.
// 비워두면 "광고 모집중" 플레이스홀더로 표시됩니다.
const BANNER_SLOTS: BannerSlot[] = [
  {
    id: 1,
    youtubeUrl: "https://www.youtube.com/shorts/DZh4xdk2Eew",
    title: "부동산 추천 영상",
    caption: "Shorts",
  },
  { id: 2 },
  { id: 3 },
];

function extractYoutubeId(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") return u.pathname.slice(1) || null;
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(embed|shorts|live)\/([^/?#]+)/);
      if (m) return m[2];
    }
  } catch {
    return null;
  }
  return null;
}

function BannerSection({
  playSound,
}: {
  playSound: (
    kind: "click" | "tab" | "toggle" | "success" | "hover"
  ) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-10 md:mt-14">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold text-white/90 md:text-lg">
            추천 부동산 채널
          </h2>
          <p className="mt-1 text-xs text-slate-400 md:text-sm">
            청약·분양·시세 등 실전 정보가 담긴 영상 모음입니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            playSound("click");
            setOpen(true);
          }}
          onMouseEnter={() => playSound("hover")}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-slate-200 backdrop-blur transition hover:border-brand-400/50 hover:bg-white/10 hover:text-white md:text-xs"
        >
          광고 문의하기
          <span className="ml-1.5 text-slate-400">→</span>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-5 md:grid-cols-3 md:gap-4">
        {BANNER_SLOTS.map((slot) => (
          <BannerCard
            key={slot.id}
            slot={slot}
            onInquire={() => {
              playSound("click");
              setOpen(true);
            }}
            playHover={() => playSound("hover")}
          />
        ))}
      </div>

      {open && (
        <BannerInquiryModal
          onClose={() => setOpen(false)}
          playSound={playSound}
        />
      )}
    </section>
  );
}

function BannerCard({
  slot,
  onInquire,
  playHover,
}: {
  slot: BannerSlot;
  onInquire: () => void;
  playHover: () => void;
}) {
  const ytId = slot.youtubeUrl ? extractYoutubeId(slot.youtubeUrl) : null;

  if (ytId && slot.youtubeUrl) {
    return (
      <a
        href={slot.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={playHover}
        className="group glass relative block overflow-hidden rounded-xl shadow-card transition hover:border-brand-400/40"
      >
        <div className="relative aspect-video overflow-hidden bg-black/40">
          <img
            src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
            alt={slot.title ?? "YouTube 영상"}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600/90 shadow-[0_8px_30px_rgba(244,63,94,0.45)] ring-1 ring-white/30 transition group-hover:scale-110">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="white"
                aria-hidden
              >
                <polygon points="6,4 20,12 6,20" />
              </svg>
            </span>
          </div>
          <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/80 backdrop-blur">
            AD · #{slot.id}
          </span>
        </div>
        <div className="p-3 md:p-4">
          <p className="line-clamp-2 text-sm font-medium text-white md:text-[0.95rem]">
            {slot.title ?? "추천 영상"}
          </p>
          {slot.caption && (
            <p className="mt-1 text-xs text-slate-400">{slot.caption}</p>
          )}
        </div>
      </a>
    );
  }

  // 빈 슬롯 — 광고 모집중
  return (
    <button
      type="button"
      onClick={onInquire}
      onMouseEnter={playHover}
      className="glass group relative flex aspect-video flex-col items-center justify-center overflow-hidden rounded-xl border-dashed text-center transition hover:border-brand-400/50 hover:bg-white/[0.04] sm:aspect-auto sm:min-h-[180px]"
    >
      <span className="absolute left-2 top-2 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        AD · #{slot.id}
      </span>
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10 transition group-hover:bg-brand-500/15 group-hover:ring-brand-400/30">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-300 group-hover:text-brand-200"
        >
          <polygon points="23 7 16 12 23 17 23 7" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      </span>
      <p className="mt-2.5 text-sm font-semibold text-white/90">
        광고 자리 모집중
      </p>
      <p className="mt-0.5 text-xs text-slate-400">
        부동산 채널 영상 노출 · 월 임대
      </p>
      <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-brand-200">
        문의하기 →
      </span>
    </button>
  );
}

const PERIOD_OPTIONS = [
  { key: "30" as const, label: "30일", price: "10만원" },
  { key: "60" as const, label: "60일", price: "18만원" },
  { key: "90" as const, label: "90일", price: "25만원" },
];

function BannerInquiryModal({
  onClose,
  playSound,
}: {
  onClose: () => void;
  playSound: (
    kind: "click" | "tab" | "toggle" | "success" | "hover"
  ) => void;
}) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [period, setPeriod] = useState<"30" | "60" | "90">("30");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [agree, setAgree] = useState(false);
  const [status, setStatus] = useState<
    | { kind: "idle" }
    | { kind: "loading" }
    | { kind: "ok" }
    | { kind: "error"; message: string }
  >({ kind: "idle" });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (status.kind === "ok") playSound("success");
  }, [status.kind, playSound]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      setStatus({ kind: "error", message: "YouTube 영상 링크를 입력해주세요." });
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setStatus({ kind: "error", message: "이름과 연락처를 입력해주세요." });
      return;
    }
    if (!agree) {
      setStatus({
        kind: "error",
        message: "개인정보 수집 동의가 필요합니다.",
      });
      return;
    }
    setStatus({ kind: "loading" });
    try {
      const res = await fetch("/api/banner-inquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim(),
          period,
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          message: message.trim() || undefined,
        }),
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="배너 광고 문의"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm md:items-center md:p-6"
      onClick={onClose}
    >
      <div
        className="glass-strong relative w-full max-h-[92vh] overflow-y-auto rounded-t-2xl shadow-2xl md:max-w-lg md:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="p-5 md:p-7">
          <h3 className="text-base font-semibold text-white md:text-lg">
            배너 광고 문의
          </h3>
          <p className="mt-1 text-xs text-slate-400 md:text-sm">
            부동산 YouTube 채널을 배너에 노출시켜 드립니다. 접수해주시면
            검토 후 빠르게 회신드릴게요.
          </p>

          {status.kind === "ok" ? (
            <div className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-5 text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 ring-1 ring-emerald-400/40">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-300"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p className="mt-3 text-sm font-semibold text-white">
                문의가 접수되었습니다
              </p>
              <p className="mt-1 text-xs text-emerald-200/80">
                담당자가 입력하신 연락처로 회신드릴게요.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-5 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/10"
              >
                닫기
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="mt-5 grid gap-4">
              <Field label="YouTube 영상 링크">
                <input
                  className="input"
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  inputMode="url"
                  autoComplete="off"
                />
              </Field>

              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  광고 기간 / 금액
                </span>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  {PERIOD_OPTIONS.map((opt) => {
                    const active = period === opt.key;
                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          playSound("toggle");
                          setPeriod(opt.key);
                        }}
                        className={`rounded-lg border px-2 py-2.5 text-center transition ${
                          active
                            ? "border-brand-400/60 bg-brand-500/15 text-white shadow-[0_0_0_3px_rgba(99,102,241,0.18)]"
                            : "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/20 hover:bg-white/[0.05]"
                        }`}
                      >
                        <div className="text-sm font-semibold">
                          {opt.label}
                        </div>
                        <div
                          className={`mt-0.5 text-[11px] ${
                            active ? "text-brand-100" : "text-slate-400"
                          }`}
                        >
                          {opt.price}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="이름">
                  <input
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="홍길동"
                    autoComplete="name"
                  />
                </Field>
                <Field label="연락처">
                  <input
                    className="input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="010-0000-0000"
                    inputMode="tel"
                    autoComplete="tel"
                  />
                </Field>
              </div>

              <Field label="이메일 (선택)">
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  inputMode="email"
                  autoComplete="email"
                />
              </Field>

              <Field label="메모 (선택)">
                <textarea
                  className="input min-h-[80px] resize-y"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="요청사항이나 채널 소개를 자유롭게 적어주세요."
                  rows={3}
                />
              </Field>

              <Checkbox checked={agree} onChange={setAgree}>
                개인정보 수집·이용에 동의합니다 (이름, 연락처, 이메일)
              </Checkbox>

              <div className="flex flex-wrap items-center gap-3">
                <RippleButton
                  type="submit"
                  disabled={status.kind === "loading"}
                  playSound={() => playSound("click")}
                  className="btn-primary"
                >
                  {status.kind === "loading" ? "전송 중..." : "문의 보내기"}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </RippleButton>
                {status.kind === "error" && (
                  <span className="text-sm text-rose-300">
                    {status.message}
                  </span>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
