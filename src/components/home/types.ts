import { FontAwesome } from "@react-native-vector-icons/fontawesome";

export type IconName = React.ComponentProps<typeof FontAwesome>["name"];

export type GlucoseReading = {
  value: number;
  unit: string;
  status: string;
  timestamp: string;
  statistics: GlucoseStatistics;
};

export type GlucoseStatistics = {
  average: number;
  lowest: number;
  highest: number;
};

export type NutritionMetric = {
  label: string;
  value: string;
  icon: IconName;
  color: string;
};

export type GoalChipData = {
  icon: IconName;
  value: string;
  label: string;
};

export type NutritionStatus =
  | "limit"
  | "optimal"
  | "increase"
  | "normal"
  | "high"
  | "low"
  | null;

export type NutritionRange = {
  currentVal: number | null;
  rangeMax: number;
  rangeMin: number;
  status: NutritionStatus;
};

export type NutritionData = {
  carbohydrates: NutritionRange;
  totalFat: NutritionRange;
  protein: NutritionRange;
  dietaryFiber: NutritionRange;
  addedSugar: NutritionRange;
};

export type Hba1cData = {
  value: number;
  testDate: string;
  status: string;
};

export type MedicationData = {
  id: string;
  name: string;
  dose: string;
  icon: IconName;
  isSystemGenerated?: boolean;
  isTaken?: boolean;
};

export type LifestyleQuestionData = {
  current: number;
  total: number;
  question: string;
  isCompleted?: boolean;
};

export type HomeDashboardData = {
  glucose: GlucoseReading | null;
  nutrition: NutritionData | null;
  hba1c: Hba1cData | null;
  meals: Record<string, number>;
  weightKg: Record<string, number> | null;
  dailyActivityDurationMinutes: number | null;
};
