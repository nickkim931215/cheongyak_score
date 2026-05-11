// 청약 가점 계산 (총점 84점)
//   무주택 기간: 최대 32점
//   부양가족 수: 최대 35점
//   청약통장 가입기간: 최대 17점

export function calculateUnhousedScore(years: number): number {
  if (years < 0) return 0;
  if (years >= 15) return 32;
  return (Math.floor(years) + 1) * 2;
}

export function calculateDependentsScore(count: number): number {
  if (count < 0) return 0;
  if (count >= 6) return 35;
  return (count + 1) * 5;
}

export function calculateSubscriptionScore(years: number): number {
  if (years < 0) return 0;
  if (years < 0.5) return 1;
  if (years < 1) return 2;
  if (years >= 15) return 17;
  return Math.floor(years) + 2;
}

export interface ScoreBreakdown {
  unhousedScore: number;
  dependentsScore: number;
  subscriptionScore: number;
  totalScore: number;
}

export function calculateTotalScore(
  unhousedYears: number,
  dependentsCount: number,
  subscriptionYears: number
): ScoreBreakdown {
  const unhousedScore = calculateUnhousedScore(unhousedYears);
  const dependentsScore = calculateDependentsScore(dependentsCount);
  const subscriptionScore = calculateSubscriptionScore(subscriptionYears);

  return {
    unhousedScore,
    dependentsScore,
    subscriptionScore,
    totalScore: unhousedScore + dependentsScore + subscriptionScore,
  };
}

export function scoreTier(total: number): { label: string; color: string; hint: string } {
  if (total >= 70) {
    return {
      label: "최상위권",
      color: "text-emerald-600",
      hint: "수도권 인기 지역도 충분히 도전 가능한 점수입니다.",
    };
  }
  if (total >= 60) {
    return {
      label: "상위권",
      color: "text-blue-600",
      hint: "수도권 일반 지역 / 비인기 평형 당첨권에 들어갑니다.",
    };
  }
  if (total >= 45) {
    return {
      label: "중위권",
      color: "text-amber-600",
      hint: "지방 광역시 또는 추첨제 비중이 높은 단지를 노려보세요.",
    };
  }
  return {
    label: "하위권",
    color: "text-rose-600",
    hint: "가점보다는 추첨제 / 특별공급 트랙 활용을 권장합니다.",
  };
}
