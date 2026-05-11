// 특별공급 자격 판정 (모의 룰셋)
// 실제 규정은 매년 바뀌므로 본 모듈은 대표 트랙의 핵심 조건만을 단순화하여 구현합니다.

export type MaritalStatus = "single" | "married" | "married_with_kids";

export interface SpecialSupplyInput {
  age: number;                       // 만 나이
  maritalStatus: MaritalStatus;
  marriageYears: number;             // 혼인 신고 후 경과 연수
  hasChildren: boolean;
  childrenCount: number;
  isFirstTimeBuyer: boolean;         // 생애 최초 주택 구입자 여부
  monthlyIncomeKRW: number;          // 월 소득 (원)
  totalAssetsKRW: number;            // 총 자산 (원)
  isHouseholdHead: boolean;
  subscriptionMonths: number;        // 청약통장 가입 개월
}

export interface TrackResult {
  track: string;
  eligible: boolean;
  reasons: string[];          // 실패 사유 (eligible=false일 때)
  highlights: string[];       // 충족된 조건 (eligible=true일 때 강조)
}

const NEWLYWED_INCOME_LIMIT = 8_000_000;       // 단순화: 월 800만원 이하
const FIRST_TIMER_INCOME_LIMIT = 7_000_000;    // 단순화: 월 700만원 이하
const MULTI_CHILD_INCOME_LIMIT = 9_000_000;    // 단순화: 월 900만원 이하
const ASSET_LIMIT = 350_000_000;               // 단순화: 3.5억 이하

function checkNewlywed(input: SpecialSupplyInput): TrackResult {
  const reasons: string[] = [];
  const highlights: string[] = [];

  if (input.maritalStatus === "single") {
    reasons.push("기혼 상태가 아닙니다.");
  } else {
    highlights.push("혼인 신고 완료");
  }
  if (input.marriageYears > 7) {
    reasons.push(`혼인 ${input.marriageYears}년 — 신혼 7년 초과`);
  } else if (input.maritalStatus !== "single") {
    highlights.push(`혼인 ${input.marriageYears}년 (7년 이내)`);
  }
  if (input.monthlyIncomeKRW > NEWLYWED_INCOME_LIMIT) {
    reasons.push("월 소득 기준 초과 (단순 기준 800만원)");
  } else {
    highlights.push("월 소득 기준 충족");
  }
  if (input.totalAssetsKRW > ASSET_LIMIT) {
    reasons.push("총 자산 기준 초과 (단순 기준 3.5억)");
  }
  if (input.subscriptionMonths < 6) {
    reasons.push("청약통장 가입 6개월 미만");
  }

  return {
    track: "신혼부부 특별공급",
    eligible: reasons.length === 0,
    reasons,
    highlights,
  };
}

function checkFirstTimer(input: SpecialSupplyInput): TrackResult {
  const reasons: string[] = [];
  const highlights: string[] = [];

  if (!input.isFirstTimeBuyer) {
    reasons.push("생애 최초 주택 구입자가 아닙니다.");
  } else {
    highlights.push("생애 최초 주택 구입자");
  }
  if (input.age < 19) {
    reasons.push("만 19세 미만");
  }
  if (input.monthlyIncomeKRW > FIRST_TIMER_INCOME_LIMIT) {
    reasons.push("월 소득 기준 초과 (단순 기준 700만원)");
  } else {
    highlights.push("월 소득 기준 충족");
  }
  if (input.totalAssetsKRW > ASSET_LIMIT) {
    reasons.push("총 자산 기준 초과 (단순 기준 3.5억)");
  }
  if (!input.isHouseholdHead) {
    reasons.push("세대주가 아닙니다.");
  } else {
    highlights.push("세대주 조건 충족");
  }
  if (input.subscriptionMonths < 24) {
    reasons.push("청약통장 가입 24개월 미만");
  }

  return {
    track: "생애최초 특별공급",
    eligible: reasons.length === 0,
    reasons,
    highlights,
  };
}

function checkMultiChild(input: SpecialSupplyInput): TrackResult {
  const reasons: string[] = [];
  const highlights: string[] = [];

  if (input.childrenCount < 3) {
    reasons.push(`자녀 ${input.childrenCount}명 — 3명 미만`);
  } else {
    highlights.push(`자녀 ${input.childrenCount}명`);
  }
  if (input.monthlyIncomeKRW > MULTI_CHILD_INCOME_LIMIT) {
    reasons.push("월 소득 기준 초과 (단순 기준 900만원)");
  }
  if (input.subscriptionMonths < 6) {
    reasons.push("청약통장 가입 6개월 미만");
  }
  if (!input.isHouseholdHead) {
    reasons.push("세대주가 아닙니다.");
  }

  return {
    track: "다자녀 특별공급",
    eligible: reasons.length === 0,
    reasons,
    highlights,
  };
}

function checkYouth(input: SpecialSupplyInput): TrackResult {
  const reasons: string[] = [];
  const highlights: string[] = [];

  if (input.age < 19 || input.age > 39) {
    reasons.push(`만 ${input.age}세 — 청년 특공 19~39세 범위 밖`);
  } else {
    highlights.push(`만 ${input.age}세 (청년 연령 충족)`);
  }
  if (input.maritalStatus !== "single") {
    reasons.push("미혼 단독세대 대상 트랙입니다.");
  }
  if (input.subscriptionMonths < 6) {
    reasons.push("청약통장 가입 6개월 미만");
  }
  if (input.monthlyIncomeKRW > 5_000_000) {
    reasons.push("월 소득 기준 초과 (단순 기준 500만원)");
  }

  return {
    track: "청년 특별공급",
    eligible: reasons.length === 0,
    reasons,
    highlights,
  };
}

export function diagnoseSpecialSupply(input: SpecialSupplyInput): TrackResult[] {
  return [
    checkNewlywed(input),
    checkFirstTimer(input),
    checkMultiChild(input),
    checkYouth(input),
  ];
}
