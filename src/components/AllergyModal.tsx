/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Check, ShieldAlert } from 'lucide-react';
import { ALLERGEN_MAP } from '../types/meal';

interface AllergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAllergenCodes: number[];
  onToggleAllergen: (code: number) => void;
  onClearAllergens: () => void;
}

export const AllergyModal: React.FC<AllergyModalProps> = ({
  isOpen,
  onClose,
  selectedAllergenCodes,
  onToggleAllergen,
  onClearAllergens,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="내 알레르기 설정"
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">내 알레르기 설정</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                주의할 식재료를 선택하시면 식단표에서 강조 표시됩니다.
              </p>
            </div>
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

        {/* 안내 배너 */}
        <div className="mt-3 py-2 px-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
          <span>선택된 알레르기 항목: <strong>{selectedAllergenCodes.length}개</strong></span>
          {selectedAllergenCodes.length > 0 && (
            <button
              type="button"
              onClick={onClearAllergens}
              className="text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900"
            >
              전체 해제
            </button>
          )}
        </div>

        {/* 알레르기 항목 그리드 (19가지 교육부 공식 알레르기 유발물질) */}
        <div className="mt-4 overflow-y-auto flex-1 pr-1 grid grid-cols-2 gap-2">
          {Object.entries(ALLERGEN_MAP).map(([codeStr, info]) => {
            const code = parseInt(codeStr, 10);
            const isSelected = selectedAllergenCodes.includes(code);

            return (
              <button
                key={code}
                type="button"
                onClick={() => onToggleAllergen(code)}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-white border-amber-600 shadow-sm font-bold scale-[1.01]'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg shrink-0" role="img" aria-hidden="true">
                    {info.emoji}
                  </span>
                  <div className="min-w-0">
                    <span className="text-sm font-semibold truncate block">
                      {info.shortName}
                    </span>
                    <span
                      className={`text-[10px] block ${
                        isSelected ? 'text-amber-100' : 'text-slate-400'
                      }`}
                    >
                      {code}번 · {info.name}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ml-1 border ${
                    isSelected
                      ? 'bg-white text-amber-600 border-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* 하단 확인 버튼 */}
        <div className="pt-4 mt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-md transition-colors"
          >
            설정 완료
          </button>
        </div>
      </div>
    </div>
  );
};
