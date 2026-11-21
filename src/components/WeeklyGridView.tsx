/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Calendar,
  Flame,
  Heart,
  Share2,
  Check,
  ChevronRight,
  ShieldAlert,
  Trophy,
} from 'lucide-react';
import { DailyMeal, LunchTier, TIER_CONFIGS, ALLERGEN_MAP } from '../types/meal';
import { calculateMealOverallTier, getDefaultDishTier } from '../services/tierService';

interface WeekDayItem {
  index: number;
  name: string;
  date: Date;
  ymd: string;
  isToday: boolean;
}

interface WeeklyGridViewProps {
  weekDays: WeekDayItem[];
  weeklyMeals: DailyMeal[];
  userAllergens: number[];
  favoriteDishes: string[];
  customTiers: Record<string, LunchTier>;
  onSelectDay: (index: number) => void;
  onToggleFavorite: (dishName: string) => void;
  weekRangeLabel: string;
}

export const WeeklyGridView: React.FC<WeeklyGridViewProps> = ({
  weekDays,
  weeklyMeals,
  userAllergens,
  favoriteDishes,
  customTiers,
  onSelectDay,
  onToggleFavorite,
  weekRangeLabel,
}) => {
  const [copied, setCopied] = useState(false);

  // Copy whole week to clipboard
  const handleCopyFullWeek = async () => {
    let text = `📅 [세종다정고 주간 급식 식단표 (${weekRangeLabel})]\n\n`;

    weekDays.forEach((day) => {
      const meal = weeklyMeals.find((m) => m.date === day.ymd);
      text += `▶ ${day.date.getMonth() + 1}/${day.date.getDate()} (${day.name}요일) ${meal?.calories ? `[${meal.calories}]` : ''}\n`;
      if (meal && meal.dishes.length > 0) {
        text += meal.dishes.map((d) => `  · ${d.name}`).join('\n') + '\n\n';
      } else {
        text += `  · 급식 없음 (주말/휴일)\n\n`;
      }
    });

    text += `출처: 세종다정고등학교 급식실`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('주간 식단표가 복사되었습니다:\n\n' + text);
    }
  };

  return (
    <div className="space-y-4">
      {/* 주간 뷰 상단 바 */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-600" />
            <span>이번 주 5일치 급식 한눈에 보기</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            월요일부터 금요일까지 전 메뉴를 한 번에 확인하세요
          </p>
        </div>

        <button
          type="button"
          onClick={handleCopyFullWeek}
          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span>{copied ? '복사 완료' : '주간 식단 복사'}</span>
        </button>
      </div>

      {/* 5일치 카드 리스트 */}
      <div className="space-y-3">
        {weekDays.map((day) => {
          const meal = weeklyMeals.find((m) => m.date === day.ymd);
          const hasMeal = Boolean(meal && meal.dishes.length > 0);

          // Calculate tier if meal exists
          const tierSummary = meal && meal.dishes.length > 0
            ? calculateMealOverallTier(meal.dishes, customTiers)
            : null;
          const tierConfig = tierSummary ? TIER_CONFIGS[tierSummary.overallTier] : null;

          // Check caution
          const cautionDishes = meal
            ? meal.dishes.filter((d) =>
                d.allergenCodes.some((c) => userAllergens.includes(c))
              )
            : [];
          const hasCaution = cautionDishes.length > 0;

          // Check favorites
          const dayHasFavorite = meal
            ? meal.dishes.some((d) => favoriteDishes.includes(d.name))
            : false;

          return (
            <div
              key={day.index}
              className={`p-4 rounded-2xl border transition-all ${
                day.isToday
                  ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-200 shadow-sm'
                  : hasCaution
                  ? 'bg-rose-50/40 border-rose-200'
                  : 'bg-white border-slate-200 shadow-2xs'
              }`}
            >
              {/* 카드 상단 요일 & 헤더 */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-3xs ${
                      day.isToday
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 text-slate-800 border border-slate-200'
                    }`}
                  >
                    {day.name}
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {day.date.getMonth() + 1}월 {day.date.getDate()}일 ({day.name}요일)
                      </span>
                      {day.isToday && (
                        <span className="text-[10px] font-black bg-slate-900 text-white px-2 py-0.2 rounded-full">
                          오늘
                        </span>
                      )}
                      {dayHasFavorite && (
                        <span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.2 rounded-full flex items-center gap-0.5">
                          <Heart className="w-2.5 h-2.5 fill-current" />
                          <span>최애</span>
                        </span>
                      )}
                    </div>
                    {meal?.calories && (
                      <span className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                        <Flame className="w-3.5 h-3.5 text-orange-500 inline" />
                        <span>{meal.calories}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* 티어 뱃지 및 상세 보기 버튼 */}
                <div className="flex items-center gap-2">
                  {tierConfig && (
                    <span
                      className={`px-2 py-0.8 rounded-lg font-black text-xs ${tierConfig.badgeBg} ${tierConfig.badgeText} shadow-3xs`}
                    >
                      {tierConfig.tier}티어
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectDay(day.index)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="해당 요일로 이동"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 식단 메뉴 목록 */}
              {hasMeal && meal ? (
                <div className="pt-2.5 space-y-1.5">
                  <div className="flex flex-wrap gap-1.5">
                    {meal.dishes.map((dish, i) => {
                      const isFav = favoriteDishes.includes(dish.name);
                      const isCaution = dish.allergenCodes.some((c) =>
                        userAllergens.includes(c)
                      );

                      return (
                        <div
                          key={i}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-colors ${
                            isFav
                              ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-3xs'
                              : isCaution
                              ? 'bg-amber-50 border-amber-300 text-amber-900'
                              : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}
                        >
                          <span>{dish.name}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(dish.name);
                            }}
                            className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                            title={isFav ? '최애 메뉴 해제' : '최애 메뉴로 등록'}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${
                                isFav
                                  ? 'text-rose-500 fill-rose-500'
                                  : 'text-slate-300 hover:text-rose-400'
                              }`}
                            />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* 알레르기 주의 배너 (해당일 있을 경우) */}
                  {hasCaution && (
                    <div className="mt-2 pt-2 border-t border-rose-100 flex items-center gap-1.5 text-[11px] text-rose-700 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>
                        내 알레르기 주의 메뉴 {cautionDishes.length}개 포함 ({cautionDishes.map((d) => d.name).join(', ')})
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-slate-400">
                  급식 식단이 없는 날입니다.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
