import { apiClient } from "../utils/apiClient";

export type MedCategory = 'Capsules' | 'Pills' | 'Liquid' | 'Others';

export const saveMedication = async (data: any) => {
  try {
    const payload = {
      name: data.medName || data.name,
      category: data.category?.toUpperCase(),
      strength: data.strength,
      frequency: data.frequency,
      startDate: data.startDate,
      endDate: data.endDate
    };
    const response = await apiClient.post('/api/medications', payload);
    if (response.data && response.data.success) {
      return { success: true, data: response.data.data };
    }
  } catch (error) {
    console.error("Failed to add medication:", error);
  }
  return { success: false };
};

export const deleteMedication = async (id: string) => {
  try {
    const response = await apiClient.delete(`/api/medications/${id}`);
    if (response.data && response.data.success) {
      return { success: true };
    }
  } catch (error) {
    console.error("Failed to delete medication:", error);
  }
  return { success: false };
};

export const toggleMedicationTaken = async (id: string) => {
  try {
    const payload = [{ key: id }];
    const response = await apiClient.put('/api/medications/tracking-medications', payload);
    if (response.data && response.data.success) {
      return { success: true };
    }
  } catch (error) {
    console.error("Failed to toggle medication:", error);
  }
  return { success: false };
};
