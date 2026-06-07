// ─── HbA1c Tracker Service ───

export type HbA1cStatus = 'Normal' | 'Prediabetes' | 'Diabetes';

export type HbA1cEntry = {
  id: string;
  date: string;
  value: number;
  status: HbA1cStatus;
};

const MOCK_HBA1C_HISTORY: HbA1cEntry[] = [
  { id: '1', date: 'Feb 14, 2026', value: 6.1, status: 'Prediabetes' },
  { id: '2', date: 'Feb 16, 2026', value: 6.8, status: 'Diabetes' },
  { id: '3', date: 'Feb 14, 2026', value: 5.0, status: 'Normal' },
];

export const getHba1cHistory = async (): Promise<HbA1cEntry[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_HBA1C_HISTORY;
};

export const saveHba1cEntry = async (entry: HbA1cEntry): Promise<{ success: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return { success: true };
};

// ─── Weight Tracker Service ───

export type WeightEntry = {
  id: string;
  date: string;
  weightKg: number;
  onTarget: boolean;
};

const MOCK_WEIGHT_HISTORY: WeightEntry[] = [
  { id: '1', date: 'Feb 14, 2026', weightKg: 75.5, onTarget: true },
  { id: '2', date: 'Feb 14, 2026', weightKg: 76.2, onTarget: true },
  { id: '3', date: 'Feb 14, 2026', weightKg: 77.0, onTarget: true },
];

export const getWeightHistory = async (): Promise<WeightEntry[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_WEIGHT_HISTORY;
};

export const saveWeightEntry = async (entry: WeightEntry): Promise<{ success: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return { success: true };
};
