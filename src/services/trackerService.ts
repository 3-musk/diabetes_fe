import { hba1cHistory, weightHistory, HbA1cEntry, HbA1cStatus, WeightEntry, WeightHistory } from "../constants/mockDb";

export { HbA1cEntry, HbA1cStatus, WeightEntry, WeightHistory };

// ─── HbA1c Tracker Service ───

export const getHba1cHistory = async (): Promise<HbA1cEntry[]> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return [...hba1cHistory];
};

export const saveHba1cEntry = async (
  entry: HbA1cEntry,
): Promise<{ success: boolean }> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  hba1cHistory.unshift(entry);
  return { success: true };
};

// ─── Weight Tracker Service ───

export const getWeightHistory = async (): Promise<WeightHistory> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return {
    ...weightHistory,
    history: [...weightHistory.history],
  };
};

export const saveWeightEntry = async (
  entry: WeightEntry,
): Promise<{ success: boolean }> => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  weightHistory.history.unshift(entry);
  return { success: true };
};
