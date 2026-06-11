import { medications, MedicationEntry, completedMedicationIds } from "../constants/mockDb";

export type MedCategory = 'Capsules' | 'Pills' | 'Liquid' | 'Others';

export const saveMedication = async (data: Omit<MedicationEntry, 'id'>) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  medications.push({ ...data, id: Date.now().toString() });
  return { success: true };
};

export const deleteMedication = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const idx = medications.findIndex(m => m.id === id);
  if (idx !== -1) {
    medications.splice(idx, 1);
  }
  return { success: true };
};

export const toggleMedicationTaken = async (id: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const todayKey = new Date().toISOString().split("T")[0];
  if (!completedMedicationIds[todayKey]) {
    completedMedicationIds[todayKey] = [];
  }
  const takenList = completedMedicationIds[todayKey];
  const idx = takenList.indexOf(id);
  if (idx !== -1) {
    takenList.splice(idx, 1);
  } else {
    takenList.push(id);
  }
  return { success: true };
};
