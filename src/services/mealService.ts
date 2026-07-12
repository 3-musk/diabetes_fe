import { Alert } from 'react-native';
import type { NutritionData, NutritionRange } from '../components/home/types';
import type { MealImpactResponse } from '../constants/mealImpact';
import { apiClient } from '../utils/apiClient';
import {
  DayMealsResponse,
  LoggedMeal,
  MEAL_SLOT_META,
  MEAL_SLOT_ORDER,
  MealPortionType,
  MealSearchResult,
  MealSearchSuggestion,
  MealSelectionItem,
  MealSlotData,
  MealSlotId,
} from '../constants/meals';
import type { MealCompareResponse, SwapMealResponse } from '../constants/swapMeal';

const EMPTY_RANGE: NutritionRange = {
  currentVal: null,
  rangeMax: 0,
  rangeMin: 0,
  status: null,
};

export const createEmptyNutrition = (): NutritionData => ({
  carbohydrates: { ...EMPTY_RANGE },
  totalFat: { ...EMPTY_RANGE },
  protein: { ...EMPTY_RANGE },
  dietaryFiber: { ...EMPTY_RANGE },
  addedSugar: { ...EMPTY_RANGE },
});

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=120&h=120&fit=crop';

const DEFAULT_RECOMMENDATIONS: Record<MealSlotId, string[]> = {
  breakfast: ['Omelet + Coffee + Banana'],
  lunch: ['Brown rice + Dal + Salad'],
  evening: ['Fruit bowl + Nuts'],
  dinner: ['Grilled chicken + Vegetables'],
};

const createEmptySlots = (): MealSlotData[] =>
  MEAL_SLOT_ORDER.map(id => {
    const meta = MEAL_SLOT_META[id];
    return {
      id,
      label: meta.label,
      icon: meta.icon,
      recommendedCalories: 0,
      recommendations: [],
      loggedMeals: [],
    };
  });

const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDateKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

const mealsByDate: Record<string, DayMealsResponse> = {};
const selectionSessions: Record<string, MealSelectionItem[]> = {};

const sessionKey = (dateKey: string, slotId: MealSlotId) => `${dateKey}:${slotId}`;

/** Clear all in-memory meal data — call this on logout */
export const clearMealCache = () => {
  Object.keys(mealsByDate).forEach(k => delete mealsByDate[k]);
  Object.keys(selectionSessions).forEach(k => delete selectionSessions[k]);
};

const buildDayMeals = (date: Date): DayMealsResponse => {
  const dateKey = formatDateKey(date);

  if (!mealsByDate[dateKey]) {
    mealsByDate[dateKey] = {
      date: dateKey,
      nutrition: createEmptyNutrition(),
      calories: {
        consumed: 0,
        total: 2500,
      },
      slots: createEmptySlots(),
    };
  }

  return mealsByDate[dateKey];
};

const recalculateConsumed = (day: DayMealsResponse) => {
  day.calories.consumed = day.slots.reduce(
    (sum, slot) => sum + slot.loggedMeals.reduce((slotSum, meal) => slotSum + meal.calories, 0),
    0
  );
};



