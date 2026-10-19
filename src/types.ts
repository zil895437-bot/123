export interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: '蔬菜' | '肉類' | '蛋豆製品' | '海鮮' | '乳品飲品' | '水果' | '澱粉主食' | '醬料其他' | string;
  freshness?: '新鮮' | '建議盡快食用' | '常備存貨' | '冷凍保存' | string;
  box2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  selected: boolean;
  addedAt?: string;
}

export interface UsedIngredient {
  name: string;
  quantityUsed: number;
  unit: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  tip?: string;
  timerMinutes?: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  difficulty: '超簡單' | '簡易' | '中等' | string;
  applianceUsed: string;
  caloriesPerServing?: number;
  proteinGrams?: number;
  tags: string[];
  usedIngredients: UsedIngredient[];
  pantryItemsNeeded: string[];
  steps: RecipeStep[];
  chefSecret?: string;
}

export interface DietaryPreferences {
  appliances: string[];
  dietStyle: string;
  timeLimit: string;
  exclusions: string[];
  servings: string;
  specialNotes?: string;
}

export interface DeductionItem {
  name: string;
  before: number;
  deducted: number;
  after: number;
  unit: string;
}

export interface CookingHistoryItem {
  id: string;
  recipeName: string;
  cookedAt: string;
  deductions: DeductionItem[];
  applianceUsed: string;
}
