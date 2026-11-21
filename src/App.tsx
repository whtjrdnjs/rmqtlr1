/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Utensils,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ShieldAlert,
  Flame,
  Share2,
  Check,
  Calendar,
  Sparkles,
  MapPin,
  Info,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  ShieldCheck,
  Trophy,
  Search,
  Heart,
  HelpCircle,
} from 'lucide-react';
import { DailyMeal, ALLERGEN_MAP, LunchTier, TIER_CONFIGS } from './types/meal';
import {
  SCHOOL_INFO,
  formatDateYMD,
  getMondayOfWeek,
  addDays,
  fetchWeeklyMeals,
} from './services/neisMealService';
import { store, StoreRecord } from './services/storeService';
import { calculateMealOverallTier, getDefaultDishTier } from './services/tierService';
import { AllergyModal } from './components/AllergyModal';
import { NutritionModal } from './components/NutritionModal';
import { WeeklyAllergyCautionCard } from './components/WeeklyAllergyCautionCard';
import { TierMakerView } from './components/TierMakerView';
import { LunchCountdown } from './components/LunchCountdown';
import { NutritionMacroCard } from './components/NutritionMacroCard';
import { MenuSearchModal } from './components/MenuSearchModal';
import { WeeklyGridView } from './components/WeeklyGridView';
import { MealHelperView } from './components/MealHelperView';

type FontSize = 'normal' | 'large' | 'xlarge';
type MainTab = 'daily' | 'weekly' | 'tier' | 'helper';

function getTabFromHash(): MainTab {
  if (typeof window === 'undefined') return 'daily';
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash === 'weekly' || hash === 'tier' || hash === 'helper' || hash === 'daily') {
    return hash;
  }
  return 'daily';
}

