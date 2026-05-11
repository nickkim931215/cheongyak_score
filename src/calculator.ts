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

export function calculateTotalScore(
  unhousedYears: number,
  dependentsCount: number,
  subscriptionYears: number
): {
  unhousedScore: number;
  dependentsScore: number;
  subscriptionScore: number;
  totalScore: number;
} {
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
