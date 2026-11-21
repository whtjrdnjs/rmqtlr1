/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LunchTier, DailyMeal, DishItem, TIER_CONFIGS } from '../types/meal';

// S 티어 키워드 (극호 / 레전드)
const S_KEYWORDS = [
  '돈가스', '치킨', '탕수육', '치즈', '수육', '스테이크', '삼겹살', '삼계탕',
  '갈비', '닭강정', '불고기', '떡볶이', '피자', '짜장', '만두', '와플', '케이크',
  '스팸', '깐풍', '타코야끼', '롱스틱', '고르곤졸라'
];

// A 티어 키워드 (밥도둑 / 존맛)
const A_KEYWORDS = [
  '제육', '설렁탕', '카레', '덮밥', '부대찌개', '볶음밥', '오리', '어묵',
  '파스타', '우동', '국수', '계란말이', '계란찜', '닭봉', '꿔바로우', '마카롱',
  '샤인머스켓', '마들렌', '배주스', '파인애플', '요구르트', '단무지', '초코우유',
  '힘냈떡', '젤리'
];

// F 티어 키워드 (호불호 극강 / 급식 잔반 1순위)
const F_KEYWORDS = [
  '브로콜리', '다시마', '숙회', '가지', '울외', '나박김치', '연근', '도토리묵'
];

// C 티어 키워드 (건강식 / 채소류)
const C_KEYWORDS = [
  '나물', '무침', '배추김치', '겉절이', '깍두기', '열무김치', '갓김치', '파김치',
  '석박지', '청경채', '근대', '치커리', '시금치', '숙주'
];

/**
 * 메뉴 이름으로 기본 티어 추정
 */
export function getDefaultDishTier(dishName: string): LunchTier {
  const name = dishName.toLowerCase();

  for (const kw of S_KEYWORDS) {
    if (name.includes(kw)) return 'S';
  }
  for (const kw of F_KEYWORDS) {
    if (name.includes(kw)) return 'F';
  }
  for (const kw of A_KEYWORDS) {
    if (name.includes(kw)) return 'A';
  }
  for (const kw of C_KEYWORDS) {
    if (name.includes(kw)) return 'C';
  }

  // 밥, 일반 국 등은 기본 B 티어
  return 'B';
}

export interface DayTierSummary {
  overallTier: LunchTier;
  score: number;
  title: string;
  comment: string;
  counts: Record<LunchTier, number>;
}

const TIER_WEIGHTS: Record<LunchTier, number> = {
  S: 5,
  A: 4,
  B: 3,
  C: 2,
  F: 1,
};

/**
 * 하루 식단 전체 종합 티어 산출
 */
export function calculateMealOverallTier(
  dishes: DishItem[],
  customTiers: Record<string, LunchTier> = {}
): DayTierSummary {
  if (dishes.length === 0) {
    return {
      overallTier: 'B',
      score: 3.0,
      title: '식단 정보 없음',
      comment: '해당 날짜에 등록된 식단이 없습니다.',
      counts: { S: 0, A: 0, B: 0, C: 0, F: 0 },
    };
  }

  const counts: Record<LunchTier, number> = { S: 0, A: 0, B: 0, C: 0, F: 0 };
  let totalScore = 0;

  dishes.forEach((dish) => {
    const tier = customTiers[dish.name] || getDefaultDishTier(dish.name);
    counts[tier] = (counts[tier] || 0) + 1;
    totalScore += TIER_WEIGHTS[tier];
  });

  const avg = totalScore / dishes.length;

  let overallTier: LunchTier = 'B';
  let title = '든든한 꿀맛 데이';
  let comment = '호불호 없이 든든하게 한 끼 뚝딱 할 수 있는 균형 잡힌 식단!';

  if (counts.S >= 2 || (counts.S >= 1 && counts.A >= 2) || avg >= 3.8) {
    overallTier = 'S';
    title = '🔥 전교생 환호! S티어 레전드 급식';
    comment = '배식구 줄 2배로 길어지는 날! 매점 갈 생각 싹 사라지는 축제 식단입니다.';
  } else if (counts.S >= 1 || counts.A >= 2 || avg >= 3.2) {
    overallTier = 'A';
    title = '🍚 밥 두 공기 예약! 밥도둑 A티어';
    comment = '고기 반찬이나 맛있는 메인 요리가 확실하게 받쳐주는 만족도 높은 식단!';
  } else if (counts.F >= 2 || (counts.C + counts.F >= 3 && counts.S === 0)) {
    overallTier = 'C';
    title = '🥗 건강 풀충전 C티어 식단';
    comment = '몸에 좋은 채소와 나물이 듬뿍! 건강 생각하며 골고루 먹어봅시다.';
  } else if (counts.F >= 3) {
    overallTier = 'F';
    title = '💀 매점 빵 땡기는 고난의 식단';
    comment = '호불호 갈리는 반찬 다수 포진... 그래도 편식 말고 힘내서 완식 도전!';
  }

  return {
    overallTier,
    score: Math.round(avg * 10) / 10,
    title,
    comment,
    counts,
  };
}
