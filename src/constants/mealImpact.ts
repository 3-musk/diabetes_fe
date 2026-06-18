import type { FontAwesome } from '@react-native-vector-icons/fontawesome';

export type MealImpactIcon = React.ComponentProps<typeof FontAwesome>['name'];

export type MealImpactMealItem = {
  id: string;
  name: string;
  calories: number;
  imageUri?: string;
};

export type MealImpactSuggestion = {
  id: string;
  title: string;
  icon: MealImpactIcon;
  predictedPeak: number;
  statusLabel: string;
  withinTarget: boolean;
};

export type MealImpactResponse = {
  selectedMeals: MealImpactMealItem[];
  glucoseCurve: {
    data: number[];
    labels: string[];
    yAxisLabels: number[];
  };
  peakGlucose: number;
  peakGlucoseUnit: string;
  timeToPeak: string;
  warningMessage: string | null;
  suggestions: MealImpactSuggestion[];
  suggestionsFooter: string;
};

export const mealImpactTexts = {
  pageTitle: 'Meal Impact',
  selectedMeal: 'Selected Meal',
  swapMeal: 'Swap Meal',
  combinedGlucoseCurve: 'Combined Glucose Curve',
  peakGlucose: 'Peak Glucose',
  timeToPeak: 'Time to peak',
  bringWithinRange: 'To bring this within range :',
  personalized: 'Personalized to your food history',
  predictedPeak: 'Peak',
  loading: 'Calculating meal impact...',
  emptySelection: 'Add at least one meal item to see predicted impact.',
  hoursUnit: 'hours',
  calUnit: 'Cal',
  mgDlUnit: 'mg/dl',
};
