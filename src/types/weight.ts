export type WeightEntry = {
  id: string;
  date: string;
  weightKg: number;
  heightCm?: number;
  onTarget: boolean;
};

export type BmiCategory = {
  label: string;
  min: number;
  max: number;
};

export type BmiData = {
  value: number;
  categoryLabel: string;
  categories: BmiCategory[];
};

export type WeightHistory = {
  target?: number;
  kgToReachGoal?: number;
  goalDirection?: string;
  bmi?: BmiData;
  history: WeightEntry[];
};


