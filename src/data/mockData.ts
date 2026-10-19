import { Ingredient } from '../types';

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: 'ing-1',
    name: '雞蛋',
    quantity: 4,
    unit: '顆',
    category: '蛋豆製品',
    freshness: '新鮮',
    selected: true,
    addedAt: '今天',
  },
  {
    id: 'ing-2',
    name: '高麗菜',
    quantity: 0.5,
    unit: '顆',
    category: '蔬菜',
    freshness: '新鮮',
    selected: true,
    addedAt: '今天',
  },
  {
    id: 'ing-3',
    name: '板豆腐',
    quantity: 1,
    unit: '塊',
    category: '蛋豆製品',
    freshness: '建議盡快食用',
    selected: true,
    addedAt: '昨天',
  },
  {
    id: 'ing-4',
    name: '豬肉片',
    quantity: 200,
    unit: '克',
    category: '肉類',
    freshness: '冷凍保存',
    selected: true,
    addedAt: '3天前',
  },
  {
    id: 'ing-5',
    name: '青蔥',
    quantity: 3,
    unit: '根',
    category: '蔬菜',
    freshness: '新鮮',
    selected: true,
    addedAt: '今天',
  },
  {
    id: 'ing-6',
    name: '洋蔥',
    quantity: 1,
    unit: '顆',
    category: '蔬菜',
    freshness: '常備存貨',
    selected: true,
    addedAt: '本週',
  },
  {
    id: 'ing-7',
    name: '金針菇',
    quantity: 1,
    unit: '包',
    category: '蔬菜',
    freshness: '建議盡快食用',
    selected: true,
    addedAt: '昨天',
  },
];

export const APPLIANCE_OPTIONS = [
  { id: 'single_burner', label: '單口瓦斯爐', icon: 'Flame', desc: '適合一鍋到底、快炒' },
  { id: 'rice_cooker', label: '電鍋 / 蒸煮鍋', icon: 'Soup', desc: '蒸煮燉滷、免顧火' },
  { id: 'air_fryer', label: '氣炸鍋', icon: 'Wind', desc: '酥脆少油、快速加熱' },
  { id: 'microwave', label: '微波爐', icon: 'Zap', desc: '極速叮熟、省時方便' },
  { id: 'oven', label: '烤箱', icon: 'Square', desc: '烘烤焗烤、慢熟入味' },
  { id: 'no_fire', label: '免開火 (涼拌/生食)', icon: 'Sparkles', desc: '免油煙、開胃輕食' },
];

export const DIET_STYLES = [
  { id: 'balanced', label: '均衡健康', desc: '菜肉均衡，老少咸宜' },
  { id: 'high_protein', label: '高蛋白增肌', desc: '強化肉蛋豆比例，蛋白質滿滿' },
  { id: 'keto_low_carb', label: '低醣生酮', desc: '低碳水化合物，少糖無澱粉' },
  { id: 'low_calorie', label: '清淡減脂', desc: '少油少鹽，清爽無負擔' },
  { id: 'home_cooking', label: '家常快炒', desc: '濃郁下飯，暖胃家常風味' },
  { id: 'vegan', label: '全素 / 純植物', desc: '無肉無蛋奶，純天然蔬食' },
  { id: 'lacto_ovo', label: '蛋奶素', desc: '可食用蛋製品與乳品' },
];

export const TIME_LIMITS = [
  { id: '15_min', label: '⚡ 極速 15 分鐘出菜', desc: '下班回家快速解決' },
  { id: '30_min', label: '⏱️ 30 分鐘內出菜', desc: '標準料理時間，風味更豐富' },
  { id: 'unlimited', label: '🍲 不限時間 (精緻慢煮)', desc: '細火慢燉，適合週末享受' },
];

export const COMMON_EXCLUSIONS = [
  '海鮮',
  '辛辣 (辣椒)',
  '香菜',
  '牛肉',
  '乳製品',
  '蔥薑蒜五辛',
  '花生堅果',
];

export const QUICK_SWAP_REASONS = [
  '這道我不喜歡，換一道不用開火的',
  '換成清爽解膩的暖胃湯品',
  '我想吃酸辣開胃下飯菜',
  '換成高蛋白飽足感肉料理',
  '換成只要 10 分鐘的懶人微波/涼拌菜',
  '換成小孩子也超愛的甜鹹口味',
];

