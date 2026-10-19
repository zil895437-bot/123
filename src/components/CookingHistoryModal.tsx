import React from 'react';
import { X, History, Sparkles, CheckCircle2, ChefHat } from 'lucide-react';
import { CookingHistoryItem } from '../types';

interface CookingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: CookingHistoryItem[];
  onClearHistory: () => void;
}

export const CookingHistoryModal: React.FC<CookingHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">已烹飪紀錄與食材減法成果</h2>
              <p className="text-xs text-slate-400">累積美味成果，清空冰箱零浪費</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ChefHat className="w-12 h-12 mx-auto text-slate-300" />
              <div className="text-sm font-semibold text-slate-600">目前尚無烹飪紀錄</div>
              <div className="text-xs">
                選一道喜愛的菜色點擊「開始料理」，煮好後自動記錄扣除明細！
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                      <span className="font-bold text-slate-900 text-sm">{item.recipeName}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">{item.cookedAt}</span>
                  </div>

                  {item.deductions && item.deductions.length > 0 && (
                    <div className="pl-8 pt-1 flex flex-wrap gap-1.5">
                      {item.deductions.map((d, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] text-slate-600"
                        >
                          {d.name} <strong className="text-emerald-700">-{d.deducted}{d.unit}</strong> (剩{d.after})
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            共烹飪了 <strong>{history.length}</strong> 道清冰箱料理
          </span>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-rose-600 hover:text-rose-800 underline font-medium"
            >
              清除歷史紀錄
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
