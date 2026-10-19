import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Undo2,
  Timer as TimerIcon,
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Recipe, Ingredient, DeductionItem } from '../types';

interface CookingModeModalProps {
  recipe: Recipe | null;
  inventory: Ingredient[];
  isOpen: boolean;
  onClose: () => void;
  onConfirmDeduction: (
    recipe: Recipe,
    deductions: DeductionItem[]
  ) => void;
  onUndoDeduction?: (deductions: DeductionItem[]) => void;
}

export const CookingModeModal: React.FC<CookingModeModalProps> = ({
  recipe,
  inventory,
  isOpen,
  onClose,
  onConfirmDeduction,
  onUndoDeduction,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [lastDeductions, setLastDeductions] = useState<DeductionItem[]>([]);
  const [hasUndone, setHasUndone] = useState(false);

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(0);
      setIsFinished(false);
      setHasUndone(false);
      setLastDeductions([]);
      resetTimerForStep(0);
    }
    return () => {
      stopTimer();
      stopSpeech();
    };
  }, [isOpen, recipe]);

  if (!isOpen || !recipe) return null;

  const currentStep = recipe.steps[currentStepIndex] || recipe.steps[0];
  const totalSteps = recipe.steps.length;

  const resetTimerForStep = (index: number) => {
    stopTimer();
    const step = recipe.steps[index];
    if (step && step.timerMinutes && step.timerMinutes > 0) {
      setTimerSecondsLeft(step.timerMinutes * 60);
    } else {
      setTimerSecondsLeft(null);
    }
  };

  const startTimer = () => {
    if (timerSecondsLeft === null || timerSecondsLeft <= 0) return;
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimerSecondsLeft((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimerRunning(false);
          playTimerAlarm();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
  };

  const playTimerAlarm = () => {
    // Audio beep using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.2);
    } catch (e) {
      console.warn('AudioContext not available:', e);
    }
  };

  const speakCurrentStep = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `第 ${currentStep.stepNumber} 步：${currentStep.instruction}。${
      currentStep.tip ? `主廚提示：${currentStep.tip}` : ''
    }`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'zh-TW';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const stopSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const goToNextStep = () => {
    stopSpeech();
    if (currentStepIndex < totalSteps - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      resetTimerForStep(nextIndex);
    }
  };

  const goToPrevStep = () => {
    stopSpeech();
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      resetTimerForStep(prevIndex);
    }
  };

  // Complete cooking & trigger automatic deduction
  const handleCompleteAndDeduct = () => {
    // Calculate deductions
    const deductions: DeductionItem[] = [];

    recipe.usedIngredients.forEach((used) => {
      // Find matching ingredient in inventory (case-insensitive)
      const invItem = inventory.find(
        (i) =>
          i.name.trim().toLowerCase() === used.name.trim().toLowerCase() ||
          i.name.includes(used.name) ||
          used.name.includes(i.name)
      );

      if (invItem) {
        const before = invItem.quantity;
        const deducted = used.quantityUsed;
        const after = Math.max(0, Number((before - deducted).toFixed(2)));
        deductions.push({
          name: invItem.name,
          before,
          deducted,
          after,
          unit: invItem.unit || used.unit,
        });
      }
    });

    setLastDeductions(deductions);
    setIsFinished(true);

    // Call deduction handler
    onConfirmDeduction(recipe, deductions);

    // Confetti celebration!
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#065f46', '#f59e0b', '#3b82f6', '#ec4899'],
      });
    } catch (e) {
      console.warn('Confetti error:', e);
    }
  };

  const handleUndo = () => {
    if (onUndoDeduction && lastDeductions.length > 0) {
      onUndoDeduction(lastDeductions);
      setHasUndone(true);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-emerald-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Flame className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-200 font-bold">
                烹飪模式 Cooking Mode
              </div>
              <h2 className="text-lg sm:text-xl font-bold truncate max-w-xs sm:max-w-md">
                {recipe.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {'speechSynthesis' in window && !isFinished && (
              <button
                type="button"
                onClick={speakCurrentStep}
                title={isSpeaking ? '停止朗讀' : '語音朗讀步驟'}
                className={`p-2 rounded-xl transition-colors ${
                  isSpeaking
                    ? 'bg-amber-400 text-slate-900 animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isSpeaking ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
            )}

            <button
              onClick={() => {
                stopSpeech();
                stopTimer();
                onClose();
              }}
              className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isFinished ? (
            <>
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>
                    步驟 {currentStepIndex + 1} / {totalSteps}
                  </span>
                  <span>{Math.round(((currentStepIndex + 1) / totalSteps) * 100)}% 完成</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${((currentStepIndex + 1) / totalSteps) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Main Step Instruction Card (Big clean typography for cooking) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-50 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6 min-h-[220px]">
                <div className="space-y-4">
                  <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <span>Step {currentStep.stepNumber}</span>
                  </div>

                  <p className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug tracking-tight">
                    {currentStep.instruction}
                  </p>

                  {currentStep.tip && (
                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
                      💡 <strong>主廚叮嚀：</strong>
                      {currentStep.tip}
                    </div>
                  )}
                </div>

                {/* Step Timer if configured */}
                {timerSecondsLeft !== null && (
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between shadow-2xs">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2.5 rounded-xl ${
                          isTimerRunning
                            ? 'bg-amber-100 text-amber-700 animate-pulse'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <TimerIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-slate-400">
                          本步驟建議計時
                        </div>
                        <div className="text-2xl font-black font-mono text-slate-800 tracking-wider">
                          {formatTimer(timerSecondsLeft)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {isTimerRunning ? (
                        <button
                          type="button"
                          onClick={pauseTimer}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <Pause className="w-4 h-4" />
                          <span>暫停</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={startTimer}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer"
                        >
                          <Play className="w-4 h-4" />
                          <span>開始倒數</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => resetTimerForStep(currentStepIndex)}
                        title="重設計時"
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step Navigation Controls */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentStepIndex === 0}
                  onClick={goToPrevStep}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 rounded-xl flex items-center space-x-1 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>上一步</span>
                </button>

                {currentStepIndex < totalSteps - 1 ? (
                  <button
                    type="button"
                    onClick={goToNextStep}
                    className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center space-x-1.5 cursor-pointer shadow-xs transition-all"
                  >
                    <span>下一步</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="text-xs text-emerald-700 font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>已完成所有烹飪步驟！</span>
                  </div>
                )}
              </div>

              {/* Bottom: Deductions Preview & Complete Button */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>完成本道菜將自動扣除的冰箱食材：</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {recipe.usedIngredients.map((ing, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-xl text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium"
                    >
                      {ing.name}：扣除 <strong>{ing.quantityUsed} {ing.unit}</strong>
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleCompleteAndDeduct}
                  className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer hover:scale-[1.01]"
                >
                  <Check className="w-5 h-5" />
                  <span>🎉 大功告成！確認上菜並扣除冰箱庫存</span>
                </button>
              </div>
            </>
          ) : (
            /* Finished & Deducted Screen */
            <div className="py-6 text-center space-y-6 animate-scale-up">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900">
                  烹飪完成！美味上桌 🍽️
                </h3>
                <p className="text-sm text-slate-500">
                  系統已自動為您將用掉的食材從冰箱庫存中精準扣除！
                </p>
              </div>

              {/* Deduction Detail Card */}
              <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2.5">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  🧾 食材庫存扣除明細：
                </div>
                {lastDeductions.length > 0 ? (
                  <div className="space-y-1.5">
                    {lastDeductions.map((d, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-white rounded-xl border border-slate-100 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-800">{d.name}</span>
                        <div className="flex items-center space-x-2 text-slate-600">
                          <span>
                            {d.before} {d.unit}
                          </span>
                          <span className="text-rose-500 font-bold">
                            - {d.deducted}
                          </span>
                          <span>➔</span>
                          <span
                            className={`font-black ${
                              d.after === 0 ? 'text-amber-600' : 'text-emerald-700'
                            }`}
                          >
                            {d.after === 0 ? '已用罄' : `剩餘 ${d.after} ${d.unit}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">
                    本道料理食材與現有庫存已同步扣減。
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {!hasUndone ? (
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                  >
                    <Undo2 className="w-4 h-4" />
                    <span>手滑按錯？一鍵復原扣除</span>
                  </button>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold">
                    ✓ 已成功復原剛才扣除的食材！
                  </span>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  返回主頁繼續規劃
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
