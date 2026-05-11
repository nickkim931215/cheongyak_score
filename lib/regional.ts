// 지역별 경쟁력 분석 (모의 데이터)
// 실제 분양 통계가 아닌 데모용 추정치입니다.

export interface RegionStat {
  code: string;
  name: string;
  avgWinningScore: number;     // 최근 평균 당첨 가점
  avgCompetition: number;      // 평균 경쟁률 (n:1)
  lotteryRatio: number;        // 추첨제 비중 (0~1)
  notes: string;
}

export const REGIONS: RegionStat[] = [
  {
    code: "seoul_gangnam",
    name: "서울 강남 3구",
    avgWinningScore: 72,
    avgCompetition: 132.4,
    lotteryRatio: 0.25,
    notes: "최고 점수대 경쟁. 가점 70점 이하면 사실상 추첨제 노려야 함.",
  },
  {
    code: "seoul_other",
    name: "서울 그 외",
    avgWinningScore: 64,
    avgCompetition: 48.2,
    lotteryRatio: 0.35,
    notes: "60점대 중반이 안정권. 비인기 평형 추첨제 가능성 있음.",
  },
  {
    code: "incheon",
    name: "인천",
    avgWinningScore: 52,
    avgCompetition: 18.7,
    lotteryRatio: 0.5,
    notes: "추첨 비중 큼. 50점대 초반도 도전 가능.",
  },
  {
    code: "gyeonggi_hot",
    name: "경기 인기 지역 (수원·과천·하남)",
    avgWinningScore: 60,
    avgCompetition: 35.0,
    lotteryRatio: 0.4,
    notes: "거주 요건 가산점 영향 큼. 해당 지역 거주 시 유리.",
  },
  {
    code: "gyeonggi_other",
    name: "경기 그 외",
    avgWinningScore: 48,
    avgCompetition: 12.3,
    lotteryRatio: 0.5,
    notes: "중위권 점수도 노릴 만함. 추첨제 절반 비중.",
  },
  {
    code: "metro",
    name: "지방 광역시 (부산·대구·대전 등)",
    avgWinningScore: 42,
    avgCompetition: 7.4,
    lotteryRatio: 0.55,
    notes: "추첨제 비중 가장 높음. 가점 낮아도 충분히 도전 가능.",
  },
  {
    code: "rural",
    name: "지방 그 외",
    avgWinningScore: 28,
    avgCompetition: 2.1,
    lotteryRatio: 0.7,
    notes: "사실상 청약통장만 있어도 당첨권. 단지 가치 별도 검토 필요.",
  },
];

export interface RegionAdvice {
  region: RegionStat;
  verdict: "strong" | "ok" | "weak";
  scoreGap: number;     // 내 점수 - 평균 당첨 가점
  message: string;
}

export function analyzeRegions(myScore: number): RegionAdvice[] {
  return REGIONS.map((region) => {
    const scoreGap = myScore - region.avgWinningScore;
    let verdict: RegionAdvice["verdict"];
    let message: string;

    if (scoreGap >= 5) {
      verdict = "strong";
      message = `평균 당첨선보다 ${scoreGap}점 우위 — 가점제 직접 노릴 만함.`;
    } else if (scoreGap >= -5) {
      verdict = "ok";
      message = `평균 당첨선과 ${Math.abs(scoreGap)}점 차 — 단지/평형에 따라 충분히 도전권.`;
    } else {
      verdict = "weak";
      const lotteryHint = region.lotteryRatio >= 0.4
        ? `추첨제 비중 ${Math.round(region.lotteryRatio * 100)}%로 운에 베팅 가능.`
        : "가점제 위주 — 다른 지역 권장.";
      message = `평균 당첨선보다 ${Math.abs(scoreGap)}점 부족. ${lotteryHint}`;
    }

    return { region, verdict, scoreGap, message };
  }).sort((a, b) => b.scoreGap - a.scoreGap);
}
