import React, { useState } from 'react';
import {
  Clock,
  Flame,
  ChefHat,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Utensils,
  Zap,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { Recipe, Ingredient } from '../types';
import { QUICK_SWAP_REASONS } from '../data/mockData';

interface RecipeCardProps {
  recipe: Recipe;
  inventory: Ingredient[];
  onStartCooking: (recipe: Recipe) => void;
  onSwapRecipe: (recipe: Recipe, reason: string) => Promise<void>;
  isSwapping: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  inventory,
  onStartCooking,
  onSwapRecipe,
  isSwapping,
}) => {
  const [showSwapMenu, setShowSwapMenu] = useState(false);
  const [customSwapReason, setCustomSwapReason] = useState('');
  const [isSubmittingSwap, setIsSubmittingSwap] = useState(false);

  const totalTime = (recipe.prepTimeMinutes || 5) + (recipe.cookTimeMinutes || 10);

  const handleSwap = async (reason: string) => {
    setIsSubmittingSwap(true);
    try {
      await onSwapRecipe(recipe, reason);
      setShowSwapMenu(false);
      setCustomSwapReason('');
    } finally {
      setIsSubmittingSwap(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group relative">
      {/* Loading Overlay when swapping this recipe */}
      {(isSwapping || isSubmittingSwap) && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-6 space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <div className="font-bold text-slate-800 text-sm">正在依您的要求重新推薦菜色...</div>
          <div className="text-xs text-slate-500">嚴格守護現有冰箱食材與設備限制</div>
        </div>
      )}

      {/* Top Banner & Tags */}
      <div>
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                <ChefHat className="w-3.5 h-3.5" />
                <span>{recipe.applianceUsed || '常規設備'}</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                {recipe.difficulty}
              </span>
              {(recipe.tags || []).slice(0, 2).map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200"
                >
                  {t}
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-1 text-slate-500 text-xs font-semibold flex-shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{totalTime} 分鐘</span>
            </div>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors tracking-tight">
            {recipe.name}
          </h3>
          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {recipe.description}
          </p>

          {/* Nutrition Info pill */}
          {(recipe.caloriesPerServing || recipe.proteinGrams) && (
            <div className="flex items-center space-x-3 mt-3 text-[11px] font-medium text-slate-500">
              {recipe.caloriesPerServing && (
                <span className="flex items-center space-x-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span>約 {recipe.caloriesPerServing} kcal</span>
                </span>
              )}
              {recipe.proteinGrams && (
                <span className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-emerald-600" />
                  <span>蛋白質 {recipe.proteinGrams}g</span>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Used Ingredients Breakdown */}
        <div className="px-6 py-3.5 bg-slate-50/70 border-y border-slate-100 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-600" />
              <span>本菜消耗冰箱食材</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold">煮完自動扣除</span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {recipe.usedIngredients.map((item, idx) => {
              const inStock = inventory.find(
                (inv) => inv.name.toLowerCase() === item.name.toLowerCase()
              );
              return (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-800 shadow-2xs flex items-center space-x-1"
                >
                  <span className="text-emerald-700">{item.name}</span>
                  <span className="text-slate-500 text-[11px]">
                    {item.quantityUsed} {item.unit}
                  </span>
                  {inStock && (
                    <span className="text-[10px] text-slate-400">
                      (剩{inStock.quantity})
                    </span>
                  )}
                </span>
              );
            })}
          </div>

          {recipe.pantryItemsNeeded && recipe.pantryItemsNeeded.length > 0 && (
            <div className="text-[11px] text-slate-500 pt-1">
              <span className="font-medium text-slate-400">廚房常備：</span>
              <span>{recipe.pantryItemsNeeded.join('、')}</span>
            </div>
          )}
        </div>

        {/* Recipe Steps preview */}
        <div className="p-6 pb-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>烹飪重點步驟 ({recipe.steps.length} 步)</span>
          </div>
          <ol className="space-y-1.5 text-xs text-slate-600">
            {recipe.steps.slice(0, 3).map((step) => (
              <li key={step.stepNumber} className="flex items-start space-x-2">
                <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                  {step.stepNumber}
                </span>
                <span className="line-clamp-2 leading-relaxed">{step.instruction}</span>
              </li>
            ))}
            {recipe.steps.length > 3 && (
              <li className="text-[11px] text-slate-400 pl-6">
                還有 {recipe.steps.length - 3} 個步驟（進入烹飪模式查看全部）
              </li>
            )}
          </ol>
        </div>
      </div>

      {/* Dynamic Swapping Section & Action Buttons */}
      <div className="p-6 pt-0 space-y-3">
        {/* Dynamic Swap Drawer */}
        {showSwapMenu ? (
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>一鍵動態換菜（AI 重新生成替換）</span>
              </span>
              <button
                onClick={() => setShowSwapMenu(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                收合
              </button>
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {QUICK_SWAP_REASONS.map((reason, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSwap(reason)}
                  className="px-3 py-1.5 text-left text-xs bg-white hover:bg-amber-100/70 border border-amber-200 text-amber-900 rounded-xl transition-all font-medium cursor-pointer"
                >
                  👉 {reason}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customSwapReason.trim()) {
                  handleSwap(customSwapReason.trim());
                }
              }}
              className="flex items-center space-x-2 pt-1"
            >
              <input
                type="text"
                placeholder="或輸入自訂要求（如：想吃蛋料理）"
                value={customSwapReason}
                onChange={(e) => setCustomSwapReason(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                替換
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleSwap('這道我不喜歡，換一道不用開火的')}
              className="flex-1 py-2 px-3 text-xs font-bold text-slate-700 hover:text-amber-800 bg-slate-100 hover:bg-amber-50 border border-slate-200 hover:border-amber-200 rounded-xl transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span>換一道不用開火的</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSwapMenu(true)}
              title="更多換菜偏好"
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Start Cooking Button */}
        <button
          type="button"
          onClick={() => onStartCooking(recipe)}
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-sm shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer group-hover:scale-[1.01]"
        >
          <span>開始料理這道菜</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
