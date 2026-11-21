/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DishItem {
  name: string;
  originalText: string;
  allergenCodes: number[];
  allergens: string[];
}

export interface NutritionItem {
  name: string;
  value: string;
}

export interface DailyMeal {
  date: string; // YYYYMMDD
  dateFormatted: string; // YYYY.MM.DD
  dayOfWeek: string; // 월, 화, 수, 목, 금, 토, 일
  mealName: string; // 중식
  dishes: DishItem[];
  calories: string; // e.g. "761.9 Kcal"
  nutrition: NutritionItem[];
  originInfo: string[];
}

export const ALLERGEN_MAP: Record<number, { name: string; shortName: string; emoji: string }> = {
  1: { name: '난류(계란)', shortName: '계란', emoji: '🥚' },
  2: { name: '우유', shortName: '우유', emoji: '🥛' },
  3: { name: '메밀', shortName: '메밀', emoji: '🌾' },
  4: { name: '땅콩', shortName: '땅콩', emoji: '🥜' },
  5: { name: '대두(콩)', shortName: '대두', emoji: '🫘' },
  6: { name: '밀', shortName: '밀', emoji: '🍞' },
  7: { name: '고등어', shortName: '고등어', emoji: '🐟' },
  8: { name: '게', shortName: '게', emoji: '🦀' },
  9: { name: '새우', shortName: '새우', emoji: '🦐' },
  10: { name: '돼지고기', shortName: '돼지고기', emoji: '🥩' },
  11: { name: '복숭아', shortName: '복숭아', emoji: '🍑' },
  12: { name: '토마토', shortName: '토마토', emoji: '🍅' },
  13: { name: '아황산류', shortName: '아황산류', emoji: '🧪' },
  14: { name: '호두', shortName: '호두', emoji: '🌰' },
  15: { name: '닭고기', shortName: '닭고기', emoji: '🍗' },
  16: { name: '쇠고기', shortName: '쇠고기', emoji: '🥩' },
  17: { name: '오징어', shortName: '오징어', emoji: '🦑' },
  18: { name: '조개류(굴/전복/홍합)', shortName: '조개류', emoji: '🦪' },
  19: { name: '잣', shortName: '잣', emoji: '🌲' },
};
export type LunchTier = 'S' | 'A' | 'B' | 'C' | 'F';

export interface TierConfig {
  tier: LunchTier;
  label: string;
  subLabel: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  color: string;
  bgLight: string;
  icon: string;
  description: string;
}

export const TIER_CONFIGS: Record<LunchTier, TierConfig> = {
  S: {
    tier: 'S',
    label: 'S 티어 (신급 레전드)',
    subLabel: '매점 안 가도 되는 날',
    badgeBg: 'bg-red-500',
    badgeText: 'text-white',
    borderColor: 'border-red-500',
    color: '#ef4444',
    bgLight: 'bg-red-50',
    icon: '👑',
    description: '치킨, 돈가스, 고기반찬 가득! 배식구 줄 길어지는 날',
  },
  A: {
    tier: 'A',
    label: 'A 티어 (밥도둑)',
    subLabel: '두 번 받으러 가는 날',
    badgeBg: 'bg-orange-500',
    badgeText: 'text-white',
    borderColor: 'border-orange-500',
    color: '#f97316',
    bgLight: 'bg-orange-50',
    icon: '🔥',
    description: '제육, 덮밥, 찌개 조합으로 밥 한 공기 뚝딱!',
  },
  B: {
    tier: 'B',
    label: 'B 티어 (든든한 평타)',
    subLabel: '무난하고 든든한 급식',
    badgeBg: 'bg-amber-400',
    badgeText: 'text-amber-950',
    borderColor: 'border-amber-400',
    color: '#f59e0b',
    bgLight: 'bg-amber-50',
    icon: '👍',
    description: '호불호 없이 맛있게 배 채우는 든든한 식사',
  },
  C: {
    tier: 'C',
    label: 'C 티어 (건강 챙기는 날)',
    subLabel: '채소가 조금 많은 날',
    badgeBg: 'bg-emerald-500',
    badgeText: 'text-white',
    borderColor: 'border-emerald-500',
    color: '#10b981',
    bgLight: 'bg-emerald-50',
    icon: '🥗',
    description: '나물과 건강 채소 위주! 몸에는 아주 좋은 날',
  },
  F: {
    tier: 'F',
    label: 'F 티어 (호불호 극강)',
    subLabel: '매점 빵 땡기는 날',
    badgeBg: 'bg-slate-700',
    badgeText: 'text-white',
    borderColor: 'border-slate-700',
    color: '#334155',
    bgLight: 'bg-slate-100',
    icon: '💀',
    description: '다시마브로콜리숙회, 나물 파티... 취향 많이 타는 날',
  },
};
