/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Dumbbell, Flame, Apple, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import { DailyMeal } from '../types/meal';

interface NutritionMacroCardProps {
  meal: DailyMeal | null;
}

export const NutritionMacroCard: React.FC<NutritionMacroCardProps> = ({ meal }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!meal || meal.nutrition.length === 0) return null;

  // Extract protein, carbs, fat
  let carbs = 0;
  let protein = 0;
  let fat = 0;

  meal.nutrition.forEach((item) => {
    const val = parseFloat(item.value.replace(/[^0-9.]/g, '')) || 0;
    if (item.name.includes('탄수화물')) carbs = val;
    if (item.name.includes('단백질')) protein = val;
    if (item.name.includes('지방') && !item.name.includes('포화')) fat = val;
  });

  const totalGrams = carbs + protein + fat;
  const carbsPct = totalGrams > 0 ? Math.round((carbs / totalGrams) * 100) : 0;
  const proteinPct = totalGrams > 0 ? Math.round((protein / totalGrams) * 100) : 0;
  const fatPct = totalGrams > 0 ? 100 - carbsPct - proteinPct : 0;

  // Protein evaluation
  let proteinBadge = '💪 든든한 단백질';
  let proteinComment = '근손실 방어 완료! 성장기 청소년 맞춤 단백질량';
  const eggEquiv = Math.round(protein / 6.5); // Egg has ~6.5g protein

  if (protein >= 45) {
    proteinBadge = '🔥 초고단백 득근 데이!';
    proteinComment = `단백질 폭탄! 닭가슴살 2덩이 또는 삶은 달걀 ${eggEquiv}개 수준의 파워 식단입니다.`;
  } else if (protein >= 35) {
    proteinBadge = '⚡ 훌륭한 고단백 식단';
    proteinComment = `달걀 약 ${eggEquiv}개 분량의 단백질! 체력과 집중력 충전에 최적입니다.`;
  } else {
    proteinBadge = '🥗 가볍고 깔끔한 식단';
    proteinComment = '채소와 무기질 중심 식단! 운동 후 간식으로 우유나 달걀 한 개 추천합니다.';
  }

  return (
    <div className="mt-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 via-slate-50 to-orange-50/70 border border-indigo-200/80 shadow-2xs">
      {/* 상단 득근 요약 */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Dumbbell className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                {proteinBadge}
              </span>
              <span className="text-xs font-bold text-slate-500">
                열량 {meal.calories || '정보 없음'}
              </span>
            </div>
            <p className="text-xs text-slate-700 font-semibold mt-1">
              {proteinComment}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-0.5 p-1 cursor-pointer shrink-0"
        >
          <span>{isExpanded ? '접기' : '상세'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 탄·단·지 3분할 수치 카드 */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-3xs">
          <span className="text-[10px] font-bold text-slate-500 block">탄수화물</span>
          <span className="text-base sm:text-lg font-black text-blue-600 tabular-nums">
            {carbs}g
          </span>
          <span className="text-[10px] text-slate-400 font-medium block">
            {carbsPct}%
          </span>
        </div>

        <div className="p-2 bg-white rounded-xl border border-indigo-300 ring-2 ring-indigo-200/50 shadow-3xs">
          <span className="text-[10px] font-extrabold text-indigo-700 block flex items-center justify-center gap-0.5">
            <Zap className="w-3 h-3 text-indigo-600" />
            <span>단백질</span>
          </span>
          <span className="text-base sm:text-lg font-black text-indigo-700 tabular-nums">
            {protein}g
          </span>
          <span className="text-[10px] text-indigo-600 font-bold block">
            {proteinPct}%
          </span>
        </div>

        <div className="p-2 bg-white rounded-xl border border-slate-200/80 shadow-3xs">
          <span className="text-[10px] font-bold text-slate-500 block">지방</span>
          <span className="text-base sm:text-lg font-black text-amber-600 tabular-nums">
            {fat}g
          </span>
          <span className="text-[10px] text-slate-400 font-medium block">
            {fatPct}%
          </span>
        </div>
      </div>

      {/* 탄·단·지 비주얼 프로그레스 바 */}
      <div className="mt-2.5">
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${carbsPct}%` }}
            className="bg-blue-500 h-full transition-all"
            title={`탄수화물: ${carbsPct}%`}
          />
          <div
            style={{ width: `${proteinPct}%` }}
            className="bg-indigo-600 h-full transition-all"
            title={`단백질: ${proteinPct}%`}
          />
          <div
            style={{ width: `${fatPct}%` }}
            className="bg-amber-400 h-full transition-all"
            title={`지방: ${fatPct}%`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1 px-1">
          <span className="text-blue-600">■ 탄수화물</span>
          <span className="text-indigo-600">■ 단백질 (득근)</span>
          <span className="text-amber-600">■ 지방</span>
        </div>
      </div>

      {/* 확장 시 전체 미네랄 및 비타민 표 */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-indigo-100 grid grid-cols-2 gap-1.5 text-xs animate-in fade-in duration-150">
          {meal.nutrition
            .filter((n) => !n.name.includes('탄수화물') && !n.name.includes('단백질') && !n.name.includes('지방'))
            .map((item, i) => (
              <div
                key={i}
                className="p-1.5 bg-white/80 rounded-lg flex items-center justify-between text-[11px]"
              >
                <span className="text-slate-600">{item.name}</span>
                <span className="font-bold text-slate-900 tabular-nums">{item.value}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
