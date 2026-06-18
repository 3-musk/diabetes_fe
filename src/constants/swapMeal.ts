export type SwapMealOption = {
  id: string;
  name: string;
  calories: number;
  imageUri?: string;
  calorieChangePercent: number | null;
};

export type SwapMealResponse = {
  currentMeal: {
    id: string;
    name: string;
    calories: number;
    imageUri?: string;
  };
  options: SwapMealOption[];
};

export type MealCompareNutrientRow = {
  label: string;
  original: string;
  optimized: string;
};

export type MealCompareGlucoseCurve = {
  data: number[];
  color: string;
  legendLabel: string;
};

export type MealCompareResponse = {
  finalizedMealName: string;
  swappedFromLabel: string;
  newPeakGlucose: number;
  originalPeakGlucose: number;
  peakImprovement: number;
  nutrients: MealCompareNutrientRow[];
  glucoseComparison: {
    labels: string[];
    yAxisLabels: number[];
    original: MealCompareGlucoseCurve;
    optimized: MealCompareGlucoseCurve;
  };
};

export const swapMealTexts = {
  pageTitle: 'Swap Meal',
  currentMeal: 'Current Meal',
  selectMeal: 'Select Meal',
  compare: 'Compare',
  keepOriginal: 'Keep Original Meal',
  save: 'Save',
  comparePageTitle: 'Compare',
  finalizedMeal: 'You Finalized Meal',
  comparingTitle: 'Comparing Original Vs Optimized Meal',
  compareSideBySide: 'Compare side by side',
  newMealPrediction: 'New meal prediction',
  originalPeak: 'Original',
  peakImprovement: 'improvement',
  nutrient: 'Nutrient',
  original: 'Original',
  optimized: 'Optimized',
  calUnit: 'Cal',
  peak: 'peak',
  mgDlUnit: 'mg/dl',
};
