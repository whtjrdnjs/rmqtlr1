/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  HelpCircle,
  Send,
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  UtensilsCrossed,
  Trash2,
  Edit3,
  AlertCircle,
} from 'lucide-react';
import {
  FAQ_QUICK_QUESTIONS,
  findBestFaqAnswer,
} from '../data/mealFaq';
import { StoreRecord } from '../services/storeService';

interface MealHelperViewProps {
  storeItems: StoreRecord[];
  storeLoading: boolean;
  storeError: string | null;
  currentUser: string | null;
  onRefreshStore: () => Promise<void>;
  onAddWish: (menu: string, reason: string) => Promise<void>;
  onDeleteWish: (id: string) => Promise<void>;
  onUpdateWish: (id: string, menu: string, reason: string) => Promise<void>;
}

export const MealHelperView: React.FC<MealHelperViewProps> = ({
  storeItems,
  storeLoading,
  storeError,
  currentUser,
  onRefreshStore,
  onAddWish,
  onDeleteWish,
  onUpdateWish,
}) => {
  // Q&A states
  const [questionInput, setQuestionInput] = useState('');
  const [askedText, setAskedText] = useState<string | null>(null);
  const [faqAnswer, setFaqAnswer] = useState<string | null>(null);
  const [noMatchMessage, setNoMatchMessage] = useState<string | null>(null);
  const [aiImageNotice, setAiImageNotice] = useState<string | null>(null);

  // Wish menu states
  const [wishMenu, setWishMenu] = useState('');
  const [wishReason, setWishReason] = useState('');
  const [submittingWish, setSubmittingWish] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Editing state (only allowed when currentUser && item.user === currentUser)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMenu, setEditMenu] = useState('');
  const [editReason, setEditReason] = useState('');

  const handleAsk = (rawQuestion: string) => {
    const trimmed = rawQuestion.trim();
    if (!trimmed) return;
    setAskedText(trimmed);
    const matched = findBestFaqAnswer(trimmed);
    if (matched) {
      setFaqAnswer(matched.answer);
      setNoMatchMessage(null);
    } else {
      setFaqAnswer(null);
      setNoMatchMessage('아직 모르는 질문이에요');
    }
  };

  const handleFaqSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAsk(questionInput);
  };

  const handleQuickQuestionClick = (q: string) => {
    setQuestionInput(q);
    handleAsk(q);
  };

  const handleWishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const menuTrimmed = wishMenu.trim();
    const reasonTrimmed = wishReason.trim();
    if (!menuTrimmed) {
      setLocalError('원하는 메뉴 이름을 입력해 주세요.');
      return;
    }
    setLocalError(null);
    setSubmittingWish(true);
    try {
      await onAddWish(menuTrimmed, reasonTrimmed);
      setWishMenu('');
      setWishReason('');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '저장에 실패했어요.';
      setLocalError(msg);
    } finally {
      setSubmittingWish(false);
    }
  };

  const handleSaveEdit = async (id: string) => {
    const m = editMenu.trim();
    const r = editReason.trim();
    if (!m) return;
    try {
      await onUpdateWish(id, m, r);
      setEditingId(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : '수정에 실패했어요.';
      setLocalError(msg);
    }
  };

  // Filter wish items safely (handles old rows missing fields)
  const wishItems = storeItems.filter(
    (item) => item?.data && item.data.type === 'wish'
  );

  return (
    <div className="space-y-5">
      {/* 1. 급식 도우미 Q&A */}
      <section className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                다정고 급식 도우미 Q&amp;A
              </h2>
              <p className="text-xs text-slate-600">
                궁금한 점을 물어보면 가장 알맞은 안내를 바로 알려드려요.
              </p>
            </div>
          </div>

          {/* 배포판에서 쓸 수 없는 AI 기능 버튼 */}
          <button
            type="button"
            onClick={() =>
              setAiImageNotice('이 기능은 배포판에서는 쓸 수 없어요')
            }
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
            <span>그림 만들기</span>
          </button>
        </div>

        {aiImageNotice && (
          <div className="p-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{aiImageNotice}</span>
          </div>
        )}

        {/* 입력 칸 위 자주 묻는 질문 버튼 4개 */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>자주 묻는 질문</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {FAQ_QUICK_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleQuickQuestionClick(q)}
                className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* 질문 입력 칸 */}
        <form onSubmit={handleFaqSubmit} className="space-y-1">
          <div className="flex gap-1.5">
            <input
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="예: 점심시간 몇 시인가요? 알레르기 번호 뜻이 뭐예요?"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-amber-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-extrabold flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>물어보기</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 pl-1">
            이름 · 학번 · 연락처는 쓰지 마세요
          </p>
        </form>

        {/* 답변 출력 영역 (텍스트만 사용, innerHTML 미사용) */}
        {askedText && (
          <div className="p-3.5 rounded-xl bg-white border border-amber-200 space-y-1.5">
            <p className="text-xs font-bold text-amber-800">
              질문: {askedText}
            </p>
            {faqAnswer ? (
              <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                {faqAnswer}
              </p>
            ) : (
              <p className="text-sm font-bold text-slate-500">
                {noMatchMessage}
              </p>
            )}
          </div>
        )}
      </section>

      {/* 2. 우리 학교 희망 급식 신청함 (내 저장소 store 사용) */}
      <section className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">
                우리 학교 희망 급식 신청함
              </h2>
              <p className="text-xs text-slate-500">
                먹고 싶은 메뉴를 남기면 모두와 함께 볼 수 있어요.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void onRefreshStore()}
            disabled={storeLoading}
            className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${storeLoading ? 'animate-spin' : ''}`}
            />
            <span>새로 고침</span>
          </button>
        </div>

        {/* 오류 메시지 그대로 표시 */}
        {(storeError || localError) && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{localError || storeError}</span>
          </div>
        )}

        {/* 신청 입력 폼 */}
        <form onSubmit={handleWishSubmit} className="space-y-2">
          <input
            type="text"
            value={wishMenu}
            onChange={(e) => setWishMenu(e.target.value)}
            placeholder="원하는 급식 메뉴 이름 (예: 로제파스타, 소떡소떡)"
            className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <div className="flex gap-1.5">
            <input
              type="text"
              value={wishReason}
              onChange={(e) => setWishReason(e.target.value)}
              placeholder="추천 이유 한 줄 (선택)"
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={submittingWish}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shrink-0 cursor-pointer disabled:opacity-50"
            >
              {submittingWish ? '저장 중...' : '신청하기'}
            </button>
          </div>
          <p className="text-[11px] text-slate-500 pl-1">
            이름 · 학번 · 연락처는 쓰지 마세요
          </p>
        </form>

        {/* 저장된 희망 급식 목록 (텍스트로만 안전하게 표시) */}
        <div className="space-y-2 pt-1">
          {storeLoading && wishItems.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              희망 급식 목록을 불러오는 중...
            </p>
          ) : wishItems.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">
              아직 신청된 희망 급식 메뉴가 없습니다. 첫 번째로 신청해 보세요!
            </p>
          ) : (
            wishItems.map((item) => {
              const rawMenu = item.data?.menu;
              const rawReason = item.data?.reason;
              const menuText =
                typeof rawMenu === 'string' && rawMenu.trim()
                  ? rawMenu
                  : '(메뉴 이름 없음)';
              const reasonText =
                typeof rawReason === 'string' ? rawReason : '';
              // 작성자가 있고 지금 로그인한 사람이 쓴 줄에만 고치기/지우기 버튼 표시
              const canEdit = Boolean(
                currentUser && item.user && item.user === currentUser
              );

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 space-y-1.5"
                >
                  {editingId === item.id && canEdit ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={editMenu}
                        onChange={(e) => setEditMenu(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-sm font-bold"
                      />
                      <input
                        type="text"
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs"
                      />
                      <p className="text-[11px] text-slate-500">
                        이름 · 학번 · 연락처는 쓰지 마세요
                      </p>
                      <div className="flex gap-1.5 justify-end">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-600 cursor-pointer"
                        >
                          취소
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleSaveEdit(item.id)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 text-xs font-bold text-white cursor-pointer"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-extrabold text-slate-900">
                          {menuText}
                        </p>
                        {reasonText && (
                          <p className="text-xs text-slate-600 mt-0.5">
                            {reasonText}
                          </p>
                        )}
                      </div>

                      {canEdit && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(item.id);
                              setEditMenu(menuText);
                              setEditReason(reasonText);
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 cursor-pointer"
                            title="고치기"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void onDeleteWish(item.id)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer"
                            title="지우기"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
