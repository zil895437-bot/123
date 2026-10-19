import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API: Recognize ingredients from fridge image
app.post('/api/recognize-ingredients', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: '請提供圖片數據' });
    }

    // Clean base64 prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');

    const prompt = `你是一位專業的智慧廚房食材盤點 AI。請仔細分析這張冰箱或廚房儲藏照片。
請辨識出畫面中所有清晰可辨的生鮮食材、蔬菜、肉類、蛋豆製品、乳製品、水果、主食等。
請特別注意：
1. 估算數量與常用單位（例如：高麗菜 0.5 顆、雞蛋 4 顆、板豆腐 1 塊、紅蘿蔔 1 根、豬梅花肉 1 盒、青蔥 2 根）。
2. 提供食材在照片中的大致座標邊界框 [ymin, xmin, ymax, xmax]，範圍為 0 到 1000（整數），以便在畫面上框出食材。
3. 標記類別（蔬菜, 肉類, 蛋豆製品, 海鮮, 乳品飲品, 水果, 澱粉主食, 醬料其他）。
4. 預估保鮮狀態（例如「新鮮」、「建議盡快食用」、「常備存貨」）。
請以繁體中文回答，並輸出符合要求的 JSON 格式。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: '對冰箱目前狀態的簡短觀察與烹飪潛力建議（例如：辨識到5種食材，蔬菜與蛋白質充裕）',
            },
            ingredients: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: '食材名稱（繁體中文，如：高麗菜、雞蛋、板豆腐）' },
                  quantity: { type: Type.NUMBER, description: '數量估算值' },
                  unit: { type: Type.STRING, description: '計量單位（顆、根、塊、盒、包、克、片等）' },
                  category: {
                    type: Type.STRING,
                    description: '類別：蔬菜、肉類、蛋豆製品、海鮮、乳品飲品、水果、澱粉主食、醬料其他',
                  },
                  freshness: {
                    type: Type.STRING,
                    description: '新鮮度或狀態建議',
                  },
                  box2d: {
                    type: Type.ARRAY,
                    items: { type: Type.INTEGER },
                    description: '[ymin, xmin, ymax, xmax] 範圍 0-1000',
                  },
                },
                required: ['name', 'quantity', 'unit', 'category'],
              },
            },
          },
          required: ['summary', 'ingredients'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error recognizing ingredients:', error);
    return res.status(500).json({
      error: error.message || '辨識食材失敗，請重試或手動輸入食材',
    });
  }
});

// API: Generate customized recipes based on inventory, appliances & preferences
app.post('/api/generate-recipes', async (req, res) => {
  try {
    const {
      ingredients = [],
      appliances = [],
      dietStyle = '均衡健康',
      timeLimit = '不限',
      exclusions = [],
      servings = '1-2 人份',
      recipeCount = 3,
      specialRequest = '',
    } = req.body;

    if (!ingredients.length) {
      return res.status(400).json({ error: '冰箱目前沒有可用食材，請先拍照或新增食材！' });
    }

    const ingredientListStr = ingredients
      .map((item: any) => `- ${item.name}：約 ${item.quantity} ${item.unit}`)
      .join('\n');

    const prompt = `你是一位頂級私廚與清冰箱料理大師。
使用者的冰箱現有食材清單如下：
${ingredientListStr}

烹飪限制與個人偏好：
- 烹飪設備限制：${appliances.length > 0 ? appliances.join('、') : '不限設備（常規廚房）'}
  （特別注意：如果指定了「免開火」，絕不可使用火爐或熱烹飪；若指定「僅有電鍋」或「僅有氣炸鍋」，請嚴格依賴該設備設計菜色！）
- 飲食風格：${dietStyle}
- 料理時間上限：${timeLimit}
- 避吃 / 忌口食材：${exclusions.length > 0 ? exclusions.join('、') : '無特別忌口'}
- 用餐份量：${servings}
${specialRequest ? `- 使用者特殊心願要求：${specialRequest}` : ''}

