import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Sparkles, X, Check, RefreshCw, AlertCircle, Eye } from 'lucide-react';
import { Ingredient } from '../types';
import { createDemoFridgeImage } from '../data/mockData';

interface PhotoScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddIngredients: (newIngredients: Ingredient[]) => void;
}

interface DetectedItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  freshness?: string;
  box2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  selected: boolean;
}

export const PhotoScannerModal: React.FC<PhotoScannerModalProps> = ({
  isOpen,
  onClose,
  onAddIngredients,
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [hoveredItemIndex, setHoveredItemIndex] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  const startCamera = async () => {
    try {
      setErrorMsg('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMsg('無法啟動相機，請檢查相機權限或直接上傳照片/使用示範圖');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraPhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setImageSrc(dataUrl);
      stopCamera();
      analyzePhoto(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageSrc(result);
      analyzePhoto(result);
    };
    reader.readAsDataURL(file);
  };

  const loadDemoPhoto = (scenario: 'fresh' | 'fitness') => {
    setErrorMsg('');
    stopCamera();
    const demoDataUrl = createDemoFridgeImage(scenario);
    setImageSrc(demoDataUrl);
    analyzePhoto(demoDataUrl);
  };

  const analyzePhoto = async (base64Image: string) => {
    setIsScanning(true);
    setErrorMsg('');
    setDetectedItems([]);
    setSummary('');

    try {
      const response = await fetch('/api/recognize-ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType: 'image/jpeg',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '辨識失敗');
      }

      const data = await response.json();
      setSummary(data.summary || '辨識完成！');
      
      const items: DetectedItem[] = (data.ingredients || []).map((item: any, idx: number) => ({
        id: `detected-${Date.now()}-${idx}`,
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || '個',
        category: item.category || '蔬菜',
        freshness: item.freshness || '新鮮',
        box2d: item.box2d,
        selected: true,
      }));

      setDetectedItems(items);
    } catch (err: any) {
      console.error('Vision scan error:', err);
      setErrorMsg(err.message || '辨識發生錯誤，請重試或改用其他照片');
    } finally {
      setIsScanning(false);
    }
  };

  const toggleItemSelection = (id: string) => {
    setDetectedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const updateItemQuantity = (id: string, delta: number) => {
    setDetectedItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0.25, Number((item.quantity + delta).toFixed(2)));
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const handleConfirmAdd = () => {
    const selectedList: Ingredient[] = detectedItems
      .filter((i) => i.selected)
      .map((i) => ({
        id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: i.name,
        quantity: i.quantity,
        unit: i.unit,
        category: i.category,
        freshness: i.freshness,
        box2d: i.box2d,
        selected: true,
        addedAt: '剛剛拍照盤點',
      }));

    if (selectedList.length === 0) {
      alert('請至少勾選一項要加入的食材');
      return;
    }

    onAddIngredients(selectedList);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-emerald-100">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
              <Camera className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">AI 照片辨識一鍵盤點</h2>
              <p className="text-xs text-emerald-100/90">
                多模態視覺模型自動框選食材，即時估算數量並填入庫存清單
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center space-x-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Input Controls */}
          {!imageSrc && !isCameraActive && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={startCamera}
                className="group p-6 rounded-2xl border-2 border-dashed border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/60 transition-all flex flex-col items-center justify-center text-center space-y-3 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-base">開啟相機拍照</div>
                  <div className="text-xs text-slate-500 mt-1">直接對準冰箱內部或檯面食材</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group p-6 rounded-2xl border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50/60 transition-all flex flex-col items-center justify-center text-center space-y-3 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-base">上傳手機/電腦照片</div>
                  <div className="text-xs text-slate-500 mt-1">支援 JPG、PNG、WEBP 格式</div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </button>

              <button
                type="button"
                onClick={() => loadDemoPhoto('fresh')}
                className="group p-6 rounded-2xl border-2 border-dashed border-amber-300 hover:border-amber-500 hover:bg-amber-50/60 transition-all flex flex-col items-center justify-center text-center space-y-3 cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-base">快速載入示範照片</div>
                  <div className="text-xs text-slate-500 mt-1">包含高麗菜、雞蛋、豆腐、豬肉等</div>
                </div>
              </button>
            </div>
          )}

          {/* Active Camera View */}
          {isCameraActive && (
            <div className="relative rounded-2xl overflow-hidden bg-black max-h-[420px] flex items-center justify-center">
              <video
                ref={videoRef}
                playsInline
                muted
                className="w-full max-h-[420px] object-cover"
              />
              <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center space-x-4">
                <button
                  onClick={captureCameraPhoto}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full shadow-lg flex items-center space-x-2 transition-transform hover:scale-105"
                >
                  <Camera className="w-5 h-5" />
                  <span>拍照並辨識</span>
                </button>
                <button
                  onClick={stopCamera}
                  className="px-4 py-3 bg-slate-700/80 hover:bg-slate-800 text-white font-medium rounded-full backdrop-blur-sm"
                >
                  取消
                </button>
              </div>
            </div>
          )}

          {/* Image & Bounding Boxes Interactive Display */}
          {imageSrc && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-slate-700">照片視覺分析視圖</span>
                  {isScanning && (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Gemini 3.8 正在逐層掃描與框選食材...</span>
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setImageSrc(null);
                    setDetectedItems([]);
                    setSummary('');
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline"
                >
                  重新選擇照片
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Image with visual bounding boxes */}
                <div className="lg:col-span-7 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 flex items-center justify-center shadow-inner group">
                  <img
                    src={imageSrc}
                    alt="冰箱實景"
                    className="w-full max-h-[380px] object-contain"
                  />

                  {/* Render bounding boxes over image */}
                  {detectedItems.map((item, idx) => {
                    if (!item.box2d || item.box2d.length < 4) return null;
                    const [ymin, xmin, ymax, xmax] = item.box2d;
                    const top = `${ymin / 10}%`;
                    const left = `${xmin / 10}%`;
                    const width = `${(xmax - xmin) / 10}%`;
                    const height = `${(ymax - ymin) / 10}%`;
                    const isHovered = hoveredItemIndex === idx;

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setHoveredItemIndex(idx)}
                        onMouseLeave={() => setHoveredItemIndex(null)}
                        onClick={() => toggleItemSelection(item.id)}
                        style={{ top, left, width, height }}
                        className={`absolute border-2 transition-all cursor-pointer pointer-events-auto rounded-lg flex flex-col justify-start items-start p-1 ${
                          isHovered
                            ? 'border-yellow-400 bg-yellow-400/25 z-20 scale-[1.02] shadow-lg'
                            : item.selected
                            ? 'border-emerald-400 bg-emerald-500/15 z-10'
                            : 'border-slate-400/60 bg-black/20 opacity-60'
                        }`}
                      >
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-white backdrop-blur-sm whitespace-nowrap shadow">
                          {item.name} {item.quantity}{item.unit}
                        </span>
                      </div>
                    );
                  })}

                  {/* Scanning overlay effect */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[2px] flex flex-col items-center justify-center text-white space-y-3">
                      <div className="relative">
                        <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                        <Sparkles className="w-8 h-8 text-emerald-300 absolute inset-0 m-auto" />
                      </div>
                      <p className="font-semibold text-emerald-100 text-sm">
                        AI 多模態視覺深度分析中...
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Detected Ingredients Checklist */}
                <div className="lg:col-span-5 flex flex-col space-y-3">
                  {summary && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 leading-relaxed">
                      💡 <strong>AI 盤點觀察：</strong>{summary}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                    <span>辨識出 {detectedItems.length} 種食材（點擊可勾選/修改）</span>
                    <button
                      onClick={() =>
                        setDetectedItems((prev) =>
                          prev.map((i) => ({ ...i, selected: !prev.every((p) => p.selected) }))
                        )
                      }
                      className="text-emerald-700 hover:underline"
                    >
                      {detectedItems.every((p) => p.selected) ? '全部取消' : '全選'}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                    {detectedItems.map((item, idx) => {
                      const isHovered = hoveredItemIndex === idx;
                      return (
                        <div
                          key={item.id}
                          onMouseEnter={() => setHoveredItemIndex(idx)}
                          onMouseLeave={() => setHoveredItemIndex(null)}
                          className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-sm ${
                            isHovered
                              ? 'border-yellow-400 bg-yellow-50/50 shadow-sm'
                              : item.selected
                              ? 'border-emerald-200 bg-white hover:border-emerald-300'
                              : 'border-slate-200 bg-slate-50/60 opacity-60'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={item.selected}
                              onChange={() => toggleItemSelection(item.id)}
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                            />
                            <div className="truncate">
                              <span className="font-semibold text-slate-800 truncate mr-2">
                                {item.name}
                              </span>
                              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                                {item.category}
                              </span>
                            </div>
                          </div>

                          {/* Quantity control */}
                          <div className="flex items-center space-x-1.5 ml-2">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.id, -1)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                            >
                              -
                            </button>
                            <span className="text-xs font-semibold w-10 text-center text-slate-800">
                              {item.quantity} {item.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.id, 1)}
                              className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {detectedItems.length === 0 && !isScanning && (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        尚未辨識到食材，請嘗試更清晰的冰箱照片或手動新增食材。
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {detectedItems.length > 0 && (
              <span>已勾選 {detectedItems.filter((i) => i.selected).length} 項食材準備入庫</span>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
            >
              取消
            </button>
            <button
              disabled={isScanning || detectedItems.filter((i) => i.selected).length === 0}
              onClick={handleConfirmAdd}
              className="px-5 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>
                確認加入冰箱庫存 ({detectedItems.filter((i) => i.selected).length})
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
