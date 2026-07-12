import type { FontAwesome } from '@react-native-vector-icons/fontawesome';
import type { NutritionData } from '../components/home/types';

export type MealSlotId = 'breakfast' | 'lunch' | 'evening' | 'dinner';

export type MealSlotIcon = React.ComponentProps<typeof FontAwesome>['name'];

export const MEAL_SLOT_ORDER: MealSlotId[] = ['breakfast', 'lunch', 'evening', 'dinner'];

export const MEAL_SLOT_META: Record<
  MealSlotId,
  { label: string; icon: MealSlotIcon; defaultRecommendedCalories: number }
> = {
  breakfast: { label: 'Breakfast', icon: 'coffee', defaultRecommendedCalories: 1170 },
  lunch: { label: 'Lunch', icon: 'cutlery', defaultRecommendedCalories: 370 },
  evening: { label: 'Evening', icon: 'leaf', defaultRecommendedCalories: 370 },
  dinner: { label: 'Dinner', icon: 'moon-o', defaultRecommendedCalories: 370 },
};

export function getDefaultMealSlotByTime(): MealSlotId {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) {
    return 'breakfast';
  } else if (hour >= 11 && hour < 16) {
    return 'lunch';
  } else if (hour >= 16 && hour < 19) {
    return 'evening';
  } else {
    return 'dinner';
  }
}

export type MealPortionType = 'count' | 'volume';

export type MealSelectionItem = {
  id: string;
  name: string;
  calories: number;
  imageUri?: string;
  portionType?: MealPortionType;
  pieces?: number;
  foodMasterId?: string;
  mealId?: string;
};

export type MealSearchSuggestion = {
  id: string;
  name: string;
};

export type MealSearchResult = {
  id: string;
  name: string;
  calories: number;
  portionType: MealPortionType;
  pieces: number;
  imageUri?: string;
};

export type LoggedMeal = {
  id: string;
  name: string;
  calories: number;
  timeLabel: string;
  approxCal?: number;
};

export type MealSlotData = {
  id: MealSlotId;
  label: string;
  icon: MealSlotIcon;
  recommendedCalories: number;
  recommendations: string[];
  loggedMeals: LoggedMeal[];
};

export type DayMealsResponse = {
  date: string;
  nutrition: NutritionData;
  calories: {
    consumed: number;
    total: number;
  };
  slots: MealSlotData[];
};

export const mealsTexts = {
  pageTitle: 'Meals',
  totalCalories: 'Total Calories',
  consumedToday: 'Consumed Today',
  caloriesUnit: 'Cal',
  recommended: 'Recommended',
  ourRecommendation: 'Our Recommendation',
  addMeal: 'Add Meal',
  approxCal: 'Approx Cal',
  loading: 'Loading meals...',
  logMeal: 'Log Meal',
};

export const addMealTexts = {
  pageTitle: 'Add Meal',
  uploadLabel: 'Upload Meal Picture',
  takePicture: 'Take a picture',
  or: 'OR',
  mealDescription: 'Meal Description',
  mealPortion: 'Meal Portion',
  pieces: 'Pieces',
  quantityGrams: 'Quantity in grams',
  add: 'Add',
  todaysSelection: "Today's Selection",
  estimatedTotal: 'Estimated Total',
  seePredictedImpact: 'See Predicted Impact',
  saveMeal: 'Save Meal',
  enterDetails: 'Enter Details',
  count: 'count',
  volume: 'volume',
  uploading: 'Analyzing photo...',
  searching: 'Searching...',
  noSelection: 'No items added yet.',
  search: 'Search',
  notFoundAlertTitle: 'Not found',
  notFoundAlertBody: 'No meal matched that description.',
  missingDetailsAlertTitle: 'Missing details',
  missingDetailsAlertBody: 'Search for a meal and set the portion first.',
  noItemsAlertTitle: 'No items',
  calUnit: 'Cal',
};
