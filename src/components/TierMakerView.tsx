/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Trophy,
  RotateCcw,
  Share2,
  Check,
  Sparkles,
  RefreshCw,
  Users,
  AlertCircle,
} from 'lucide-react';
import { DailyMeal, LunchTier, TIER_CONFIGS, DishItem } from '../types/meal';
import { calculateMealOverallTier, getDefaultDishTier } from '../services/tierService';
import { StoreRecord } from '../services/storeService';

interface TierMakerViewProps {
  meal: DailyMeal | null;
  customTiers: Record<string, LunchTier>;
  onSetDishTier: (dishName: string, tier: LunchTier) => void;
  onResetTiers: () => void;
  storeItems: StoreRecord[];
  storeLoading: boolean;
  storeError: string | null;
  onVoteTier: (date: string, choice: LunchTier) => Promise<void>;
  onRefreshStore: () => Promise<void>;
}

const TIERS_LIST: LunchTier[] = ['S', 'A', 'B', 'C', 'F'];

export const TierMakerView: React.FC<TierMakerViewProps> = ({
  meal,
  customTiers,
  onSetDishTier,
  onResetTiers,
  storeItems,
  storeLoading,
  storeError,
  onVoteTier,
  onRefreshStore,
}) => {
  const [copied, setCopied] = useState(false);
  const [votingTier, setVotingTier] = useState<LunchTier | null>(null);
  const [voteError, setVoteError] = useState<string | null>(null);

  if (!meal || meal.dishes.length === 0) {
    return (
      <div className="py-14 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center">
        <Trophy className="w-12 h-12 text-amber-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-800">
          티어를 매길 급식 메뉴가 없습니다
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          급식 식단이 있는 평일 날짜를 선택해 주세요.
        </p>
      </div>
    );
  }

  // Calculate day summary with custom user ratings
  const summary = calculateMealOverallTier(meal.dishes, customTiers);
  const overallConfig = TIER_CONFIGS[summary.overallTier];

  // Group dishes by tier for the Tier Board
  const dishesByTier: Record<LunchTier, DishItem[]> = {
    S: [],
    A: [],
    B: [],
    C: [],
    F: [],
  };

  meal.dishes.forEach((dish) => {
    const tier = customTiers[dish.name] || getDefaultDishTier(dish.name);
    dishesByTier[tier].push(dish);
  });

  // Copy tier list to clipboard
  const handleCopyTierSummary = async () => {
    let text = `🏆 [세종다정고 ${meal.dateFormatted} (${meal.dayOfWeek}) 급식 티어표]\n`;
    text += `👑 종합 판정: ${summary.overallTier}티어 (${summary.title})\n\n`;

    TIERS_LIST.forEach((tier) => {
      const items = dishesByTier[tier];
      if (items.length > 0) {
        text += `[${tier} 티어] ${items.map((d) => d.name).join(', ')}\n`;
      }
    });

    text += `\n💬 한줄평: ${summary.comment}\n`;
    text += `출처: 다정고 급식 식단 앱`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('티어표가 복사되었습니다:\n\n' + text);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. 오늘의 종합 티어 판정 배너 */}
      <div
        className={`p-4 rounded-3xl border ${overallConfig.borderColor} ${overallConfig.bgLight} shadow-sm transition-all`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* 큰 티어 뱃지 */}
            <div
              className={`w-14 h-14 rounded-2xl ${overallConfig.badgeBg} ${overallConfig.badgeText} flex flex-col items-center justify-center font-black shadow-md shrink-0`}
            >
              <span className="text-xs leading-none opacity-90">{overallConfig.icon}</span>
              <span className="text-2xl leading-none mt-0.5">{summary.overallTier}</span>
            </div>

            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                오늘의 급식 종합 티어
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {summary.title}
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">{summary.comment}</p>
            </div>
          </div>
        </div>

        {/* 티어별 메뉴 개수 미니 카운터 */}
        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-500">티어별 반찬 수:</span>
          <div className="flex items-center gap-2">
            {TIERS_LIST.map((tier) => (
              <span
                key={tier}
                className={`px-1.5 py-0.5 rounded-md text-[11px] ${
                  dishesByTier[tier].length > 0
                    ? `${TIER_CONFIGS[tier].badgeBg} text-white`
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {tier}: {dishesByTier[tier].length}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. 시각적인 급식 티어 보드 (Tier Board) */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h4 className="text-xs sm:text-sm font-bold tracking-tight">
              다정고 급식 티어 보드
            </h4>
          </div>
          <button
            type="button"
            onClick={onResetTiers}
            className="flex items-center gap-1 text-[11px] font-semibold text-slate-300 hover:text-white cursor-pointer"
            title="기본 티어로 되돌리기"
          >
            <RotateCcw className="w-3 h-3" />
            <span>초기화</span>
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {TIERS_LIST.map((tier) => {
            const config = TIER_CONFIGS[tier];
            const items = dishesByTier[tier];

            return (
              <div key={tier} className="flex min-h-[52px]">
                {/* 좌측 티어 라벨 */}
                <div
                  className={`w-14 sm:w-16 ${config.badgeBg} ${config.badgeText} flex flex-col items-center justify-center font-black text-lg shrink-0 select-none`}
                >
                  <span className="text-xs">{config.icon}</span>
                  <span className="leading-none">{tier}</span>
                </div>

                {/* 우측 메뉴 태그들 */}
                <div className="flex-1 p-2 bg-slate-50/50 flex flex-wrap items-center gap-1.5">
                  {items.length > 0 ? (
                    items.map((dish) => (
                      <span
                        key={dish.name}
                        className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold shadow-2xs inline-flex items-center gap-1"
                      >
                        <span>{dish.name}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic px-2">
                      배치된 메뉴 없음
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. 메뉴별 직접 티어 매기기 컨트롤러 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>내 입맛대로 티어 바꾸기 (버튼 탭)</span>
          </h4>
          <span className="text-[11px] text-slate-500">
            실시간 티어판에 반영됩니다
          </span>
        </div>

        <div className="space-y-2">
          {meal.dishes.map((dish, idx) => {
            const activeTier = customTiers[dish.name] || getDefaultDishTier(dish.name);

            return (
              <div
                key={dish.name}
                className="p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-900 truncate">
                    {dish.name}
                  </span>
                </div>

                {/* S A B C F 버튼 그룹 */}
                <div className="flex items-center gap-1 self-end sm:self-auto">
                  {TIERS_LIST.map((t) => {
                    const isSelected = activeTier === t;
                    const conf = TIER_CONFIGS[t];

                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onSetDishTier(dish.name, t)}
                        className={`w-9 h-8 sm:w-10 sm:h-9 rounded-xl font-black text-xs sm:text-sm transition-all cursor-pointer ${
                          isSelected
                            ? `${conf.badgeBg} text-white shadow-xs scale-105`
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                        title={`${dish.name}을(를) ${t} 티어로 설정`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 다정고 친구들의 실시간 급식 티어 투표 (store 저장소) */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                우리 학교 친구들 오늘 급식 티어 투표
              </h4>
              <p className="text-[11px] text-slate-500">
                오늘 급식은 몇 티어인가요? 한 번 눌러 투표해 보세요!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void onRefreshStore()}
            disabled={storeLoading}
            className="px-2.5 py-1 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-slate-700 flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${storeLoading ? 'animate-spin' : ''}`} />
            <span>새로 고침</span>
          </button>
        </div>

        {(storeError || voteError) && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{voteError || storeError}</span>
          </div>
        )}

        {(() => {
          const voteCounts: Record<LunchTier, number> = { S: 0, A: 0, B: 0, C: 0, F: 0 };
          let totalVotes = 0;

          storeItems.forEach((item) => {
            if (item?.data?.type === 'vote' && item.data?.date === meal.date) {
              const choice = item.data?.choice;
              if (
                choice === 'S' ||
                choice === 'A' ||
                choice === 'B' ||
                choice === 'C' ||
                choice === 'F'
              ) {
                voteCounts[choice] += 1;
                totalVotes += 1;
              }
            }
          });

          const handleVote = async (tier: LunchTier) => {
            setVoteError(null);
            setVotingTier(tier);
            try {
              await onVoteTier(meal.date, tier);
            } catch (err) {
              setVoteError(
                err instanceof Error ? err.message : '투표를 저장하지 못했어요.'
              );
            } finally {
              setVotingTier(null);
            }
          };

          return (
            <div className="space-y-2">
              <div className="grid grid-cols-5 gap-1.5">
                {TIERS_LIST.map((t) => {
                  const conf = TIER_CONFIGS[t];
                  const count = voteCounts[t];
                  const pct =
                    totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;

                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={votingTier !== null}
                      onClick={() => void handleVote(t)}
                      className="p-2 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 flex flex-col items-center gap-0.5 transition-all cursor-pointer disabled:opacity-60 active:scale-95"
                    >
                      <span
                        className={`w-7 h-7 rounded-lg ${conf.badgeBg} ${conf.badgeText} font-black text-xs flex items-center justify-center`}
                      >
                        {t}
                      </span>
                      <span className="text-xs font-black text-slate-900 tabular-nums mt-0.5">
                        {count}표
                      </span>
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {pct}%
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 text-right font-semibold tabular-nums">
                총 {totalVotes}명 참여
              </p>
            </div>
          );
        })()}
      </div>

      {/* 5. 친구들에게 공유하기 버튼 */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCopyTierSummary}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-[0.99]"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>티어표 복사 완료! 카카오톡에 붙여넣기하세요</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>오늘의 급식 티어표 친구들에게 공유하기</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
