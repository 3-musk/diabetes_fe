import { FontAwesome } from "@react-native-vector-icons/fontawesome";

export type IconName = React.ComponentProps<typeof FontAwesome>["name"];

export type GlucoseReading = {
  value: number;
  unit: string;
  status: string;
  lastLoggedAt: string;
};

export type GlucoseMetric = {
  unit: string;
  status: string;
  average?: number;
  lowest?: number;
  highest?: number;
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

export type NutritionData = {
  metrics: NutritionMetric[];
  goals: GoalChipData[];
};

export type Hba1cData = {
  value: string;
  date: string;
  status: string;
  note: string;
};

export type MedicationData = {
  name: string;
  dose: string;
  icon: IconName;
};

export type LifestyleQuestionData = {
  current: number;
  total: number;
  question: string;
};

export type HomeDashboardData = {
  glucose: GlucoseReading | null;
  glucoseSummary: GlucoseMetric;
  nutrition: NutritionData | null;
  hba1c: Hba1cData | null;
  medications: MedicationData[];
  lifestyleQuestion: LifestyleQuestionData | null;
};