// Helper to generate a realistic SVG fridge photo data URL for demo testing
export function createDemoFridgeImage(scenario: 'fresh' | 'fitness' | 'minimalist' = 'fresh'): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background fridge interior (cool metallic white/blue)
  const bgGrad = ctx.createLinearGradient(0, 0, 0, 600);
  bgGrad.addColorStop(0, '#f0f4f8');
  bgGrad.addColorStop(0.5, '#e2e8f0');
  bgGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 800, 600);

  // Fridge shelves (glass shelves with glow)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillRect(40, 200, 720, 14);
  ctx.fillRect(40, 390, 720, 14);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(40, 214, 720, 4);
  ctx.fillRect(40, 404, 720, 4);

  // Draw items
  // Shelf 1: Eggs & Tofu & Drinks
  // Egg carton
  ctx.fillStyle = '#e2c9a5';
  ctx.fillRect(80, 120, 180, 80);
  ctx.fillStyle = '#d4b387';
  ctx.fillRect(75, 115, 190, 15);
  // Eggs
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(110 + i * 36, 155, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#fce7c9';
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#d79b5c';
    ctx.stroke();
  }
  ctx.fillStyle = '#475569';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('新鮮優質雞蛋 (4顆)', 90, 190);

  // Tofu package
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(300, 130, 110, 70);
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 3;
  ctx.strokeRect(300, 130, 110, 70);
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(300, 130, 110, 22);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('有機板豆腐 1塊', 310, 146);

  // Milk bottle
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(460, 90, 60, 110);
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(465, 80, 50, 15);
  ctx.fillStyle = '#1e293b';
  ctx.fillText('全脂鮮奶', 468, 150);

  // Shelf 2: Veggies (Cabbage, Onions, Scallions)
  // Cabbage (half)
  ctx.beginPath();
  ctx.arc(170, 320, 65, 0, Math.PI, true);
  ctx.fillStyle = '#86efac';
  ctx.fill();
  ctx.fillStyle = '#bbf7d0';
  ctx.beginPath();
  ctx.arc(170, 320, 55, 0, Math.PI, true);
  ctx.fill();
  ctx.fillStyle = '#166534';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('高麗菜半顆', 135, 345);

  // Scallions
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(330, 385);
  ctx.lineTo(430, 260);
  ctx.moveTo(345, 385);
  ctx.lineTo(440, 270);
  ctx.moveTo(360, 385);
  ctx.lineTo(450, 280);
  ctx.stroke();
  ctx.fillStyle = '#15803d';
  ctx.fillText('翠綠青蔥 3根', 360, 375);

  // Onion
  ctx.beginPath();
  ctx.arc(560, 335, 36, 0, Math.PI * 2);
  ctx.fillStyle = '#fde68a';
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.stroke();
  ctx.fillStyle = '#92400e';
  ctx.fillText('新鮮洋蔥 1顆', 525, 380);

  // Shelf 3: Pork tray & Mushrooms
  // Pork tray
  ctx.fillStyle = '#fecdd3';
  ctx.fillRect(100, 480, 180, 80);
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(110, 490, 160, 60);
  // Marble lines
  ctx.strokeStyle = '#ffe4e6';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(120, 500); ctx.lineTo(160, 540);
  ctx.moveTo(180, 495); ctx.lineTo(240, 535);
  ctx.stroke();
  ctx.fillStyle = '#881337';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('台灣黑豬肉片 200g', 125, 575);

  // Enoki mushroom
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(340, 470, 70, 95);
  ctx.fillStyle = '#d97706';
  ctx.fillRect(340, 470, 70, 20);
  ctx.fillStyle = '#374151';
  ctx.fillText('金針菇 1包', 345, 580);

  // Carrots
  ctx.fillStyle = '#f97316';
  ctx.beginPath();
  ctx.moveTo(500, 550);
  ctx.lineTo(600, 490);
  ctx.lineTo(605, 510);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#9a3412';
  ctx.fillText('鮮甜紅蘿蔔 1根', 510, 580);

  // Top header text
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(0, 0, 800, 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('📸 冰箱內部實景視角 (AI 正在框選辨識中...)', 25, 28);

  return canvas.toDataURL('image/jpeg', 0.9);
}