export const getMealsByDate = async (date: Date): Promise<DayMealsResponse> => {
  const dateKey = formatDateKey(date);
  try {
    const response = await apiClient.get(`/api/meals/daily-summary?date=${dateKey}`);
    const result = response.data;
    
    if (result.success && result.data) {
      const summary = result.data.summary;
      const apiSlots = result.data.mealSlots || [];
      
      const nutrition: NutritionData = {
        carbohydrates: {
          currentVal: summary.nutrients.carbohydrates?.currentVal ?? null,
          rangeMax: summary.nutrients.carbohydrates?.rangeMax ?? 0,
          rangeMin: summary.nutrients.carbohydrates?.rangeMin ?? 0,
          status: summary.nutrients.carbohydrates?.status ?? null,
        },
        totalFat: {
          currentVal: summary.nutrients.totalFat?.currentVal ?? null,
          rangeMax: summary.nutrients.totalFat?.rangeMax ?? 0,
          rangeMin: summary.nutrients.totalFat?.rangeMin ?? 0,
          status: summary.nutrients.totalFat?.status ?? null,
        },
        protein: {
          currentVal: summary.nutrients.protein?.currentVal ?? null,
          rangeMax: summary.nutrients.protein?.rangeMax ?? 0,
          rangeMin: summary.nutrients.protein?.rangeMin ?? 0,
          status: summary.nutrients.protein?.status ?? null,
        },
        dietaryFiber: {
          currentVal: summary.nutrients.dietaryFibre?.currentVal ?? null,
          rangeMax: summary.nutrients.dietaryFibre?.rangeMax ?? 0,
          rangeMin: summary.nutrients.dietaryFibre?.rangeMin ?? 0,
          status: summary.nutrients.dietaryFibre?.status ?? null,
        },
        addedSugar: {
          currentVal: summary.nutrients.addedSugar?.currentVal ?? null,
          rangeMax: summary.nutrients.addedSugar?.rangeMax ?? 0,
          rangeMin: summary.nutrients.addedSugar?.rangeMin ?? 0,
          status: summary.nutrients.addedSugar?.status ?? null,
        },
      };

      const mapSlotName = (name: string): MealSlotId => {
        const lower = name.toLowerCase();
        if (lower === 'snack') return 'evening';
        if (lower === 'afternoon') return 'lunch';
        return lower as MealSlotId;
      };

      const emptySlots = createEmptySlots();
      
      const slots: MealSlotData[] = emptySlots.map(defaultSlot => {
        const apiSlot = apiSlots.find((s: any) => mapSlotName(s.mealTypeName) === defaultSlot.id);
        if (apiSlot) {
          return {
            ...defaultSlot,
            recommendedCalories: apiSlot.recommendedCalories ?? defaultSlot.recommendedCalories,
            recommendations: apiSlot.recommendationLabel ? [apiSlot.recommendationLabel] : [],
            loggedMeals: (apiSlot.loggedMeals || []).map((lm: any) => {
              let timeLabel = lm.timeLabel || '';
              if (lm.loggedAt) {
                 const d = new Date(lm.loggedAt);
                 if (!isNaN(d.getTime())) {
                   timeLabel = `${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} - ${apiSlot.mealTypeName || defaultSlot.label}`;
                 }
              }
              
              return {
                id: lm.mealId || lm.id || Date.now().toString(),
                name: lm.description || lm.name || '',
                calories: lm.approxCalories || lm.calories || 0,
                timeLabel,
                approxCal: lm.approxCalories || lm.approxCal || lm.calories || 0,
              };
            }),
          };
        }
        return defaultSlot;
      });

      return {
        date: dateKey,
        nutrition,
        calories: {
          consumed: summary.caloriesConsumed ?? 0,
          total: summary.dailyCalorieTargetFromCarePlan ?? 2000,
        },
        slots,
      };
    } else {
      if (result.message) {
        Alert.alert('Meals', result.message);
      }
    }
  } catch (error: any) {
    console.warn('Error fetching meals:', error.message || error);
    const result = error.response?.data;
    if (result && result.message) {
      Alert.alert('Meals', result.message);
    }
  }

  // Clean empty fallback if API fails
  const emptySlots = createEmptySlots();
  return {
    date: dateKey,
    nutrition: createEmptyNutrition(),
    calories: {
      consumed: 0,
      total: 0,
    },
    slots: emptySlots,
  };
};

export const getMealSelection = async (
  dateKey: string,
  slotId: MealSlotId
): Promise<MealSelectionItem[]> => {
  await delay(200);
  return [...(selectionSessions[sessionKey(dateKey, slotId)] ?? [])];
};

export const uploadMealImage = async (
  imageUri: string,
  dateKey: string,
  slotId: MealSlotId
): Promise<MealSelectionItem[]> => {
  try {
    const mealTypeIdMap: Record<MealSlotId, string> = {
      breakfast: '1',
      lunch: '2',
      evening: '4',
      dinner: '3',
    };
    
    const formData = new FormData();
    formData.append('mealTypeId', mealTypeIdMap[slotId] || '1');
    
    const filename = imageUri.split('/').pop() || 'upload.jpg';
    const type = filename.toLowerCase().endsWith('png') ? 'image/png' : 'image/jpeg';
    
    formData.append('image', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    const key = sessionKey(dateKey, slotId);
    const existingSession = selectionSessions[key] ?? [];
    const currentMealId = existingSession.length > 0 ? existingSession[0].mealId : '';
    if (currentMealId) {
      formData.append('mealId', currentMealId);
    }

    const res = await apiClient.post('/api/meals/add-meal-item', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    });

    if (res.data?.success && Array.isArray(res.data.data)) {
      const items: MealSelectionItem[] = res.data.data.map((apiItem: any) => ({
        id: apiItem.mealItemId,
        name: apiItem.name,
        calories: apiItem.calories,
        foodMasterId: apiItem.foodMasterId,
        mealId: apiItem.mealId,
        pieces: apiItem.quantity,
        portionType: 'count', // default fallback
        imageUri: imageUri,
      }));
      selectionSessions[key] = items;
      return items;
    }
  } catch (err: any) {
    console.warn('Error uploading meal image', err.message || err);
    if (err.response?.data?.message) {
      Alert.alert('Upload Error', err.response.data.message);
    }
  }
  
  const key = sessionKey(dateKey, slotId);
  return [...(selectionSessions[key] ?? [])];
};

