import React, { useState } from 'react';
import {
  Flame,
  Soup,
  Wind,
  Zap,
  Square,
  Sparkles,
  Clock,
  Heart,
  Ban,
  Users,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DietaryPreferences } from '../types';
import {
  APPLIANCE_OPTIONS,
  DIET_STYLES,
  TIME_LIMITS,
  COMMON_EXCLUSIONS,
} from '../data/mockData';

interface PreferenceFilterProps {
  preferences: DietaryPreferences;
  onChange: (updated: DietaryPreferences) => void;
  onGenerate: () => void;
  isLoading: boolean;
  selectedIngredientsCount: number;
}

export const PreferenceFilter: React.FC<PreferenceFilterProps> = ({
  preferences,
  onChange,
  onGenerate,
  isLoading,
  selectedIngredientsCount,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [customExclusion, setCustomExclusion] = useState('');

  const toggleAppliance = (label: string) => {
    const exists = preferences.appliances.includes(label);
    const updated = exists
      ? preferences.appliances.filter((a) => a !== label)
      : [...preferences.appliances, label];
    onChange({ ...preferences, appliances: updated });
  };

  const toggleExclusion = (item: string) => {
    const exists = preferences.exclusions.includes(item);
    const updated = exists
      ? preferences.exclusions.filter((e) => e !== item)
      : [...preferences.exclusions, item];
    onChange({ ...preferences, exclusions: updated });
  };

  const addCustomExclusion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExclusion.trim()) return;
    if (!preferences.exclusions.includes(customExclusion.trim())) {
      onChange({
        ...preferences,
        exclusions: [...preferences.exclusions, customExclusion.trim()],
      });
    }
    setCustomExclusion('');
  };

  const getApplianceIcon = (label: string) => {
    switch (label) {
      case '單口瓦斯爐':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case '電鍋 / 蒸煮鍋':
        return <Soup className="w-4 h-4 text-emerald-500" />;
      case '氣炸鍋':
        return <Wind className="w-4 h-4 text-amber-500" />;
      case '微波爐':
        return <Zap className="w-4 h-4 text-blue-500" />;
      case '烤箱':
        return <Square className="w-4 h-4 text-indigo-500" />;
      case '免開火 (涼拌/生食)':
        return <Sparkles className="w-4 h-4 text-teal-500" />;
      default:
        return <Flame className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all">
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-6 py-5 border-b border-slate-100 flex items-center justify-between cursor-pointer bg-gradient-to-r from-slate-50 to-emerald-50/20 hover:bg-slate-100/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              客製化飲食偏好與設備限制篩選器
            </h2>
            <p className="text-xs text-slate-500">
              設定設備限制（如僅有電鍋/免開火）、飲食風格（高蛋白/低醣）與時間
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-100/80 px-3 py-1 rounded-full">
            <span>{preferences.dietStyle}</span>
            <span>•</span>
            <span>{preferences.timeLimit.replace('⚡ ', '').replace('⏱️ ', '').replace('🍲 ', '')}</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* 1. Appliance Restrictions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5">
                <span>🔥 設備限制（可多選 / 不選代表常規全配廚房）</span>
              </label>
              {preferences.appliances.length > 0 && (
                <button
                  type="button"
                  onClick={() => onChange({ ...preferences, appliances: [] })}
                  className="text-xs text-slate-400 hover:text-slate-600 underline"
                >
                  清除限制
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {APPLIANCE_OPTIONS.map((appliance) => {
                const isSelected = preferences.appliances.includes(appliance.label);
                return (
                  <button
                    key={appliance.id}
                    type="button"
                    onClick={() => toggleAppliance(appliance.label)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-400'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {getApplianceIcon(appliance.label)}
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 leading-tight">
                        {appliance.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                        {appliance.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Diet Style & Time Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            {/* Diet Style */}
            <div>
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 mb-2.5">
                <Heart className="w-4 h-4 text-rose-500" />
                <span>飲食風格</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DIET_STYLES.map((style) => {
                  const isSelected = preferences.dietStyle === style.label;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => onChange({ ...preferences, dietStyle: style.label })}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500 text-white shadow-xs font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium'
                      }`}
                    >
                      <div className="text-xs leading-tight">{style.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          isSelected ? 'text-emerald-100' : 'text-slate-400'
                        }`}
                      >
                        {style.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Limit & Servings */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 mb-2.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <span>料理時間限制</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {TIME_LIMITS.map((time) => {
                    const isSelected = preferences.timeLimit === time.label;
                    return (
                      <button
                        key={time.id}
                        type="button"
                        onClick={() => onChange({ ...preferences, timeLimit: time.label })}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold ring-1 ring-amber-400'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium'
                        }`}
                      >
                        <div className="text-xs">{time.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{time.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Servings */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 mb-2">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>用餐份量</span>
                </label>
                <div className="flex space-x-2">
                  {['1 人份 (單身料理)', '1-2 人份', '3-4 人份 (家庭餐)'].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onChange({ ...preferences, servings: s })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                        preferences.servings === s
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Exclusions & Dislikes */}
          <div className="pt-2 border-t border-slate-100">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center space-x-1.5 mb-2.5">
              <Ban className="w-4 h-4 text-rose-500" />
              <span>避吃 / 忌口食材（AI 絕不使用）</span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              {COMMON_EXCLUSIONS.map((ex) => {
                const isSelected = preferences.exclusions.includes(ex);
                return (
                  <button
                    key={ex}
                    type="button"
                    onClick={() => toggleExclusion(ex)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-rose-50 border-rose-300 text-rose-700 ring-1 ring-rose-300'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected ? `✕ 不吃 ${ex}` : `不吃 ${ex}`}
                  </button>
                );
              })}

              {/* Custom exclusion input */}
              <form onSubmit={addCustomExclusion} className="inline-flex items-center">
                <input
                  type="text"
                  placeholder="+ 自訂忌口（例如：苦瓜）"
                  value={customExclusion}
                  onChange={(e) => setCustomExclusion(e.target.value)}
                  className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-36"
                />
              </form>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              💡 將根據您目前勾選的{' '}
              <strong className="text-emerald-700">{selectedIngredientsCount} 種</strong>{' '}
              冰箱食材，量身定做實用美味菜單！
            </div>

            <button
              type="button"
              disabled={isLoading || selectedIngredientsCount === 0}
              onClick={onGenerate}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.01]"
            >
              <Sparkles className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>
                {isLoading ? '大廚正為您規劃專屬食譜中...' : '立即根據剩餘食材生成菜單'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
