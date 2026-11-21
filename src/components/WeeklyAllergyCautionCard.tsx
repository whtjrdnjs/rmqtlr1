/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, ShieldCheck, ChevronRight, Sparkles, Plus } from 'lucide-react';
import { DailyMeal, ALLERGEN_MAP } from '../types/meal';

interface WeekDayItem {
  index: number;
  name: string;
  date: Date;
  ymd: string;
  isToday: boolean;
}

interface CautionDaySummary {
  dayItem: WeekDayItem;
  meal: DailyMeal | null;
  cautionDishes: {
    dishName: string;
    matchedAllergens: string[];
  }[];
}

interface WeeklyAllergyCautionCardProps {
  weekDays: WeekDayItem[];
  weeklyMeals: DailyMeal[];
  userAllergens: number[];
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
  onOpenAllergyModal: () => void;
  onToggleAllergen: (code: number) => void;
}

// 자주 문의되는 대표 알레르기 8종 퀵 셀렉터
export const QUICK_ALLERGENS = [
  { code: 2, name: '우유', emoji: '🥛' },
  { code: 1, name: '계란', emoji: '🥚' },
  { code: 4, name: '땅콩', emoji: '🥜' },
  { code: 10, name: '돼지고기', emoji: '🥩' },
  { code: 6, name: '밀(글루텐)', emoji: '🍞' },
  { code: 5, name: '대두(콩)', emoji: '🫘' },
  { code: 9, name: '새우', emoji: '🦐' },
  { code: 11, name: '복숭아', emoji: '🍑' },
];

export const WeeklyAllergyCautionCard: React.FC<WeeklyAllergyCautionCardProps> = ({
  weekDays,
  weeklyMeals,
  userAllergens,
  selectedDayIndex,
  onSelectDay,
  onOpenAllergyModal,
  onToggleAllergen,
}) => {
  // 이번 주 요일별 주의 항목 계산
  const cautionDays: CautionDaySummary[] = weekDays.map((dayItem) => {
    const meal = weeklyMeals.find((m) => m.date === dayItem.ymd) || null;
    const cautionDishes: { dishName: string; matchedAllergens: string[] }[] = [];

    if (meal && userAllergens.length > 0) {
      meal.dishes.forEach((dish) => {
        const matched = dish.allergenCodes
          .filter((c) => userAllergens.includes(c))
          .map((c) => ALLERGEN_MAP[c]?.shortName || `${c}`);
        if (matched.length > 0) {
          cautionDishes.push({
            dishName: dish.name,
            matchedAllergens: matched,
          });
        }
      });
    }

    return {
      dayItem,
      meal,
      cautionDishes,
    };
  });

  const daysWithCaution = cautionDays.filter((d) => d.cautionDishes.length > 0);

  // 알레르기가 하나라도 선택되어 있을 때
  if (userAllergens.length > 0) {
    const activeAllergenNames = userAllergens
      .map((c) => ALLERGEN_MAP[c]?.shortName || `${c}`)
      .join(', ');

    return (
      <section
        className="mx-3 sm:mx-4 mb-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-rose-50/90 via-amber-50/60 to-rose-50/90 border border-rose-200/90 shadow-xs"
        aria-label="이번 주 알레르기 주의 요일"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-rose-950 flex items-center gap-1.5">
                <span>이번 주 주의해야 하는 날</span>
                <span className="text-xs bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-black">
                  {daysWithCaution.length}일 주의
                </span>
              </h2>
              <p className="text-xs text-rose-800 mt-0.5">
                등록된 알레르기: <strong>{activeAllergenNames}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAllergyModal}
            className="text-xs text-rose-800 hover:text-rose-950 underline underline-offset-2 font-bold shrink-0 cursor-pointer"
          >
            변경
          </button>
        </div>

        {/* 요일별 주의 리스트 */}
        {daysWithCaution.length > 0 ? (
          <div className="mt-3 space-y-2">
            {daysWithCaution.map(({ dayItem, cautionDishes }) => {
              const isSelected = selectedDayIndex === dayItem.index;

              return (
                <button
                  key={dayItem.index}
                  type="button"
                  onClick={() => onSelectDay(dayItem.index)}
                  className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-white border-rose-400 shadow-sm ring-2 ring-rose-300'
                      : 'bg-white/80 hover:bg-white border-rose-200/80'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-xs font-black shrink-0">
                        {dayItem.name}요일 ({dayItem.date.getMonth() + 1}.{dayItem.date.getDate()})
                      </span>
                      {dayItem.isToday && (
                        <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.2 rounded-full font-bold">
                          오늘
                        </span>
                      )}
                      <span className="text-xs font-bold text-rose-900 truncate">
                        {cautionDishes.length}개 메뉴 주의
                      </span>
                    </div>

                    {/* 구체적인 주의 음식 이름 */}
                    <p className="text-xs text-slate-700 mt-1 truncate">
                      {cautionDishes.map((d, i) => (
                        <span key={i} className="mr-2">
                          <strong>{d.dishName}</strong>
                          <span className="text-rose-600 font-semibold ml-0.5">
                            ({d.matchedAllergens.join(',')})
                          </span>
                        </span>
                      ))}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-rose-700 shrink-0 font-bold text-xs">
                    <span className="hidden sm:inline">식단보기</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-900">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <p>
              이번 주(월~금)에는 선택하신 알레르기(<strong>{activeAllergenNames}</strong>) 유발 식재료가 없습니다. <strong>안심하고 식사하세요!</strong>
            </p>
          </div>
        )}
      </section>
    );
  }

  // 알레르기가 아직 선택되지 않았을 때: 친절한 원클릭 가이드
  return (
    <section
      className="mx-3 sm:mx-4 mb-3 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950"
      aria-label="알레르기 주의 요일 확인 가이드"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-extrabold text-amber-950">
              주의해야 하는 음식 알레르기가 있으신가요?
            </h2>
            <p className="text-[11px] text-amber-800 mt-0.5">
              아래 음식을 선택하시면 <strong>이번 주 피해야 하는 날</strong>을 달력에 바로 표시해 드립니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAllergyModal}
          className="text-[11px] font-bold text-amber-900 underline underline-offset-2 shrink-0 hover:text-amber-950 cursor-pointer"
        >
          19종 전체
        </button>
      </div>

      {/* 대표 알레르기 퀵 선택 버튼들 */}
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {QUICK_ALLERGENS.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => onToggleAllergen(item.code)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-100/80 border border-amber-200/90 text-xs font-bold text-slate-700 shadow-2xs active:scale-95 transition-all cursor-pointer"
          >
            <span>{item.emoji}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