export const searchMealsContinuous = async (
  query: string
): Promise<MealSearchSuggestion[]> => {
  if (!query || query.trim() === '') return [];
  try {
    const res = await apiClient.get(`/api/meals/search?query=${encodeURIComponent(query.trim())}`);
    if (res.data?.success && res.data?.data) {
       return res.data.data.map((item: any) => ({
         id: item.id,
         name: item.name,
         portionType: item.portionType
       }));
    }
  } catch (err) {
    console.warn('Search meals error', err);
  }
  return [];
};

export const searchMealFinal = async (query: string): Promise<MealSearchResult | null> => {
  if (!query || query.trim() === '') return null;
  try {
    const res = await apiClient.post(`/api/meals/ai-lookup?query=${encodeURIComponent(query.trim())}`);
    if (res.data?.success && res.data?.data) {
       const food = res.data.data;
       return {
         id: food.id,
         name: food.name,
         calories: food.calories || 0,
         portionType: (food.portionType?.toLowerCase() === 'ml' || food.portionType?.toLowerCase() === 'grams' || food.portionType?.toLowerCase() === 'volume') ? 'volume' : 'count',
         pieces: food.pieces || 1,
         imageUri: food.imageUri || FALLBACK_IMAGE,
       };
    }
  } catch(err: any) {
    console.warn('AI lookup error', err.message || err);
    if (err.response?.data?.message) {
      Alert.alert('Search', err.response.data.message);
    }
  }
  return null;
};