任務目標：
請生成 ${recipeCount} 道極具吸引力、美味且切實可行的清冰箱食譜。
嚴格規則：
1. 優先使用冰箱現有食材，並詳細列出本道菜會消耗掉的具體數量（例如雞蛋用掉 2 顆、板豆腐用掉 1 塊）。
2. 家常基礎調味料（油、鹽、醬油、黑胡椒、糖、水等）可視為常備品，列在 pantryItemsNeeded。
3. 嚴格遵守設備限制與飲食偏好（如15分鐘出菜、低醣生酮或高蛋白）。
4. 步驟要清晰具體，並標註關鍵時間方便計時。
5. 請以繁體中文回答。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING, description: '菜名（吸睛美味）' },
                  description: { type: Type.STRING, description: '菜色亮點描述與風味特色' },
                  prepTimeMinutes: { type: Type.INTEGER, description: '備料時間（分鐘）' },
                  cookTimeMinutes: { type: Type.INTEGER, description: '烹飪時間（分鐘）' },
                  difficulty: { type: Type.STRING, description: '超簡單 / 簡易 / 中等' },
                  applianceUsed: { type: Type.STRING, description: '主要使用的設備（例如：氣炸鍋、電鍋、免開火、單口瓦斯爐）' },
                  caloriesPerServing: { type: Type.INTEGER, description: '預估每份熱量 (大卡)' },
                  proteinGrams: { type: Type.INTEGER, description: '每份蛋白質 (公克)' },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '特點標籤，如「高蛋白」「15分鐘出菜」「免開火」',
                  },
                  usedIngredients: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING, description: '使用的冰箱食材名稱（必須與冰箱食材名稱精確匹配）' },
                        quantityUsed: { type: Type.NUMBER, description: '本料理消耗的數量' },
                        unit: { type: Type.STRING, description: '單位' },
                      },
                      required: ['name', 'quantityUsed', 'unit'],
                    },
                    description: '本道料理使用到的冰箱食材及扣除數量',
                  },
                  pantryItemsNeeded: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: '常備廚房調味料（鹽、胡椒、油、醬油等）',
                  },
                  steps: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        stepNumber: { type: Type.INTEGER },
                        instruction: { type: Type.STRING, description: '具體操作步驟說明' },
                        tip: { type: Type.STRING, description: '大廚小叮嚀' },
                        timerMinutes: { type: Type.INTEGER, description: '本步驟建議計時分鐘數（若無需計時填 0）' },
                      },
                      required: ['stepNumber', 'instruction'],
                    },
                  },
                  chefSecret: { type: Type.STRING, description: '主廚提味私房秘訣' },
                },
                required: [
                  'name',
                  'description',
                  'prepTimeMinutes',
                  'cookTimeMinutes',
                  'difficulty',
                  'applianceUsed',
                  'tags',
                  'usedIngredients',
                  'steps',
                ],
              },
            },
          },
          required: ['recipes'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"recipes":[]}');
    // Ensure IDs
    const recipesWithId = (parsed.recipes || []).map((r: any, idx: number) => ({
      ...r,
      id: r.id || `recipe-${Date.now()}-${idx}`,
    }));

    return res.json({ recipes: recipesWithId });
  } catch (error: any) {
    console.error('Error generating recipes:', error);
    return res.status(500).json({
      error: error.message || '生成食譜時發生錯誤，請稍後重試',
    });
  }
});

// API: Dynamic Recipe Swapping ("這道我不喜歡，換一道不用開火的")
app.post('/api/swap-recipe', async (req, res) => {
  try {
    const {
      currentRecipe,
      allOtherRecipes = [],
      reason = '這道我不喜歡，換一道不用開火的',
      ingredients = [],
      appliances = [],
      dietStyle = '均衡健康',
      timeLimit = '不限',
      exclusions = [],
      servings = '1-2 人份',
    } = req.body;

    const ingredientListStr = ingredients
      .map((item: any) => `- ${item.name}：剩餘約 ${item.quantity} ${item.unit}`)
      .join('\n');

    const otherRecipeNames = allOtherRecipes.map((r: any) => r.name).join('、');

    const prompt = `你是一位清冰箱動態換菜大師。
使用者不喜歡目前的這道菜：「${currentRecipe?.name || '當前推薦菜色'}」。
使用者提出換菜要求：「${reason}」。

目前冰箱剩餘食材清單：
${ingredientListStr}

目前其他已推薦菜色（請勿重複此類菜色）：
${otherRecipeNames || '無'}

條件限制：
- 烹飪設備限制：${appliances.length > 0 ? appliances.join('、') : '不限設備'}
- 飲食風格：${dietStyle}
- 料理時間上限：${timeLimit}
- 忌口：${exclusions.join('、')}
- 份量：${servings}

請嚴格針對使用者的換菜要求「${reason}」，以現有剩餘食材為基礎，重新生成【一道】截然不同的精彩替換菜色！
輸出繁體中文 JSON 格式。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipe: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                prepTimeMinutes: { type: Type.INTEGER },
                cookTimeMinutes: { type: Type.INTEGER },
                difficulty: { type: Type.STRING },
                applianceUsed: { type: Type.STRING },
                caloriesPerServing: { type: Type.INTEGER },
                proteinGrams: { type: Type.INTEGER },
                tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                usedIngredients: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      quantityUsed: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                    },
                    required: ['name', 'quantityUsed', 'unit'],
                  },
                },
                pantryItemsNeeded: { type: Type.ARRAY, items: { type: Type.STRING } },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      stepNumber: { type: Type.INTEGER },
                      instruction: { type: Type.STRING },
                      tip: { type: Type.STRING },
                      timerMinutes: { type: Type.INTEGER },
                    },
                    required: ['stepNumber', 'instruction'],
                  },
                },
                chefSecret: { type: Type.STRING },
              },
              required: [
                'name',
                'description',
                'prepTimeMinutes',
                'cookTimeMinutes',
                'difficulty',
                'applianceUsed',
                'tags',
                'usedIngredients',
                'steps',
              ],
            },
          },
          required: ['recipe'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const newRecipe = {
      ...(parsed.recipe || {}),
      id: `recipe-swapped-${Date.now()}`,
    };

    return res.json({ recipe: newRecipe });
  } catch (error: any) {
    console.error('Error swapping recipe:', error);
    return res.status(500).json({
      error: error.message || '換菜失敗，請重試',
    });
  }
});

// Start Express and attach Vite middleware in dev mode
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
