/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Search, X, Calendar, ChevronRight, Utensils, Sparkles } from 'lucide-react';
import { DailyMeal } from '../types/meal';
import { DAJEONG_MEALS_CACHE } from '../data/dajeongMealsCache';

interface MenuSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (targetDateYMD: string) => void;
  additionalMeals?: DailyMeal[];
}

const POPULAR_SEARCH_TAGS = [
  '돈가스', '치킨', '스팸', '탕수육', '짜장', '설렁탕', '수육', '닭강정', '만두', '피자', '떡볶이', '삼계탕', '샤인머스켓'
];

export const MenuSearchModal: React.FC<MenuSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectDate,
  additionalMeals = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Combine cache and loaded meals, removing duplicates
  const allMeals = useMemo(() => {
    const map = new Map<string, DailyMeal>();
    DAJEONG_MEALS_CACHE.forEach((m) => map.set(m.date, m));
    additionalMeals.forEach((m) => map.set(m.date, m));
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [additionalMeals]);

  // Search results
  const searchResults = useMemo(() => {
    const trimmed = searchTerm.trim().toLowerCase();
    if (!trimmed) return [];

    return allMeals
      .map((meal) => {
        const matchingDishes = meal.dishes.filter((dish) =>
          dish.name.toLowerCase().includes(trimmed)
        );
        return {
          meal,
          matchingDishes,
        };
      })
      .filter((item) => item.matchingDishes.length > 0);
  }, [allMeals, searchTerm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="급식 메뉴 검색"
    >
      <div
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 상단 */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Search className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                다정고 급식 메뉴 검색
              </h2>
              <p className="text-xs text-slate-500">
                치킨, 돈가스, 스팸 등 좋아하는 메뉴가 언제 나오는지 찾아보세요!
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 검색 입력창 */}
        <div className="mt-4 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="메뉴 이름 입력 (예: 돈가스, 치킨, 고기, 탕수육)"
            className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-100 border border-slate-200 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            autoFocus
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-3 p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <p className="text-[11px] text-slate-400 mt-1.5 pl-1">
            이름 · 학번 · 연락처는 쓰지 마세요
          </p>
        </div>

        {/* 인기 검색어 태그 */}
        <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">추천:</span>
          {POPULAR_SEARCH_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSearchTerm(tag)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                searchTerm === tag
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* 검색 결과 리스트 */}
        <div className="mt-3 overflow-y-auto flex-1 pr-1 space-y-2.5 min-h-[160px]">
          {searchTerm.trim() === '' ? (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <Sparkles className="w-10 h-10 text-amber-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">
                찾고 싶은 급식 메뉴를 검색해 보세요
              </p>
              <p className="text-xs text-slate-400 mt-1">
                위 추천 키워드를 누르면 바로 결과를 확인할 수 있습니다.
              </p>
            </div>
          ) : searchResults.length > 0 ? (
            searchResults.map(({ meal, matchingDishes }) => {
              const y = meal.date.slice(0, 4);
              const m = parseInt(meal.date.slice(4, 6), 10);
              const d = parseInt(meal.date.slice(6, 8), 10);

              return (
                <div
                  key={meal.date}
                  onClick={() => {
                    onSelectDate(meal.date);
                    onClose();
                  }}
                  className="p-3.5 bg-slate-50 hover:bg-amber-50/80 rounded-2xl border border-slate-200/90 hover:border-amber-300 transition-all cursor-pointer flex items-center justify-between group shadow-3xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white text-xs font-black shrink-0">
                        {m}월 {d}일 ({meal.dayOfWeek})
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {meal.mealName} · {meal.calories}
                      </span>
                    </div>

                    {/* 일치하는 메뉴 하이라이트 */}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {matchingDishes.map((dish, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-950 font-black text-xs sm:text-sm"
                        >
                          {dish.name}
                        </span>
                      ))}
                    </div>

                    {/* 전체 식단 미리보기 텍스트 */}
                    <p className="text-[11px] text-slate-500 mt-1 truncate">
                      {meal.dishes.map((d) => d.name).join(' · ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-amber-700 font-extrabold text-xs shrink-0 group-hover:translate-x-0.5 transition-transform">
                    <span>이동</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-12 text-center text-slate-400 flex flex-col items-center justify-center">
              <Utensils className="w-10 h-10 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">
                '{searchTerm}' 검색 결과가 없습니다
              </p>
              <p className="text-xs text-slate-400 mt-1">
                다른 단어로 검색하시거나 다른 월의 식단을 확인해 보세요.
              </p>
            </div>
          )}
        </div>

        {/* 하단 닫기 */}
        <div className="pt-3 mt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
