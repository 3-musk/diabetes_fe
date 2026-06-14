import type { NutritionData, NutritionRange } from '../components/home/types';
import type { MealImpactResponse } from '../constants/mealImpact';
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

type FoodCatalogItem = {
  id: string;
  name: string;
  calories: number;
  portionType: MealPortionType;
  pieces: number;
  imageUri: string;
};

const FOOD_CATALOG: FoodCatalogItem[] = [
  { id: 'idly', name: 'Idly', calories: 160, portionType: 'count', pieces: 2, imageUri: 'https://images.unsplash.com/photo-1589302167528-5dd771b2263f?w=120&h=120&fit=crop' },
  { id: 'white-rice', name: 'White Rice', calories: 165, portionType: 'volume', pieces: 1, imageUri: 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=120&h=120&fit=crop' },
  { id: 'oats', name: 'Oats', calories: 280, portionType: 'volume', pieces: 1, imageUri: 'https://images.unsplash.com/photo-1517673400267-0251441c45ba?w=120&h=120&fit=crop' },
  { id: 'banana', name: 'Banana', calories: 105, portionType: 'count', pieces: 1, imageUri: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=120&h=120&fit=crop' },
  { id: 'dal', name: 'Dal', calories: 180, portionType: 'volume', pieces: 1, imageUri: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=120&h=120&fit=crop' },
  { id: 'chicken', name: 'Grilled Chicken', calories: 220, portionType: 'count', pieces: 1, imageUri: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=120&h=120&fit=crop' },
  { id: 'salad', name: 'Green Salad', calories: 90, portionType: 'volume', pieces: 1, imageUri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&h=120&fit=crop' },
  { id: 'coffee', name: 'Coffee', calories: 45, portionType: 'volume', pieces: 1, imageUri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=120&h=120&fit=crop' },
];

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
      recommendedCalories: meta.defaultRecommendedCalories,
      recommendations: [...DEFAULT_RECOMMENDATIONS[id]],
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

const toSelectionItem = (food: FoodCatalogItem, pieces?: number): MealSelectionItem => ({
  id: `${food.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  name: food.name,
  calories: Math.round(food.calories * (pieces ?? food.pieces) / food.pieces),
  imageUri: food.imageUri,
  portionType: food.portionType,
  pieces: pieces ?? food.pieces,
});

const findFoodMatches = (query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return FOOD_CATALOG.filter(food =>
    food.name.toLowerCase().includes(normalized)
  );
};

export const getMealsByDate = async (date: Date): Promise<DayMealsResponse> => {
  await delay();
  const day = buildDayMeals(date);
  return {
    ...day,
    nutrition: { ...day.nutrition },
    calories: { ...day.calories },
    slots: day.slots.map(slot => ({
      ...slot,
      recommendations: [...slot.recommendations],
      loggedMeals: [...slot.loggedMeals],
    })),
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
  _imageUri: string,
  dateKey: string,
  slotId: MealSlotId
): Promise<MealSelectionItem[]> => {
  await delay(900);
  const key = sessionKey(dateKey, slotId);
  const detected = [FOOD_CATALOG[0], FOOD_CATALOG[1]].map(food => toSelectionItem(food));
  selectionSessions[key] = [...(selectionSessions[key] ?? []), ...detected];
  return [...selectionSessions[key]];
};

export const searchMealsContinuous = async (
  query: string
): Promise<MealSearchSuggestion[]> => {
  await delay(250);
  return findFoodMatches(query).map(food => ({
    id: food.id,
    name: food.name,
  }));
};

export const searchMealFinal = async (query: string): Promise<MealSearchResult | null> => {
  await delay(500);
  const matches = findFoodMatches(query);
  if (matches.length === 0) return null;

  const exact = matches.find(food => food.name.toLowerCase() === query.trim().toLowerCase());
  const food = exact ?? matches[0];

  return {
    id: food.id,
    name: food.name,
    calories: food.calories,
    portionType: food.portionType,
    pieces: food.pieces,
    imageUri: food.imageUri,
  };
};

export const addMealItem = async (
  dateKey: string,
  slotId: MealSlotId,
  item: Omit<MealSelectionItem, 'id'>
): Promise<MealSelectionItem[]> => {
  await delay(300);
  const key = sessionKey(dateKey, slotId);
  const newItem: MealSelectionItem = {
    ...item,
    id: `${item.name}-${Date.now()}`,
  };
  selectionSessions[key] = [...(selectionSessions[key] ?? []), newItem];
  return [...selectionSessions[key]];
};

export const removeMealSelectionItem = async (
  dateKey: string,
  slotId: MealSlotId,
  itemId: string
): Promise<MealSelectionItem[]> => {
  await delay(150);
  const key = sessionKey(dateKey, slotId);
  selectionSessions[key] = (selectionSessions[key] ?? []).filter(item => item.id !== itemId);
  return [...selectionSessions[key]];
};

export const saveMealSession = async (
  dateKey: string,
  slotId: MealSlotId
): Promise<DayMealsResponse> => {
  await delay(500);
  const date = parseDateKey(dateKey);
  const day = buildDayMeals(date);
  const slot = day.slots.find(item => item.id === slotId);
  const selection = selectionSessions[sessionKey(dateKey, slotId)] ?? [];

  if (!slot) {
    return getMealsByDate(date);
  }

  const now = new Date();
  const timeLabel = `${now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })} - ${slot.label}`;

  selection.forEach(item => {
    const loggedMeal: LoggedMeal = {
      id: item.id,
      name: item.name,
      calories: item.calories,
      timeLabel,
      approxCal: item.calories,
    };
    slot.loggedMeals.push(loggedMeal);
  });

  recalculateConsumed(day);
  selectionSessions[sessionKey(dateKey, slotId)] = [];

  return getMealsByDate(date);
};

const ALTERNATIVE_SWAPS: Record<string, FoodCatalogItem[]> = {
  'white-rice': [
    {
      id: 'brown-rice',
      name: 'Brown Rice',
      calories: 133,
      portionType: 'volume',
      pieces: 1,
      imageUri: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=120&h=120&fit=crop',
    },
    {
      id: 'cauliflower-rice',
      name: 'Cauliflower Rice',
      calories: 165,
      portionType: 'volume',
      pieces: 1,
      imageUri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=120&h=120&fit=crop',
    },
    FOOD_CATALOG.find(f => f.id === 'oats')!,
  ],
  idly: [
    FOOD_CATALOG.find(f => f.id === 'dal')!,
    FOOD_CATALOG.find(f => f.id === 'oats')!,
    FOOD_CATALOG.find(f => f.id === 'salad')!,
  ],
  oats: [
    FOOD_CATALOG.find(f => f.id === 'salad')!,
    FOOD_CATALOG.find(f => f.id === 'banana')!,
    FOOD_CATALOG.find(f => f.id === 'dal')!,
  ],
  dal: [
    FOOD_CATALOG.find(f => f.id === 'chicken')!,
    FOOD_CATALOG.find(f => f.id === 'salad')!,
    FOOD_CATALOG.find(f => f.id === 'oats')!,
  ],
};

const PEAK_GLUCOSE_BY_FOOD: Record<string, number> = {
  'white-rice': 154,
  'brown-rice': 121,
  'cauliflower-rice': 118,
  oats: 132,
  idly: 142,
  dal: 125,
  salad: 108,
  chicken: 115,
  banana: 130,
};

type NutrientProfile = {
  carbs: string;
  fiber: string;
  calories: string;
  protein: string;
};

const NUTRIENT_PROFILE_BY_FOOD: Record<string, NutrientProfile> = {
  'white-rice': { carbs: '28g', fiber: '0.0g', calories: '165 kcl', protein: '3.0g' },
  'brown-rice': { carbs: '24g', fiber: '1.8g', calories: '133 kcl', protein: '3.0g' },
  'cauliflower-rice': { carbs: '5g', fiber: '2.0g', calories: '165 kcl', protein: '2.0g' },
  oats: { carbs: '27g', fiber: '4.0g', calories: '280 kcl', protein: '10.0g' },
  idly: { carbs: '30g', fiber: '1.2g', calories: '160 kcl', protein: '4.0g' },
  dal: { carbs: '18g', fiber: '5.0g', calories: '180 kcl', protein: '9.0g' },
  salad: { carbs: '6g', fiber: '3.0g', calories: '90 kcl', protein: '2.0g' },
  chicken: { carbs: '0g', fiber: '0.0g', calories: '220 kcl', protein: '35.0g' },
  banana: { carbs: '27g', fiber: '3.0g', calories: '105 kcl', protein: '1.0g' },
};

const WEEKLY_GLUCOSE_CURVES: Record<string, number[]> = {
  'white-rice': [95, 120, 154, 140, 125, 110, 100],
  'brown-rice': [90, 105, 121, 115, 105, 98, 92],
  'cauliflower-rice': [88, 98, 118, 110, 100, 94, 90],
  oats: [92, 110, 132, 125, 115, 105, 98],
  idly: [100, 125, 142, 135, 120, 110, 102],
  dal: [90, 108, 125, 118, 108, 100, 95],
  salad: [85, 95, 108, 102, 96, 90, 88],
  chicken: [88, 100, 115, 110, 102, 96, 90],
  banana: [92, 112, 130, 122, 112, 104, 98],
};

const DEFAULT_NUTRIENT_PROFILE: NutrientProfile = {
  carbs: '28g',
  fiber: '0.0g',
  calories: '294 kcl',
  protein: '0.0g',
};

const getNutrientProfile = (foodId: string) =>
  NUTRIENT_PROFILE_BY_FOOD[foodId] ?? DEFAULT_NUTRIENT_PROFILE;

const findFoodIdByName = (name: string) =>
  FOOD_CATALOG.find(f => f.name === name)?.id
  ?? Object.values(ALTERNATIVE_SWAPS).flat().find(f => f.name === name)?.id;

const findSwapFoodById = (foodId: string): FoodCatalogItem | undefined => {
  const catalogMatch = FOOD_CATALOG.find(f => f.id === foodId);
  if (catalogMatch) return catalogMatch;

  for (const options of Object.values(ALTERNATIVE_SWAPS)) {
    const match = options.find(f => f.id === foodId);
    if (match) return match;
  }

  return undefined;
};

const getSelectionOrDemo = (dateKey: string, slotId: MealSlotId): MealSelectionItem[] => {
  const key = sessionKey(dateKey, slotId);
  const selection = selectionSessions[key] ?? [];
  if (selection.length > 0) return selection;

  const demo = [FOOD_CATALOG[1], FOOD_CATALOG[0]].map(food => toSelectionItem(food));
  selectionSessions[key] = demo;
  return demo;
};

const calcCalorieChangePercent = (currentCalories: number, altCalories: number) => {
  if (currentCalories === 0) return null;
  const percent = Math.round(((altCalories - currentCalories) / currentCalories) * 100);
  return percent === 0 ? null : percent;
};

export const getMealImpact = async (
  dateKey: string,
  slotId: MealSlotId
): Promise<MealImpactResponse> => {
  await delay(700);

  const sourceItems = getSelectionOrDemo(dateKey, slotId);

  const selectedMeals = sourceItems.map(item => ({
    id: item.id,
    name: item.name,
    calories: item.calories,
    imageUri: item.imageUri,
  }));

  return {
    selectedMeals,
    glucoseCurve: {
      data: [95, 110, 130, 154, 148, 132, 118, 105],
      labels: ['0', '30', '60', '90', '120', '150', '180', '210'],
      yAxisLabels: [0, 100, 200, 300, 400],
    },
    peakGlucose: 154,
    peakGlucoseUnit: 'mg/dl',
    timeToPeak: '1.5',
    warningMessage: 'This meal may spike your Glucose above your target range',
    suggestions: [
      {
        id: 'walk',
        title: '15 min walk after eating',
        icon: 'male',
        predictedPeak: 135,
        statusLabel: 'Within target range',
        withinTarget: true,
      },
      {
        id: 'portion',
        title: 'Try to smaller portion',
        icon: 'cutlery',
        predictedPeak: 135,
        statusLabel: 'Within target range',
        withinTarget: true,
      },
    ],
    suggestionsFooter:
      'meal simulation page- While these actions help, you might still feel hungry with smaller portions. Swap ingredients to stay full and keep your glucose stable.',
  };
};

export const getSwapMealOptions = async (
  dateKey: string,
  slotId: MealSlotId,
  mealId: string
): Promise<SwapMealResponse | null> => {
  await delay(500);

  const sourceItems = getSelectionOrDemo(dateKey, slotId);
  const currentItem = sourceItems.find(item => item.id === mealId);
  if (!currentItem) return null;

  const foodKey = findFoodIdByName(currentItem.name);
  const alternatives = foodKey && ALTERNATIVE_SWAPS[foodKey]
    ? ALTERNATIVE_SWAPS[foodKey]
    : [FOOD_CATALOG[6], FOOD_CATALOG[2], FOOD_CATALOG[4]];

  return {
    currentMeal: {
      id: currentItem.id,
      name: currentItem.name,
      calories: currentItem.calories,
      imageUri: currentItem.imageUri,
    },
    options: alternatives.map(alt => ({
      id: alt.id,
      name: alt.name,
      calories: alt.calories,
      imageUri: alt.imageUri,
      calorieChangePercent: calcCalorieChangePercent(currentItem.calories, alt.calories),
    })),
  };
};

export const saveMealSwap = async (
  dateKey: string,
  slotId: MealSlotId,
  mealId: string,
  alternativeId: string
): Promise<void> => {
  await delay(400);

  const key = sessionKey(dateKey, slotId);
  const session = selectionSessions[key] ?? getSelectionOrDemo(dateKey, slotId);
  const index = session.findIndex(item => item.id === mealId);
  const altFood = findSwapFoodById(alternativeId);

  if (index === -1 || !altFood) return;

  const existing = session[index];
  session[index] = {
    ...existing,
    name: altFood.name,
    calories: altFood.calories,
    imageUri: altFood.imageUri,
    portionType: altFood.portionType,
    pieces: altFood.pieces,
  };
  selectionSessions[key] = [...session];
};

export const getMealCompare = async (
  dateKey: string,
  slotId: MealSlotId,
  mealId: string,
  alternativeId: string
): Promise<MealCompareResponse | null> => {
  await delay(500);

  const sourceItems = getSelectionOrDemo(dateKey, slotId);
  const currentItem = sourceItems.find(item => item.id === mealId);
  if (!currentItem) return null;

  const alternative = findSwapFoodById(alternativeId);
  if (!alternative) return null;

  const currentFoodId = findFoodIdByName(currentItem.name) ?? 'white-rice';
  const originalPeak = PEAK_GLUCOSE_BY_FOOD[currentFoodId] ?? 150;
  const newPeak = PEAK_GLUCOSE_BY_FOOD[alternative.id] ?? 130;
  const originalNutrients = getNutrientProfile(currentFoodId);
  const optimizedNutrients = getNutrientProfile(alternative.id);
  const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return {
    finalizedMealName: alternative.name,
    swappedFromLabel: `Swapped from ${currentItem.name.toLowerCase()}`,
    newPeakGlucose: newPeak,
    originalPeakGlucose: originalPeak,
    peakImprovement: originalPeak - newPeak,
    nutrients: [
      {
        label: 'Carbs',
        original: originalNutrients.carbs,
        optimized: optimizedNutrients.carbs,
      },
      {
        label: 'Fiber',
        original: originalNutrients.fiber,
        optimized: optimizedNutrients.fiber,
      },
      {
        label: 'Calories',
        original: originalNutrients.calories,
        optimized: optimizedNutrients.calories,
      },
      {
        label: 'Protein',
        original: originalNutrients.protein,
        optimized: optimizedNutrients.protein,
      },
      {
        label: 'Peak Glucose',
        original: `${originalPeak} mg/dl`,
        optimized: `${newPeak} mg/dl`,
      },
    ],
    glucoseComparison: {
      labels: weekLabels,
      yAxisLabels: [0, 100, 200, 300, 400],
      original: {
        data: WEEKLY_GLUCOSE_CURVES[currentFoodId] ?? WEEKLY_GLUCOSE_CURVES['white-rice'],
        color: '#7B5EA7',
        legendLabel: currentItem.name,
      },
      optimized: {
        data: WEEKLY_GLUCOSE_CURVES[alternative.id] ?? WEEKLY_GLUCOSE_CURVES['brown-rice'],
        color: '#4CAF50',
        legendLabel: alternative.name,
      },
    },
  };
};
