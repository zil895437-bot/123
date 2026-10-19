/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Camera,
  UtensilsCrossed,
  History,
  ChefHat,
  RefreshCw,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';
import {
  Ingredient,
  Recipe,
  DietaryPreferences,
  DeductionItem,
  CookingHistoryItem,
} from './types';
import { INITIAL_INGREDIENTS } from './data/mockData';
import { PhotoScannerModal } from './components/PhotoScannerModal';
import { InventoryManager } from './components/InventoryManager';
import { PreferenceFilter } from './components/PreferenceFilter';
import { RecipeCard } from './components/RecipeCard';
import { CookingModeModal } from './components/CookingModeModal';
import { CookingHistoryModal } from './components/CookingHistoryModal';

const DEFAULT_PREFERENCES: DietaryPreferences = {
  appliances: ['單口瓦斯爐', '電鍋 / 蒸煮鍋'],
  dietStyle: '高蛋白增肌',
  timeLimit: '⚡ 極速 15 分鐘出菜',
  exclusions: [],
  servings: '1-2 人份',
};

// Initial fallback mock recipes matching initial inventory so user sees instant high-grade UX
const INITIAL_DEMO_RECIPES: Recipe[] = [
  {
    id: 'recipe-demo-1',
    name: '蔥香蒜味高麗菜爆炒五花肉',
    description: '鑊氣十足的家常經典！以豬肉自然逼出的油脂大火快炒香脆高麗菜，再淋上特製蔥香醬汁，鹹甜脆口超下飯。',
    prepTimeMinutes: 5,
    cookTimeMinutes: 7,
    difficulty: '超簡單',
    applianceUsed: '單口瓦斯爐',
    caloriesPerServing: 320,
    proteinGrams: 22,
    tags: ['高蛋白', '15分鐘出菜', '一鍋到底'],
    usedIngredients: [
      { name: '豬肉片', quantityUsed: 150, unit: '克' },
      { name: '高麗菜', quantityUsed: 0.25, unit: '顆' },
      { name: '青蔥', quantityUsed: 2, unit: '根' },
    ],
    pantryItemsNeeded: ['醬油 1 大匙', '鹽 少許', '米酒 1 小匙'],
    steps: [
      {
        stepNumber: 1,
        instruction: '高麗菜手撕成適口大小，青蔥斜切段，豬肉片加入少許米酒抓勻去腥。',
        tip: '用手撕高麗菜口感比刀切更爽脆！',
        timerMinutes: 2,
      },
      {
        stepNumber: 2,
        instruction: '熱鍋免倒油，直接下豬肉片大火煸炒至邊緣金黃微捲並逼出香氣。',
        tip: '利用豬肉自帶油脂，省油又香氣撲鼻。',
        timerMinutes: 3,
      },
      {
        stepNumber: 3,
        instruction: '轉大火加入高麗菜快速翻炒 1 分鐘，嗆入醬油與蔥段，炒勻立即起鍋。',
        tip: '大火快翻才能鎖住高麗菜的脆甜多汁！',
        timerMinutes: 2,
      },
    ],
    chefSecret: '起鍋前沿鍋邊嗆入半茶匙醬油，香氣立刻提升三倍！',
  },
  {
    id: 'recipe-demo-2',
    name: '電鍋日式金針菇滑蛋蒸板豆腐',
    description: '免開火免油煙！將滑嫩板豆腐鋪底，覆蓋鮮甜金針菇與香濃蛋液，電鍋蒸熟後熱氣蒸騰，低脂高蛋白無負擔。',
    prepTimeMinutes: 4,
    cookTimeMinutes: 10,
    difficulty: '超簡單',
    applianceUsed: '電鍋 / 蒸煮鍋',
    caloriesPerServing: 240,
    proteinGrams: 26,
    tags: ['免開火', '低醣生酮', '極速無油煙'],
    usedIngredients: [
      { name: '雞蛋', quantityUsed: 2, unit: '顆' },
      { name: '板豆腐', quantityUsed: 1, unit: '塊' },
      { name: '金針菇', quantityUsed: 0.5, unit: '包' },
      { name: '青蔥', quantityUsed: 1, unit: '根' },
    ],
    pantryItemsNeeded: ['醬油膏 1 大匙', '香油 少許', '白胡椒粉 少許'],
    steps: [
      {
        stepNumber: 1,
        instruction: '板豆腐切厚片排入深盤，金針菇去根洗淨撕開鋪在豆腐上。',
        tip: '用深盤可以完整保留蒸出來的鮮美湯汁。',
        timerMinutes: 2,
      },
      {
        stepNumber: 2,
        instruction: '兩顆雞蛋打散，加入一小匙水攪勻後均勻淋在豆腐與金針菇上。',
        tip: '蛋液加一點點溫水，蒸出來質地如布丁般滑嫩。',
        timerMinutes: 1,
      },
      {
        stepNumber: 3,
        instruction: '電鍋外鍋加半杯水，放入蒸盤，按下開關蒸約 8-10 分鐘跳起，撒上蔥花與醬油膏即可享用。',
        tip: '電鍋開關跳起後先悶 1 分鐘再開蓋，蛋香更濃。',
        timerMinutes: 9,
      },
    ],
    chefSecret: '出鍋淋兩滴香油，平凡家常菜秒變居酒屋名菜！',
  },
];

