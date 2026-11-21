/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, Utensils, Sparkles, Moon, Sun } from 'lucide-react';

export const LunchCountdown: React.FC = () => {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const dayOfWeek = now.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();
  const totalSecondsToday = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

  const lunchStartSeconds = 12 * 3600 + 30 * 60; // 12:30:00
  const lunchEndSeconds = 13 * 3600 + 30 * 60; // 13:30:00

  // 1. Weekend State
  if (isWeekend) {
    return (
      <div className="mx-3 sm:mx-4 mb-2.5 px-3.5 py-2 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-200/80 rounded-2xl flex items-center justify-between text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-extrabold flex items-center gap-1">
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>주말 휴일 충전 중</span>
          </span>
          <span className="text-amber-800 hidden sm:inline">
            월요일에 맛있는 급식이 기다리고 있어요!
          </span>
        </div>
        <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
          다음 주 식단 조회 가능
        </span>
      </div>
    );
  }

  // 2. Before Lunch State (00:00 ~ 12:29:59)
  if (totalSecondsToday < lunchStartSeconds) {
    const remainingSeconds = lunchStartSeconds - totalSecondsToday;
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    const formattedTime = `${hours > 0 ? `${hours}시간 ` : ''}${String(minutes).padStart(2, '0')}분 ${String(seconds).padStart(2, '0')}초`;

    // 4교시(11:30 이후)인지 여부
    const isFourthPeriod = currentHours >= 11 && currentMinutes >= 30;

    return (
      <div className="mx-3 sm:mx-4 mb-2.5 px-3.5 py-2 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 rounded-2xl flex items-center justify-between text-xs text-orange-950 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Clock className="w-3.5 h-3.5" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-extrabold text-slate-800 truncate">
              {isFourthPeriod ? '🔔 4교시 배고플 시간!' : '🍱 점심시간(12:30)까지'}
            </span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="font-black text-orange-600 tabular-nums text-xs sm:text-sm tracking-tight shrink-0">
              {formattedTime}
            </span>
          </div>
        </div>

        <span className="text-[10px] sm:text-[11px] font-black bg-orange-500 text-white px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
          카운트다운 중
        </span>
      </div>
    );
  }

  // 3. During Lunch State (12:30 ~ 13:30)
  if (totalSecondsToday >= lunchStartSeconds && totalSecondsToday < lunchEndSeconds) {
    const remainingSeconds = lunchEndSeconds - totalSecondsToday;
    const minutes = Math.floor(remainingSeconds / 60);

    return (
      <div className="mx-3 sm:mx-4 mb-2.5 px-3.5 py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white rounded-2xl flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
          <span className="font-black text-sm flex items-center gap-1">
            <Utensils className="w-4 h-4" />
            <span>지금은 신나는 점심시간! 맛있게 드세요 🍚</span>
          </span>
        </div>
        <span className="text-[11px] font-extrabold bg-white/20 px-2 py-0.5 rounded-md tabular-nums">
          점심시간 종료까지 {minutes}분
        </span>
      </div>
    );
  }

  // 4. After Lunch State (13:30 ~ 23:59:59)
  return (
    <div className="mx-3 sm:mx-4 mb-2.5 px-3.5 py-2 bg-slate-100 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-600">
      <div className="flex items-center gap-2">
        <Moon className="w-3.5 h-3.5 text-indigo-500" />
        <span className="font-bold text-slate-700">
          오늘의 점심 급식이 완료되었습니다!
        </span>
      </div>
      <span className="text-[11px] font-semibold text-slate-500">
        내일 급식 메뉴를 미리 확인해보세요 🌙
      </span>
    </div>
  );
};