export const addMealItem = async (
  dateKey: string,
  slotId: MealSlotId,
  item: Omit<MealSelectionItem, 'id'>,
  currentMealId?: string
): Promise<MealSelectionItem[]> => {
  try {
    const mealTypeIdMap: Record<MealSlotId, string> = {
      breakfast: '1',
      lunch: '2',
      evening: '4',
      dinner: '3',
    };
    
    const formData = new FormData();
    formData.append('mealTypeId', mealTypeIdMap[slotId] || '1');
    formData.append('foodMasterId', item.foodMasterId || '');
    formData.append('quantity', String(item.pieces || 1));
    formData.append('mealId', currentMealId || '');

    const res = await apiClient.post('/api/meals/add-meal-item', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (res.data?.success && Array.isArray(res.data.data)) {
      const items: MealSelectionItem[] = res.data.data.map((apiItem: any) => ({
        id: apiItem.mealItemId,
        name: apiItem.name,
        calories: apiItem.calories,
        foodMasterId: apiItem.foodMasterId,
        mealId: apiItem.mealId,
        pieces: apiItem.quantity,
        portionType: item.portionType, // Carry over UI portion type
        imageUri: item.imageUri || FALLBACK_IMAGE, // Carry over UI image
      }));
      const key = sessionKey(dateKey, slotId);
      selectionSessions[key] = items;
      return items;
    }
  } catch (err: any) {
    console.warn('Error adding meal item', err.message || err);
    if (err.response?.data?.message) {
      Alert.alert('Meals', err.response.data.message);
    }
  }
  
  return [];
};

export const removeMealSelectionItem = async (
  dateKey: string,
  slotId: MealSlotId,
  itemId: string
): Promise<MealSelectionItem[]> => {
  const key = sessionKey(dateKey, slotId);
  try {
    const res = await apiClient.delete(`/api/meals/delete-meal-item?itemId=${encodeURIComponent(itemId)}`);
    if (res.data?.success) {
      selectionSessions[key] = (selectionSessions[key] ?? []).filter(item => item.id !== itemId);
    } else {
      if (res.data?.message) {
        Alert.alert('Delete failed', res.data.message);
      }
    }
  } catch (err: any) {
    console.warn('Error deleting meal item', err.message || err);
    if (err.response?.data?.message) {
      Alert.alert('Delete Error', err.response.data.message);
    }
  }
  return [...(selectionSessions[key] ?? [])];
};

export const saveMealSession = async (
  dateKey: string,
  slotId: MealSlotId
): Promise<DayMealsResponse> => {
  const selection = selectionSessions[sessionKey(dateKey, slotId)] ?? [];
  const date = parseDateKey(dateKey);
  
  if (selection.length > 0) {
    const mealId = selection[0].mealId;
    if (mealId) {
      try {
        const payload = {
          mealId: mealId,
          loggedAt: new Date().toISOString(), // Use current timestamp in ISO format
        };
        const res = await apiClient.post('/api/meals/save-meal', payload);
        if (!res.data?.success && res.data?.message) {
          Alert.alert('Save Meal Error', res.data.message);
        }
      } catch (err: any) {
        console.warn('Error saving meal session', err.message || err);
        if (err.response?.data?.message) {
          Alert.alert('Save Meal Error', err.response.data.message);
        }
      }
    }
  }

  // Clear local session cache
  selectionSessions[sessionKey(dateKey, slotId)] = [];
  
  // Re-fetch the daily summary so the dashboard updates
  return getMealsByDate(date);
};



export const getMealImpact = async (
  dateKey: string,
  slotId: MealSlotId
): Promise<MealImpactResponse | null> => {
  const key = sessionKey(dateKey, slotId);
  const sourceItems = selectionSessions[key] ?? [];
  const mealId = sourceItems.length > 0 ? sourceItems[0].mealId : null;

  if (mealId) {
    try {
      const res = await apiClient.post(`/api/meals/${mealId}/impact`, null, {
        timeout: 60000 // High timeout because AI processing takes longer
      });
      if (res.data?.success && res.data?.data) {
        const data = res.data.data;
        const mealImpact = data.mealImpact;
        
        const glucoseCurveKeys = Object.keys(mealImpact.glucoseCurve).sort((a,b) => Number(a) - Number(b));
        const glucoseData = glucoseCurveKeys.map(k => mealImpact.glucoseCurve[k]);
        
        const suggestions = mealImpact.recommendations.map((rec: string, index: number) => ({
          id: `rec-${index}`,
          title: rec,
          icon: 'leaf',
          predictedPeak: mealImpact.peakGlucose,
          statusLabel: mealImpact.isSpiking ? 'Action needed' : 'Within target range',
          withinTarget: !mealImpact.isSpiking,
        }));

        return {
          selectedMeals: sourceItems.map((item) => ({
            id: item.id,
            name: item.name,
            calories: item.calories,
            imageUri: item.imageUri,
          })),
          glucoseCurve: {
            data: glucoseData,
            labels: glucoseCurveKeys,
            yAxisLabels: [0, 100, 200, 300, 400],
          },
          peakGlucose: mealImpact.peakGlucose,
          peakGlucoseUnit: 'mg/dl',
          timeToPeak: String(mealImpact.timeToPeak / 60),
          warningMessage: mealImpact.isSpiking ? 'This meal may spike your Glucose above your target range' : null,
          suggestions,
          suggestionsFooter: 'meal simulation page- While these actions help, you might still feel hungry with smaller portions. Swap ingredients to stay full and keep your glucose stable.',
        };
      }
    } catch (err: any) {
      console.warn('Error fetching meal impact', err.message || err);
      const message = err.response?.data?.message || err.message || 'Service Unavailable';
      Alert.alert('Impact Error', message);
      return null;
    }
  }

  return null;
};

export const getSwapMealOptions = async (
  dateKey: string,
  slotId: MealSlotId,
  mealItemId: string
): Promise<SwapMealResponse | null> => {
  const key = sessionKey(dateKey, slotId);
  const sourceItems = selectionSessions[key] ?? [];
  const parentMealId = sourceItems.length > 0 ? sourceItems[0].mealId : null;
  const currentItem = sourceItems.find(item => item.id === mealItemId);

  if (!parentMealId || !currentItem) {
    return null;
  }

  try {
    const res = await apiClient.post(`/api/meals/${parentMealId}/swap`, null, {
      timeout: 60000
    });
    if (res.data?.success && res.data?.data) {
      const allSwaps = res.data.data;
      const match = allSwaps.find((s: any) => s.mealItemId === mealItemId);
      if (match && match.alternatives) {
        return {
          currentMeal: {
            id: currentItem.id,
            name: currentItem.name,
            calories: currentItem.calories,
            imageUri: currentItem.imageUri,
          },
          options: match.alternatives.map((alt: any, index: number) => ({
            id: `alt-${index}-${alt.name}`, // Fallback ID since API doesn't provide foodMasterId for alts
            name: alt.name,
            calories: alt.calories,
            imageUri: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=120&h=120&fit=crop',
            calorieChangePercent: alt.calorieDeltaPercent ?? null,
            // We can also store extra data like peakGlucose if needed later
          })),
        };
      }
    }
  } catch (err: any) {
    console.warn('Error fetching swap options', err.message || err);
    const message = err.response?.data?.message || err.message || 'Service Unavailable';
    Alert.alert('Swap Error', message);
  }

  return null;
};

export const saveMealSwap = async (
  dateKey: string,
  slotId: MealSlotId,
  mealItemId: string,
  alternativeId: string
): Promise<void> => {
  const key = sessionKey(dateKey, slotId);
  const session = selectionSessions[key] ?? [];
  const parentMealId = session.length > 0 ? session[0].mealId : null;
  const index = session.findIndex(item => item.id === mealItemId);

  if (index === -1 || !parentMealId) return;

  const swapWithName = alternativeId.replace(/^alt-\d+-/, '');

  try {
    const payload = {
      mealItemId,
      swapWith: swapWithName
    };
    const res = await apiClient.put(`/api/meals/${parentMealId}/save-swap`, payload, {
      timeout: 60000
    });
    
    if (res.data?.success) {
      const existing = session[index];
      session[index] = {
        ...existing,
        name: swapWithName,
      };
      selectionSessions[key] = [...session];
    } else if (res.data?.message) {
       Alert.alert('Save Swap Failed', res.data.message);
    }
  } catch (err: any) {
    console.warn('Error saving meal swap', err.message || err);
    Alert.alert('Swap Error', err.response?.data?.message || err.message);
  }
};

export const getMealCompare = async (
  dateKey: string,
  slotId: MealSlotId,
  mealItemId: string,
  alternativeId: string
): Promise<MealCompareResponse | null> => {
  const key = sessionKey(dateKey, slotId);
  const sourceItems = selectionSessions[key] ?? [];
  const parentMealId = sourceItems.length > 0 ? sourceItems[0].mealId : null;
  const currentItem = sourceItems.find(item => item.id === mealItemId);

  if (!parentMealId || !currentItem) {
    return null;
  }

  const swapWithName = alternativeId.replace(/^alt-\d+-/, '');

  try {
    const payload = {
      mealItemId,
      swapWith: swapWithName
    };
    const res = await apiClient.post(`/api/meals/${parentMealId}/compare`, payload, {
      timeout: 60000
    });

    if (res.data?.success && res.data?.data) {
      const data = res.data.data;
      const original = data.originalMealItem;
      const optimized = data.optimisedMealItem;

      if (!original || !optimized) {
        throw new Error('Comparison data is incomplete. Please try another alternative.');
      }

      const originalCurveKeys = Object.keys(original.glucoseCurve).sort((a,b) => Number(a) - Number(b));
      const optimizedCurveKeys = Object.keys(optimized.glucoseCurve).sort((a,b) => Number(a) - Number(b));

      return {
        finalizedMealName: optimized.name,
        swappedFromLabel: `Swapped from ${original.name.toLowerCase()}`,
        newPeakGlucose: optimized.peakGlucose,
        originalPeakGlucose: original.peakGlucose,
        peakImprovement: data.improvementMgDl,
        nutrients: [
          {
            label: 'Carbs',
            original: `${original.nutrients.carbs}g`,
            optimized: `${optimized.nutrients.carbs}g`,
          },
          {
            label: 'Fiber',
            original: `${original.nutrients.fiber}g`,
            optimized: `${optimized.nutrients.fiber}g`,
          },
          {
            label: 'Calories',
            original: `${original.nutrients.calories} kcal`,
            optimized: `${optimized.nutrients.calories} kcal`,
          },
          {
            label: 'Protein',
            original: `${original.nutrients.protein}g`,
            optimized: `${optimized.nutrients.protein}g`,
          },
          {
            label: 'Peak Glucose',
            original: `${original.peakGlucose} mg/dl`,
            optimized: `${optimized.peakGlucose} mg/dl`,
          },
        ],
        glucoseComparison: {
          labels: originalCurveKeys, // Use minutes from curve keys e.g. "0", "30", "60"
          yAxisLabels: [0, 100, 200, 300, 400],
          original: {
            data: originalCurveKeys.map(k => original.glucoseCurve[k]),
            color: '#7B5EA7',
            legendLabel: original.name,
          },
          optimized: {
            data: optimizedCurveKeys.map(k => optimized.glucoseCurve[k]),
            color: '#4CAF50',
            legendLabel: optimized.name,
          },
        },
      };
    }
  } catch (err: any) {
    console.warn('Error fetching meal compare', err.message || err);
    const message = err.response?.data?.message || err.message || 'Service Unavailable';
    Alert.alert('Compare Error', message);
  }

  return null;
};