export default function App() {
  // Load inventory from localStorage or default
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_ingredients');
      return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
    } catch {
      return INITIAL_INGREDIENTS;
    }
  });

  // Dietary Preferences
  const [preferences, setPreferences] = useState<DietaryPreferences>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_preferences');
      return saved ? JSON.parse(saved) : DEFAULT_PREFERENCES;
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  // Recipes list
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_recipes');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_RECIPES;
    } catch {
      return INITIAL_DEMO_RECIPES;
    }
  });

  // Cooking history
  const [history, setHistory] = useState<CookingHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('smart_fridge_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeCookingRecipe, setActiveCookingRecipe] = useState<Recipe | null>(null);
  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState(false);
  const [swappingRecipeId, setSwappingRecipeId] = useState<string | null>(null);
  const [globalError, setGlobalError] = useState<string>('');

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('smart_fridge_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  useEffect(() => {
    localStorage.setItem('smart_fridge_preferences', JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    localStorage.setItem('smart_fridge_recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('smart_fridge_history', JSON.stringify(history));
  }, [history]);

  // Handle adding newly scanned ingredients
  const handleAddScannedIngredients = (newItems: Ingredient[]) => {
    setIngredients((prev) => {
      // Merge or append: if item with same name exists, update quantity
      const copy = [...prev];
      newItems.forEach((newItem) => {
        const existingIdx = copy.findIndex(
          (item) => item.name.trim().toLowerCase() === newItem.name.trim().toLowerCase()
        );
        if (existingIdx !== -1) {
          copy[existingIdx].quantity = Number(
            (copy[existingIdx].quantity + newItem.quantity).toFixed(2)
          );
          copy[existingIdx].selected = true;
        } else {
          copy.unshift(newItem);
        }
      });
      return copy;
    });
  };

  // Generate recipes
  const handleGenerateRecipes = async () => {
    setGlobalError('');
    setIsGeneratingRecipes(true);

    const activeIngredients = ingredients.filter((i) => i.selected);
    if (activeIngredients.length === 0) {
      setGlobalError('請先勾選至少一種冰箱食材，才能為您規劃食譜！');
      setIsGeneratingRecipes(false);
      return;
    }

    try {
      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: activeIngredients,
          appliances: preferences.appliances,
          dietStyle: preferences.dietStyle,
          timeLimit: preferences.timeLimit,
          exclusions: preferences.exclusions,
          servings: preferences.servings,
          recipeCount: 3,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '生成食譜失敗');
      }

      const data = await response.json();
      if (data.recipes && data.recipes.length > 0) {
        setRecipes(data.recipes);
        // Scroll to recipe section
        setTimeout(() => {
          document.getElementById('recipes-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        throw new Error('未取得推薦食譜，請稍候重試');
      }
    } catch (err: any) {
      console.error('Error generating recipes:', err);
      setGlobalError(err.message || '無法連線到 AI 大廚伺服器，請稍後再試');
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  // Dynamic Recipe Swap ("這道我不喜歡，換一道不用開火的" or custom reason)
  const handleSwapRecipe = async (currentRecipe: Recipe, reason: string) => {
    setSwappingRecipeId(currentRecipe.id);
    setGlobalError('');

    const activeIngredients = ingredients.filter((i) => i.selected);

    try {
      const otherRecipes = recipes.filter((r) => r.id !== currentRecipe.id);
      const response = await fetch('/api/swap-recipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentRecipe,
          allOtherRecipes: otherRecipes,
          reason,
          ingredients: activeIngredients,
          appliances: preferences.appliances,
          dietStyle: preferences.dietStyle,
          timeLimit: preferences.timeLimit,
          exclusions: preferences.exclusions,
          servings: preferences.servings,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || '換菜失敗');
      }

      const data = await response.json();
      if (data.recipe) {
        setRecipes((prev) =>
          prev.map((r) => (r.id === currentRecipe.id ? data.recipe : r))
        );
      }
    } catch (err: any) {
      console.error('Error swapping recipe:', err);
      alert(err.message || '動態換菜失敗，請重試');
    } finally {
      setSwappingRecipeId(null);
    }
  };

  // Cooking Complete -> Deduct from Inventory
  const handleConfirmDeduction = (recipe: Recipe, deductions: DeductionItem[]) => {
    // Deduct quantities
    setIngredients((prev) => {
      const copy = [...prev];
      deductions.forEach((d) => {
        const target = copy.find((item) => item.name === d.name);
        if (target) {
          target.quantity = d.after;
        }
      });
      // Optionally filter out 0 items or keep them with 0 quantity marked
      return copy;
    });

    // Record into cooking history
    const historyItem: CookingHistoryItem = {
      id: `hist-${Date.now()}`,
      recipeName: recipe.name,
      cookedAt: new Date().toLocaleDateString('zh-TW', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      deductions,
      applianceUsed: recipe.applianceUsed,
    };

    setHistory((prev) => [historyItem, ...prev]);
  };

  // Undo deduction in case user clicked mistakenly
  const handleUndoDeduction = (deductions: DeductionItem[]) => {
    setIngredients((prev) => {
      const copy = [...prev];
      deductions.forEach((d) => {
        const target = copy.find((item) => item.name === d.name);
        if (target) {
          target.quantity = d.before;
        }
      });
      return copy;
    });

    // Remove latest history item
    setHistory((prev) => prev.slice(1));
  };

  const selectedCount = ingredients.filter((i) => i.selected).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white pb-20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight">
                  智慧清冰箱大廚
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  AI 視覺辨識 × 動態換菜
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                多模態冰箱盤點 • 設備與飲食風格篩選 • 煮完自動扣除庫存
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center space-x-1.5 cursor-pointer"
            >
              <History className="w-4 h-4 text-slate-500" />
              <span>料理紀錄 ({history.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="px-4 py-2 text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs shadow-emerald-600/20 transition-all flex items-center space-x-2 cursor-pointer hover:scale-[1.02]"
            >
              <Camera className="w-4 h-4" />
              <span>拍照盤點冰箱</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Error Notification */}
        {globalError && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-between text-sm shadow-xs animate-fade-in">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <span>{globalError}</span>
            </div>
            <button
              onClick={() => setGlobalError('')}
              className="text-xs font-bold text-rose-600 hover:underline ml-4"
            >
              關閉
            </button>
          </div>
        )}

        {/* Feature 1: Inventory Manager (Photos, Camera, Bounding Boxes, Quantity Controls) */}
        <section aria-label="食材庫存管理">
          <InventoryManager
            ingredients={ingredients}
            onUpdateIngredients={setIngredients}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        </section>

        {/* Feature 2: Customizable Dietary & Appliance Preference Filters */}
        <section aria-label="飲食偏好與設備限制篩選">
          <PreferenceFilter
            preferences={preferences}
            onChange={setPreferences}
            onGenerate={handleGenerateRecipes}
            isLoading={isGeneratingRecipes}
            selectedIngredientsCount={selectedCount}
          />
        </section>

        {/* Feature 3: Dynamic Recipe Swapping & Cooking Mode */}
        <section id="recipes-section" className="space-y-4 pt-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                  清冰箱推薦食譜
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {recipes.length} 道量身規劃
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center space-x-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <span>
                  不喜歡哪一道？點擊「換一道不用開火的」立刻動態微調替換；煮好後自動從冰箱扣除食材！
                </span>
              </p>
            </div>

            <button
              type="button"
              disabled={isGeneratingRecipes || selectedCount === 0}
              onClick={handleGenerateRecipes}
              className="px-4 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingRecipes ? 'animate-spin' : ''}`} />
              <span>重新發想全新菜單</span>
            </button>
          </div>

          {/* Recipe Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                inventory={ingredients}
                onStartCooking={(r) => setActiveCookingRecipe(r)}
                onSwapRecipe={handleSwapRecipe}
                isSwapping={swappingRecipeId === recipe.id}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Feature 1 Modal: Multimodal Camera & Photo Scanner */}
      <PhotoScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onAddIngredients={handleAddScannedIngredients}
      />

      {/* Feature 3 Modal: Cooking Mode with Step Timers, TTS, & Automatic Deduction */}
      <CookingModeModal
        recipe={activeCookingRecipe}
        inventory={ingredients}
        isOpen={!!activeCookingRecipe}
        onClose={() => setActiveCookingRecipe(null)}
        onConfirmDeduction={handleConfirmDeduction}
        onUndoDeduction={handleUndoDeduction}
      />

      {/* Cooking History & Deduction Statistics Modal */}
      <CookingHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
      />
    </div>
  );
}
