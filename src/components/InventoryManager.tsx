import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Check,
  Tag,
} from 'lucide-react';
import { Ingredient } from '../types';
import { INITIAL_INGREDIENTS } from '../data/mockData';

interface InventoryManagerProps {
  ingredients: Ingredient[];
  onUpdateIngredients: (updated: Ingredient[]) => void;
  onOpenScanner: () => void;
}

const CATEGORIES = ['全部', '蔬菜', '蛋豆製品', '肉類', '海鮮', '水果', '澱粉主食', '醬料其他'];

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  ingredients,
  onUpdateIngredients,
  onOpenScanner,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newQuantity, setNewQuantity] = useState<number>(1);
  const [newUnit, setNewUnit] = useState('顆');
  const [newCategory, setNewCategory] = useState('蔬菜');

  const filtered = ingredients.filter(
    (item) => selectedCategory === '全部' || item.category === selectedCategory
  );

  const selectedCount = ingredients.filter((i) => i.selected).length;

  const toggleSelect = (id: string) => {
    onUpdateIngredients(
      ingredients.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const toggleSelectAll = () => {
    const allSelected = ingredients.every((i) => i.selected);
    onUpdateIngredients(ingredients.map((i) => ({ ...i, selected: !allSelected })));
  };

  const updateQuantity = (id: string, delta: number) => {
    onUpdateIngredients(
      ingredients
        .map((item) => {
          if (item.id === id) {
            const nextQty = Math.max(0, Number((item.quantity + delta).toFixed(2)));
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeIngredient = (id: string) => {
    onUpdateIngredients(ingredients.filter((item) => item.id !== id));
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newItem: Ingredient = {
      id: `manual-${Date.now()}`,
      name: newName.trim(),
      quantity: newQuantity > 0 ? newQuantity : 1,
      unit: newUnit.trim() || '份',
      category: newCategory,
      freshness: '新鮮',
      selected: true,
      addedAt: '剛剛新增',
    };

    onUpdateIngredients([newItem, ...ingredients]);
    setNewName('');
    setNewQuantity(1);
    setIsAddingNew(false);
  };

  const resetToSample = () => {
    if (window.confirm('確定重設為預設食材清單嗎？（包含高麗菜、雞蛋、板豆腐、豬肉片等）')) {
      onUpdateIngredients(INITIAL_INGREDIENTS);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all">
      {/* Top Bar */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              🥦 冰箱食材庫存庫
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              共 {ingredients.length} 種
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            勾選的食材將優先參與 AI 料理發想，煮完自動扣除剩餘庫存
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            type="button"
            onClick={resetToSample}
            title="重設為範例庫存"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs transition-colors flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>手動記一筆</span>
          </button>

          <button
            type="button"
            onClick={onOpenScanner}
            className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-sm shadow-emerald-600/20 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>拍照一鍵盤點</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Quick Bulk Controls */}
      <div className="px-6 py-3 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white text-xs">
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 max-w-full">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <button
          onClick={toggleSelectAll}
          className="text-xs text-slate-600 hover:text-emerald-700 font-medium flex items-center space-x-1.5 cursor-pointer"
        >
          {ingredients.every((i) => i.selected) ? (
            <>
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>取消全選</span>
            </>
          ) : (
            <>
              <Square className="w-4 h-4 text-slate-400" />
              <span>全選參與料理 ({selectedCount}/{ingredients.length})</span>
            </>
          )}
        </button>
      </div>

      {/* Manual Add Inline Form */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNew}
          className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex flex-wrap items-center gap-3 animate-fade-in text-xs"
        >
          <span className="font-bold text-emerald-900">新增食材：</span>
          <input
            type="text"
            required
            placeholder="食材名稱（例如：雞蛋、胡蘿蔔）"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
          />
          <input
            type="number"
            min="0.1"
            step="0.5"
            required
            value={newQuantity}
            onChange={(e) => setNewQuantity(parseFloat(e.target.value) || 1)}
            className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-20"
          />
          <input
            type="text"
            placeholder="單位（顆/塊/克）"
            value={newUnit}
            onChange={(e) => setNewUnit(e.target.value)}
            className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-24"
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="蔬菜">蔬菜</option>
            <option value="蛋豆製品">蛋豆製品</option>
            <option value="肉類">肉類</option>
            <option value="海鮮">海鮮</option>
            <option value="水果">水果</option>
            <option value="澱粉主食">澱粉主食</option>
            <option value="醬料其他">醬料其他</option>
          </select>
          <button
            type="submit"
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs cursor-pointer flex items-center space-x-1"
          >
            <Check className="w-3.5 h-3.5" />
            <span>儲存</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddingNew(false)}
            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-lg cursor-pointer"
          >
            取消
          </button>
        </form>
      )}

      {/* Ingredient Items List */}
      <div className="p-6">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Tag className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              此分類目前沒有食材
            </p>
            <p className="text-xs text-slate-400 mt-1">
              點擊「拍照一鍵盤點」或「手動記一筆」補充食材庫存！
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                  item.selected
                    ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300 hover:shadow-xs'
                    : 'border-slate-200 bg-slate-50/60 opacity-60 hover:opacity-90'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleSelect(item.id)}
                      className="w-4 h-4 mt-0.5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-slate-800 text-sm flex items-center space-x-1.5">
                        <span>{item.name}</span>
                        {item.freshness === '建議盡快食用' && (
                          <span
                            title="建議盡快食用"
                            className="inline-flex items-center text-amber-600"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1.5 mt-1">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                          {item.category}
                        </span>
                        {item.freshness && (
                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${
                              item.freshness === '建議盡快食用'
                                ? 'bg-amber-100 text-amber-800 font-semibold'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {item.freshness}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeIngredient(item.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 rounded-md transition-colors"
                    title="刪除食材"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Bottom quantity adjustment bar */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">庫存數量</span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-slate-800 px-1">
                      {item.quantity} {item.unit}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
