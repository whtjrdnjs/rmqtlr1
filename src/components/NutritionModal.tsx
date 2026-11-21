/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Flame, Apple, Info } from 'lucide-react';
import { DailyMeal } from '../types/meal';

interface NutritionModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: DailyMeal | null;
}

export const NutritionModal: React.FC<NutritionModalProps> = ({
  isOpen,
  onClose,
  meal,
}) => {
  const [activeTab, setActiveTab] = useState<'nutrition' | 'origin'>('nutrition');

  if (!isOpen || !meal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="영양 및 원산지 정보"
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 상단 */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
              {meal.dateFormatted} ({meal.dayOfWeek}) {meal.mealName}
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1 flex items-center gap-2">
              <span>급식 상세 영양 & 원산지</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 칼로리 하이라이트 박스 */}
        {meal.calories && (
          <div className="mt-3 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-orange-800 font-semibold">총 열량(칼로리)</p>
                <p className="text-xl font-extrabold text-orange-950 tracking-tight">
                  {meal.calories}
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              청소년 권장열량 기준
            </span>
          </div>
        )}

        {/* 탭 버튼 */}
        <div className="mt-4 flex bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('nutrition')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'nutrition'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            영양 성분표
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('origin')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
              activeTab === 'origin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            식재료 원산지
          </button>
        </div>

        {/* 내용 영역 */}
        <div className="mt-3 overflow-y-auto flex-1 pr-1">
          {activeTab === 'nutrition' ? (
            <div className="space-y-2">
              {meal.nutrition.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {meal.nutrition.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-600 font-medium">{item.name}</span>
                      <span className="text-slate-900 font-bold tabular-nums">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  영양 정보가 등록되지 않았습니다.
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              {meal.originInfo.length > 0 ? (
                meal.originInfo.map((origin, idx) => {
                  const parts = origin.split(':');
                  const item = parts[0]?.trim();
                  const place = parts[1]?.trim() || '';

                  return (
                    <div
                      key={idx}
                      className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-sm"
                    >
                      <span className="font-semibold text-slate-800">{item}</span>
                      <span className="text-amber-800 font-medium text-xs bg-amber-100/80 px-2 py-0.5 rounded-md">
                        {place}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-slate-400 text-sm">
                  원산지 정보가 등록되지 않았습니다.
                </div>
              )}
            </div>
          )}
        </div>

        {/* 하단 닫기 */}
        <div className="pt-3 mt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};