export default function App() {
  // Main view tab synced with hash (#/daily, #/weekly, #/tier, #/helper)
  const [activeTab, setActiveTabState] = useState<MainTab>(getTabFromHash);

  const setActiveTab = useCallback((tab: MainTab) => {
    setActiveTabState(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = `#/${tab}`;
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setActiveTabState(getTabFromHash());
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Selected Monday of current viewing week
  const [viewMonday, setViewMonday] = useState<Date>(() => getMondayOfWeek(new Date()));

  // Selected Day Index: 0: 월, 1: 화, 2: 수, 3: 목, 4: 금
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => {
    const day = new Date().getDay();
    if (day >= 1 && day <= 5) {
      return day - 1;
    }
    return 0; // Weekend defaults to Monday
  });

  // Weekly meals state
  const [weeklyMeals, setWeeklyMeals] = useState<DailyMeal[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);

  // User personal allergen preferences (saved in localStorage)
  const [userAllergens, setUserAllergens] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('dajeong_my_allergens');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 1. 내 최애 메뉴 찜 목록 (saved in localStorage)
  const [favoriteDishes, setFavoriteDishes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('dajeong_favorites');
      return saved ? JSON.parse(saved) : ['치즈돈가스/소스', '스팸김치찌개', '닭강정', '치킨'];
    } catch {
      return ['치즈돈가스/소스', '스팸김치찌개', '닭강정', '치킨'];
    }
  });

  // User custom dish tiers (saved in localStorage)
  const [customTiers, setCustomTiers] = useState<Record<string, LunchTier>>(() => {
    try {
      const saved = localStorage.getItem('dajeong_dish_tiers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Safe dishes filter: hide dishes containing allergens
  const [showSafeOnly, setShowSafeOnly] = useState<boolean>(false);

  // Font size state
  const [fontSize, setFontSize] = useState<FontSize>('normal');

  // Modals state
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('오늘 다정고 급식 메뉴가 복사되었습니다!');

  // Shared store state (loaded on mount, after saving, and on manual refresh only)
  const [storeItems, setStoreItems] = useState<StoreRecord[]>([]);
  const [storeLoading, setStoreLoading] = useState<boolean>(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  // 로그인 기능은 다음 요청에서 넣기로 하여 현재 로그인 사용자는 null
  const currentUser: string | null = null;

  const refreshStore = useCallback(async () => {
    setStoreLoading(true);
    setStoreError(null);
    try {
      const res = await store('list');
      setStoreItems(Array.isArray(res.items) ? res.items : []);
    } catch (err) {
      setStoreError(
        err instanceof Error ? err.message : '저장소를 불러오지 못했어요.'
      );
    } finally {
      setStoreLoading(false);
    }
  }, []);

  // Load meals for the current viewing week
  const loadWeek = useCallback(async (monday: Date) => {
    setIsLoading(true);
    try {
      const res = await fetchWeeklyMeals(monday);
      setWeeklyMeals(res.meals);
      setIsLiveConnected(res.isLive);
    } catch (err) {
      console.error('Failed to load meals', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWeek(viewMonday);
  }, [viewMonday, loadWeek]);

  // 앱을 열 때 한 번만 store('list') 호출 (자동 주기 호출 없음)
  useEffect(() => {
    void refreshStore();
  }, [refreshStore]);

  const handleVoteTier = useCallback(
    async (date: string, choice: LunchTier) => {
      await store('add', { data: { type: 'vote', date, choice } });
      await refreshStore();
    },
    [refreshStore]
  );

  const handleAddWish = useCallback(
    async (menu: string, reason: string) => {
      await store('add', { data: { type: 'wish', menu, reason } });
      await refreshStore();
    },
    [refreshStore]
  );

  const handleUpdateWish = useCallback(
    async (id: string, menu: string, reason: string) => {
      await store('update', { id, data: { type: 'wish', menu, reason } });
      await refreshStore();
    },
    [refreshStore]
  );

  const handleDeleteWish = useCallback(
    async (id: string) => {
      await store('delete', { id });
      await refreshStore();
    },
    [refreshStore]
  );

  // Persist user allergens
  useEffect(() => {
    try {
      localStorage.setItem('dajeong_my_allergens', JSON.stringify(userAllergens));
    } catch {
      // ignore
    }
  }, [userAllergens]);

  // Persist favorite dishes
  useEffect(() => {
    try {
      localStorage.setItem('dajeong_favorites', JSON.stringify(favoriteDishes));
    } catch {
      // ignore
    }
  }, [favoriteDishes]);

  // Persist custom tiers
  useEffect(() => {
    try {
      localStorage.setItem('dajeong_dish_tiers', JSON.stringify(customTiers));
    } catch {
      // ignore
    }
  }, [customTiers]);

  // Dates for Monday through Friday of viewing week
  const weekDays = useMemo(() => {
    const days: { index: number; name: string; date: Date; ymd: string; isToday: boolean }[] = [];
    const todayYMD = formatDateYMD(new Date());

    const dayLabels = ['월', '화', '수', '목', '금'];
    for (let i = 0; i < 5; i++) {
      const d = addDays(viewMonday, i);
      const ymd = formatDateYMD(d);
      days.push({
        index: i,
        name: dayLabels[i],
        date: d,
        ymd,
        isToday: ymd === todayYMD,
      });
    }
    return days;
  }, [viewMonday]);

  // Currently selected meal
  const currentSelectedDate = weekDays[selectedDayIndex];
  const activeMeal = useMemo(() => {
    if (weeklyMeals.length === 0) return null;
    if (!currentSelectedDate) return weeklyMeals[0];
    return (
      weeklyMeals.find((m) => m.date === currentSelectedDate.ymd) ||
      weeklyMeals[selectedDayIndex] ||
      weeklyMeals[0]
    );
  }, [weeklyMeals, currentSelectedDate, selectedDayIndex]);

  // Overall tier calculation for the currently active meal
  const activeMealTierSummary = useMemo(() => {
    if (!activeMeal || activeMeal.dishes.length === 0) return null;
    return calculateMealOverallTier(activeMeal.dishes, customTiers);
  }, [activeMeal, customTiers]);

  // Check if a day has user allergens (Caution Day calculation)
  const dayCautionMap = useMemo(() => {
    const map = new Map<string, { count: number; allergenNames: string[] }>();
    if (userAllergens.length === 0) return map;

    weeklyMeals.forEach((meal) => {
      const hitAllergens = new Set<string>();
      let hitDishCount = 0;

      meal.dishes.forEach((dish) => {
        const dishHits = dish.allergenCodes.filter((c) => userAllergens.includes(c));
        if (dishHits.length > 0) {
          hitDishCount++;
          dishHits.forEach((code) => {
            hitAllergens.add(ALLERGEN_MAP[code]?.shortName || `${code}`);
          });
        }
      });

      if (hitDishCount > 0) {
        map.set(meal.date, {
          count: hitDishCount,
          allergenNames: Array.from(hitAllergens),
        });
      }
    });

    return map;
  }, [weeklyMeals, userAllergens]);

  // Check which days in the week contain user's favorite dishes
  const weekFavoriteSummary = useMemo(() => {
    const hits: { dayName: string; dayIndex: number; dateStr: string; dishName: string }[] = [];

    weekDays.forEach((day) => {
      const meal = weeklyMeals.find((m) => m.date === day.ymd);
      if (meal) {
        meal.dishes.forEach((dish) => {
          if (favoriteDishes.includes(dish.name)) {
            hits.push({
              dayName: day.name,
              dayIndex: day.index,
              dateStr: `${day.date.getMonth() + 1}.${day.date.getDate()}`,
              dishName: dish.name,
            });
          }
        });
      }
    });

    return hits;
  }, [weekDays, weeklyMeals, favoriteDishes]);

  // Active day's caution info
  const activeDayCaution = activeMeal ? dayCautionMap.get(activeMeal.date) : null;

  // Navigate weeks
  const handlePrevWeek = () => {
    setViewMonday((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setViewMonday((prev) => addDays(prev, 7));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    const mon = getMondayOfWeek(now);
    setViewMonday(mon);
    const day = now.getDay();
    if (day >= 1 && day <= 5) {
      setSelectedDayIndex(day - 1);
    } else {
      setSelectedDayIndex(0); // Weekend jumps to Monday
    }
    setActiveTab('daily');
  };

  // Jump to specific YMD from search
  const handleJumpToDate = (targetYMD: string) => {
    const y = parseInt(targetYMD.slice(0, 4), 10);
    const m = parseInt(targetYMD.slice(4, 6), 10) - 1;
    const d = parseInt(targetYMD.slice(6, 8), 10);
    const targetDate = new Date(y, m, d);

    const targetMonday = getMondayOfWeek(targetDate);
    setViewMonday(targetMonday);

    const day = targetDate.getDay();
    if (day >= 1 && day <= 5) {
      setSelectedDayIndex(day - 1);
    } else {
      setSelectedDayIndex(0);
    }
    setActiveTab('daily');
  };

  // Day selection with light vibration
  const handleSelectDay = (index: number) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // ignore
      }
    }
    setSelectedDayIndex(index);
    if (activeTab === 'weekly') {
      setActiveTab('daily');
    }
  };

  // Toggle allergen in personal filter
  const handleToggleAllergen = (code: number) => {
    setUserAllergens((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleClearAllergens = () => {
    setUserAllergens([]);
  };

  // Toggle favorite dish
  const handleToggleFavorite = (dishName: string) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // ignore
      }
    }
    setFavoriteDishes((prev) => {
      const isFav = prev.includes(dishName);
      const next = isFav ? prev.filter((d) => d !== dishName) : [...prev, dishName];
      setToastMessage(isFav ? `'${dishName}' 찜 해제됨` : `💖 '${dishName}' 최애 메뉴로 찜했습니다!`);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
      return next;
    });
  };

  // Set dish tier
  const handleSetDishTier = (dishName: string, tier: LunchTier) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(10);
      } catch {
        // ignore
      }
    }
    setCustomTiers((prev) => ({
      ...prev,
      [dishName]: tier,
    }));
  };

  // Reset custom tiers to default
  const handleResetTiers = () => {
    if (!activeMeal) return;
    const next = { ...customTiers };
    activeMeal.dishes.forEach((d) => {
      delete next[d.name];
    });
    setCustomTiers(next);
  };

  // Copy meal text to clipboard
  const handleCopyMenu = async () => {
    if (!activeMeal || activeMeal.dishes.length === 0) return;

    const dishList = activeMeal.dishes.map((d, i) => `${i + 1}. ${d.name}`).join('\n');
    const tierNote = activeMealTierSummary
      ? `👑 급식 판정: ${activeMealTierSummary.overallTier}티어 (${activeMealTierSummary.title})\n`
      : '';
    const textToCopy = `[세종다정고 급식 식단]\n📅 ${activeMeal.dateFormatted} (${activeMeal.dayOfWeek}) ${activeMeal.mealName}\n${tierNote}\n${dishList}\n\n🔥 열량: ${activeMeal.calories || '정보 없음'}\n출처: 세종다정고등학교 급식실`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setToastMessage('오늘 다정고 급식 메뉴가 복사되었습니다!');
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    } catch {
      alert('식단이 복사되었습니다:\n\n' + textToCopy);
    }
  };

  // Font size classes
  const fontClasses = {
    dishName:
      fontSize === 'normal'
        ? 'text-lg sm:text-xl font-bold'
        : fontSize === 'large'
        ? 'text-xl sm:text-2xl font-extrabold'
        : 'text-2xl sm:text-3xl font-black',
  };

  // Check if a dish has user allergens
  const getDishUserAllergies = (allergenCodes: number[]) => {
    return allergenCodes.filter((code) => userAllergens.includes(code));
  };

  // Week range label (e.g., "10.26 ~ 10.30")
  const weekRangeLabel = useMemo(() => {
    const start = viewMonday;
    const end = addDays(viewMonday, 4);
    const startStr = `${start.getMonth() + 1}.${start.getDate()}`;
    const endStr = `${end.getMonth() + 1}.${end.getDate()}`;
    return `${startStr} ~ ${endStr}`;
  }, [viewMonday]);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start p-2 sm:p-5 text-slate-800">
      
      {/* 토스트 알림 */}
      {copiedToast && (
        <div className="fixed top-5 z-50 px-4 py-2.5 bg-slate-900/90 text-white text-sm font-semibold rounded-2xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-150 backdrop-blur-xs">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 메인 모바일 최적화 컨테이너 */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/80 flex flex-col overflow-hidden my-auto">
        
        {/* 1. 상단 학교 브랜드 헤더 */}
        <header className="px-5 pt-5 pb-3 bg-gradient-to-b from-amber-50/80 via-white to-white border-b border-amber-100/70">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                <Utensils className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    세종다정고등학교
                  </h1>
                </div>
                <p className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center gap-1">
                  <span>다정다감 배움터</span>
                  <span>·</span>
                  <span className="text-amber-800 font-bold">급식 식단 & 스마트 알림</span>
                </p>
              </div>
            </div>

            {/* NEIS 실시간 연동 배지 & 오늘 이동 & 검색 버튼 */}
            <div className="flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-1.5">
                {/* 2. 메뉴 검색 버튼 */}
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-extrabold flex items-center gap-1 transition-colors cursor-pointer"
                  title="메뉴 검색"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>검색</span>
                </button>

                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
                    isLiveConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                  title="교육부 NEIS 공식 데이터 연동"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>NEIS</span>
                </span>
              </div>

              <button
                type="button"
                onClick={handleJumpToToday}
                className="text-xs text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>오늘로 이동</span>
              </button>
            </div>
          </div>

          {/* 메인 4대 모드 전환 탭: [오늘 식단] [5일 한눈에] [급식 티어] [질문·신청] */}
          <div className="mt-3.5 p-1 bg-slate-100 rounded-2xl grid grid-cols-4 gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('daily')}
              className={`py-2 px-1.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'daily'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Utensils className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>오늘 식단</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('weekly')}
              className={`py-2 px-1.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'weekly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>5일 한눈에</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tier')}
              className={`py-2 px-1.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tier'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>급식 티어</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('helper')}
              className={`py-2 px-1.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'helper'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>질문·신청</span>
            </button>
          </div>

          {/* 눈에 띄는 "치킨 언제 나와?" 메뉴 검색바 버튼 */}
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full py-2.5 px-3.5 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/90 text-xs font-bold text-amber-950 flex items-center justify-between transition-all shadow-3xs cursor-pointer group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform shrink-0" />
                <span className="truncate">🔍 "치킨, 돈가스 언제 나와?" 메뉴 검색</span>
              </div>
              <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-md shrink-0 shadow-3xs">
                검색하기
              </span>
            </button>
          </div>

          {/* 서브 유틸리티 바: 글자 크기 & 최애 찜 & 알레르기 설정 */}
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            {/* 글자 크기 조절 */}
            <div className="flex items-center gap-1">
              <span className="text-slate-400 font-medium mr-1">글자</span>
              {(['normal', 'large', 'xlarge'] as FontSize[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-0.8 rounded-md font-bold transition-colors cursor-pointer ${
                    fontSize === size
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {size === 'normal' ? '보통' : size === 'large' ? '크게' : '아주크게'}
                </button>
              ))}
            </div>

            {/* 우측 찜 & 알레르기 설정 배지 */}
            <div className="flex items-center gap-1.5">
              {/* 내 최애 메뉴 개수 */}
              <span
                className="px-2 py-1 rounded-xl bg-rose-50 text-rose-700 font-bold border border-rose-200 flex items-center gap-1 text-[11px]"
                title="내가 찜한 최애 메뉴 수"
              >
                <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                <span>최애 {favoriteDishes.length}개</span>
              </span>

              {/* 내 알레르기 설정 버튼 */}
              <button
                type="button"
                onClick={() => setIsAllergyModalOpen(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                  userAllergens.length > 0
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>
                  알레르기{userAllergens.length > 0 ? ` (${userAllergens.length})` : ''}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* 3. 점심시간 실시간 카운트다운 타이머 (12:30 기준) */}
        <div className="pt-2.5">
          <LunchCountdown />
        </div>

        {/* 1. 최애 메뉴 나오는 날 상단 알림 배너 */}
        {weekFavoriteSummary.length > 0 && (
          <div className="mx-3 sm:mx-4 mb-2 p-2.5 sm:p-3 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-950 shadow-3xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-3xs">
                <Heart className="w-4 h-4 fill-white" />
              </span>
              <div className="min-w-0">
                <p className="font-extrabold text-rose-900 truncate flex items-center gap-1.5">
                  <span>이번 주 내 최애 메뉴 등장!</span>
                  <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.2 rounded-md font-bold">
                    총 {weekFavoriteSummary.length}건
                  </span>
                </p>
                <p className="text-[11px] text-rose-700 truncate mt-0.5">
                  {weekFavoriteSummary.map((f) => `${f.dayName}요일(${f.dishName})`).join(' · ')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleSelectDay(weekFavoriteSummary[0].dayIndex)}
              className="px-2.5 py-1 rounded-xl bg-white border border-rose-200 text-rose-800 font-extrabold text-[11px] shadow-3xs hover:bg-rose-50 shrink-0 cursor-pointer ml-1"
            >
              보러가기
            </button>
          </div>
        )}

        {/* 주간 이동 네비게이션 */}
        <div className="px-4 pt-2 pb-1 flex items-center justify-between bg-slate-50/70 border-b border-slate-100">
          <button
            type="button"
            onClick={handlePrevWeek}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-200/70 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            aria-label="이전 주"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 주</span>
          </button>

          <div className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>{weekRangeLabel}</span>
          </div>

          <button
            type="button"
            onClick={handleNextWeek}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-slate-200/70 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            aria-label="다음 주"
          >
            <span>다음 주</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* 이번 주 알레르기 주의 요일 요약 카드 (일별 보기 모드일 때 우선 표시) */}
        {activeTab === 'daily' && (
          <div className="pt-2.5">
            <WeeklyAllergyCautionCard
              weekDays={weekDays}
              weeklyMeals={weeklyMeals}
              userAllergens={userAllergens}
              selectedDayIndex={selectedDayIndex}
              onSelectDay={handleSelectDay}
              onOpenAllergyModal={() => setIsAllergyModalOpen(true)}
              onToggleAllergen={handleToggleAllergen}
            />
          </div>
        )}

        {/* 상단 5개 요일 탭 버튼 (월·화·수·목·금) */}
        {(activeTab === 'daily' || activeTab === 'tier') && (
          <nav className="px-3 pt-1 pb-2" aria-label="요일 선택">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {weekDays.map((day) => {
                const isSelected = selectedDayIndex === day.index;
                const dayMeal = weeklyMeals.find((m) => m.date === day.ymd);
                const hasMeal = Boolean(dayMeal && dayMeal.dishes.length > 0);
                const cautionInfo = dayCautionMap.get(day.ymd);
                const isCautionDay = Boolean(cautionInfo && cautionInfo.count > 0);

                // Day has favorite menu check
                const dayHasFavorite = dayMeal
                  ? dayMeal.dishes.some((d) => favoriteDishes.includes(d.name))
                  : false;

                // Mini tier for day tab
                const dayTier = dayMeal ? calculateMealOverallTier(dayMeal.dishes, customTiers).overallTier : null;

                return (
                  <button
                    key={day.index}
                    type="button"
                    onClick={() => handleSelectDay(day.index)}
                    className={`relative flex flex-col items-center justify-center py-2.5 sm:py-3.5 px-1 rounded-2xl transition-all duration-150 cursor-pointer min-h-[66px] sm:min-h-[72px] focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-400 select-none ${
                      isSelected
                        ? activeTab === 'tier'
                          ? 'bg-gradient-to-b from-amber-500 to-orange-500 text-white shadow-lg shadow-orange-500/30 scale-[1.03] font-bold ring-2 ring-amber-300'
                          : isCautionDay
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 scale-[1.03] font-bold ring-2 ring-rose-300'
                          : 'bg-amber-500 text-white shadow-lg shadow-amber-500/25 scale-[1.02] font-bold'
                        : isCautionDay
                        ? 'bg-rose-50 hover:bg-rose-100 text-rose-900 border-2 border-rose-300 font-bold active:scale-95'
                        : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold active:scale-95'
                    }`}
                    aria-pressed={isSelected}
                  >
                    {/* 오늘 표시 뱃지 */}
                    {day.isToday && (
                      <span
                        className={`absolute -top-2 px-1.5 py-0.2 rounded-full text-[10px] font-extrabold tracking-tight shadow-xs ${
                          isSelected
                            ? 'bg-slate-900 text-white'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        오늘
                      </span>
                    )}

                    {/* 최애 메뉴 표시 하트 */}
                    {dayHasFavorite && !day.isToday && (
                      <span className="absolute -top-2 px-1 py-0.2 rounded-full text-[9px] font-black bg-rose-500 text-white shadow-xs flex items-center gap-0.5">
                        <Heart className="w-2.5 h-2.5 fill-current" />
                      </span>
                    )}

                    {/* 주의해야 하는 날 배지 */}
                    {isCautionDay && !day.isToday && !dayHasFavorite && (
                      <span className="absolute -top-2 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white shadow-xs flex items-center gap-0.5">
                        <span>⚠️주의</span>
                      </span>
                    )}

                    <span className="text-xl sm:text-2xl font-black leading-none">
                      {day.name}
                    </span>

                    <span
                      className={`text-[11px] sm:text-xs mt-1 leading-none tabular-nums font-semibold ${
                        isSelected
                          ? 'text-white'
                          : isCautionDay
                          ? 'text-rose-700 font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      {day.date.getMonth() + 1}.{day.date.getDate()}
                    </span>

                    {/* 하단 미니 티어 뱃지 or 점 */}
                    <div className="mt-1 flex items-center justify-center">
                      {dayTier ? (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-md font-black leading-tight ${
                            isSelected
                              ? 'bg-white text-slate-900'
                              : TIER_CONFIGS[dayTier].badgeBg + ' text-white'
                          }`}
                        >
                          {dayTier}급
                        </span>
                      ) : (
                        <span
                          className={`w-1 h-1 rounded-full ${
                            isSelected
                              ? 'bg-white'
                              : hasMeal
                              ? 'bg-amber-400'
                              : 'bg-transparent'
                          }`}
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* 4. 가운데 메인 컨텐츠 영역: [오늘 식단] vs [5일 한눈에] vs [급식 티어] */}
        <main className="px-4 py-2 flex-1 flex flex-col justify-start">
          
          {/* A. 5일 한눈에 보기 모드 (Feature #6) */}
          {activeTab === 'weekly' ? (
            <WeeklyGridView
              weekDays={weekDays}
              weeklyMeals={weeklyMeals}
              userAllergens={userAllergens}
              favoriteDishes={favoriteDishes}
              customTiers={customTiers}
              onSelectDay={handleSelectDay}
              onToggleFavorite={handleToggleFavorite}
              weekRangeLabel={weekRangeLabel}
            />
          ) : activeTab === 'helper' ? (
            /* B-2. 급식 도우미 Q&A & 희망 급식 신청함 모드 */
            <MealHelperView
              storeItems={storeItems}
              storeLoading={storeLoading}
              storeError={storeError}
              currentUser={currentUser}
              onRefreshStore={refreshStore}
              onAddWish={handleAddWish}
              onDeleteWish={handleDeleteWish}
              onUpdateWish={handleUpdateWish}
            />
          ) : activeTab === 'tier' ? (
            /* B. 급식 티어 매기기 모드 */
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span>
                      {currentSelectedDate.date.getMonth() + 1}월 {currentSelectedDate.date.getDate()}일 ({currentSelectedDate.name}) 급식 티어 매기기
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    내가 직접 평가하고 친구들과 함께 투표하는 세종다정고 급식 티어
                  </p>
                </div>
              </div>

              <TierMakerView
                meal={activeMeal}
                customTiers={customTiers}
                onSetDishTier={handleSetDishTier}
                onResetTiers={handleResetTiers}
                storeItems={storeItems}
                storeLoading={storeLoading}
                storeError={storeError}
                onVoteTier={handleVoteTier}
                onRefreshStore={refreshStore}
              />
            </div>
          ) : (
            /* C. 오늘·일별 식단표 모드 */
            <div>
              {/* 식단 타이틀 & 칼로리 헤더 & 티어 배지 */}
              <div className="flex items-center justify-between mb-2 px-1">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {currentSelectedDate.date.getMonth() + 1}월 {currentSelectedDate.date.getDate()}일 ({currentSelectedDate.name})
                    </h2>
                    <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-amber-100 text-amber-800">
                      {activeMeal?.mealName || '중식'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    세종다정고 학생 건강 맞춤 식단
                  </p>
                </div>

                {/* 티어 뱃지 & 칼로리 표시 */}
                <div className="flex items-center gap-2">
                  {activeMealTierSummary && (
                    <button
                      type="button"
                      onClick={() => setActiveTab('tier')}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-black text-xs shadow-xs cursor-pointer ${
                        TIER_CONFIGS[activeMealTierSummary.overallTier].badgeBg
                      } text-white hover:opacity-90 active:scale-95 transition-all`}
                      title="급식 티어 매기기로 이동"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span>{activeMealTierSummary.overallTier}티어</span>
                    </button>
                  )}

                  {activeMeal?.calories && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-950">
                      <Flame className="w-4 h-4 text-orange-600 shrink-0" />
                      <span className="text-sm sm:text-base font-extrabold tabular-nums">
                        {activeMeal.calories}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* 주의해야 하는 날 상세 경고 배너 */}
              {activeDayCaution && (
                <div className="mb-3 p-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="text-sm font-black tracking-tight">
                      오늘은 {activeDayCaution.allergenNames.join(', ')} 알레르기 주의하는 날입니다!
                    </p>
                    <p className="text-rose-100 mt-0.5 leading-relaxed">
                      총 <strong>{activeDayCaution.count}개 메뉴</strong>에 주의 성분이 들어있습니다. 배식 시 해당 음식을 제외하거나 대체식을 이용하세요.
                    </p>

                    {/* 안심 메뉴만 보기 토글 버튼 */}
                    <button
                      type="button"
                      onClick={() => setShowSafeOnly((prev) => !prev)}
                      className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white text-rose-900 font-extrabold text-xs shadow-xs hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      {showSafeOnly ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{showSafeOnly ? '전체 메뉴 다시보기' : '먹을 수 있는 안심 메뉴만 보기'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 알레르기가 등록되어 있으나 오늘은 안심인 경우 안내 */}
              {userAllergens.length > 0 && !activeDayCaution && activeMeal && activeMeal.dishes.length > 0 && (
                <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>오늘은 등록하신 알레르기 유발 식품이 없는 안심 식단입니다.</span>
                  </span>
                </div>
              )}

              {/* 식단 리스트 */}
              {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm font-semibold text-slate-600">
                    세종다정고 식단을 불러오는 중...
                  </p>
                </div>
              ) : activeMeal && activeMeal.dishes.length > 0 ? (
                <div className="space-y-2.5">
                  <ul className="space-y-2 sm:space-y-2.5" role="list">
                    {activeMeal.dishes.map((dish, idx) => {
                      const dishUserAllergies = getDishUserAllergies(dish.allergenCodes);
                      const isHitUserAllergy = dishUserAllergies.length > 0;
                      const hasAnyAllergy = dish.allergens.length > 0;
                      const dishTier = customTiers[dish.name] || getDefaultDishTier(dish.name);
                      const tierConfig = TIER_CONFIGS[dishTier];
                      const isFav = favoriteDishes.includes(dish.name);

                      // 안심 메뉴 필터가 켜져 있고, 이 메뉴가 알레르기 포함 메뉴라면 숨김
                      if (showSafeOnly && isHitUserAllergy) {
                        return null;
                      }

                      return (
                        <li
                          key={`${dish.name}-${idx}`}
                          className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                            isFav
                              ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
                              : isHitUserAllergy
                              ? 'bg-rose-50/95 border-rose-300 text-rose-950 shadow-xs ring-1 ring-rose-200'
                              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/90 text-slate-900'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            {/* 메뉴 번호 및 메뉴명 */}
                            <div className="flex items-start gap-3 min-w-0">
                              <span
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center shrink-0 border ${
                                  isHitUserAllergy
                                    ? 'bg-rose-500 text-white border-rose-600 shadow-2xs'
                                    : 'bg-white text-slate-600 border-slate-200'
                                }`}
                              >
                                {idx + 1}
                              </span>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className={`${fontClasses.dishName} tracking-tight leading-snug break-keep`}>
                                    {dish.name}
                                  </h3>

                                  {/* 개별 메뉴 티어 뱃지 */}
                                  <span
                                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${tierConfig.badgeBg} ${tierConfig.badgeText}`}
                                    title={`${dishTier} 티어`}
                                  >
                                    {dishTier}
                                  </span>

                                  {/* 최애 뱃지 */}
                                  {isFav && (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black shrink-0">
                                      <Heart className="w-2.5 h-2.5 fill-current" />
                                      <span>최애</span>
                                    </span>
                                  )}

                                  {isHitUserAllergy && (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-black shrink-0">
                                      <AlertTriangle className="w-3 h-3" />
                                      <span>섭취 주의</span>
                                    </span>
                                  )}
                                </div>

                                {/* 알레르기 목록 태그들 */}
                                {hasAnyAllergy && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {dish.allergenCodes.map((code) => {
                                      const info = ALLERGEN_MAP[code];
                                      const isUserWarn = userAllergens.includes(code);

                                      return (
                                        <span
                                          key={code}
                                          className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
                                            isUserWarn
                                              ? 'bg-rose-600 text-white font-black ring-1 ring-rose-400'
                                              : 'bg-slate-200/80 text-slate-700'
                                          }`}
                                          title={info?.name || `알레르기 ${code}번`}
                                        >
                                          <span>{info?.emoji}</span>
                                          <span>{info?.shortName || `알레르기(${code})`}</span>
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* 우측 최애 하트 버튼 & 알레르기 아이콘 */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              {/* 1. 최애 메뉴 찜 하트 버튼 */}
                              <button
                                type="button"
                                onClick={() => handleToggleFavorite(dish.name)}
                                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                                  isFav
                                    ? 'bg-rose-100 text-rose-600 hover:bg-rose-200'
                                    : 'bg-white hover:bg-slate-200 text-slate-300 hover:text-rose-500 border border-slate-200'
                                }`}
                                title={isFav ? '최애 메뉴 해제' : '최애 메뉴로 찜하기'}
                              >
                                <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-500' : ''}`} />
                              </button>

                              {/* 알레르기 경고 아이콘 */}
                              {isHitUserAllergy ? (
                                <span className="inline-flex items-center gap-1 text-rose-600 font-extrabold text-xs bg-rose-100 px-2 py-1 rounded-lg">
                                  <ShieldAlert className="w-4 h-4" />
                                </span>
                              ) : (
                                <span className="text-emerald-500 p-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                </span>
                              )}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* 4. 헬스·운동러를 위한 '단백질 득근 지표 & 탄단지 밸런스' 카드 */}
                  <NutritionMacroCard meal={activeMeal} />

                  {/* 하단 식단 액션 버튼 바: 복사 & 티어매기기 & 영양성분 */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyMenu}
                      className="flex-1 py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>오늘 식단 복사하기</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('tier')}
                      className="py-3 px-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-extrabold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Trophy className="w-4 h-4 text-amber-100" />
                      <span>티어 매기기</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsNutritionModalOpen(true)}
                      className="py-3 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Flame className="w-4 h-4 text-orange-600" />
                      <span className="hidden sm:inline">원산지 정보</span>
                      <span className="sm:hidden">원산지</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* 식단이 없는 날 (주말/공휴일/방학 등) */
                <div className="py-14 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    급식 식단이 없는 날입니다
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs break-keep">
                    주말, 공휴일, 재량휴업일이거나 식단표가 아직 등록되지 않은 날짜입니다.
                  </p>
                  <button
                    type="button"
                    onClick={handleJumpToToday}
                    className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    오늘 급식 보기
                  </button>
                </div>
              )}
            </div>
          )}
        </main>

        {/* 6. 알레르기 안내 및 학교 정보 푸터 */}
        <footer className="mt-3 px-4 py-3 bg-slate-50 border-t border-slate-200/80">
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>교육부 나이스(NEIS) 공식 알레르기 유발물질 19종 안내</span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed break-keep">
              ①난류 ②우유 ③메밀 ④땅콩 ⑤대두 ⑥밀 ⑦고등어 ⑧게 ⑨새우 ⑩돼지고기 ⑪복숭아 ⑫토마토 ⑬아황산류 ⑭호두 ⑮닭고기 ⑯쇠고기 ⑰오징어 ⑱조개류 ⑲잣
            </p>
          </div>

          <div className="mt-2.5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-1 px-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{SCHOOL_INFO.address}</span>
            </span>
            <span className="text-slate-500 font-medium">
              교무실 044-410-3400
            </span>
          </div>
        </footer>

      </div>

      {/* 모달 컴포넌트들 */}
      <AllergyModal
        isOpen={isAllergyModalOpen}
        onClose={() => setIsAllergyModalOpen(false)}
        selectedAllergenCodes={userAllergens}
        onToggleAllergen={handleToggleAllergen}
        onClearAllergens={handleClearAllergens}
      />

      <NutritionModal
        isOpen={isNutritionModalOpen}
        onClose={() => setIsNutritionModalOpen(false)}
        meal={activeMeal}
      />

      <MenuSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectDate={handleJumpToDate}
        additionalMeals={weeklyMeals}
      />
    </div>
  );
}
