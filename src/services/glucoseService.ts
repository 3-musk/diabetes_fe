import { apiClient } from "../utils/apiClient";
import { glucoseReadings } from "../constants/mockDb";

export type ReadingSession = { id: string; label: string };
export type ReadingType = { id: string; label: string };
export type Symptom = { id: string; label: string };

// Initial mock data that would come from API
export const getGlucoseInitialData = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (glucoseReadings.length > 0) {
    const last = glucoseReadings[glucoseReadings.length - 1];
    return {
      recentGlucoseValue: last.glucoseValue,
      recentSession: last.session,
      recentReadingType: last.readingType,
      recentSymptoms: [...last.symptoms],
    };
  }

  return {
    recentGlucoseValue: 165,
    recentSession: 'morning',
    recentReadingType: 'fasting',
    recentSymptoms: [] as string[],
  };
};

export const saveGlucoseReading = async (data: any) => {
  const readingSession = data.session.toUpperCase();
  const typeOfReading = data.readingType.toUpperCase();
  const symptoms = (data.symptoms || []).map((s: string) => s.toUpperCase());

  const payload = {
    glucoseValue: data.glucoseValue,
    unit: "mg/dL",
    readingSession,
    typeOfReading,
    symptoms,
  };

  const response = await apiClient.post('/api/glucose/readings', payload);
  const result = response.data;

  if (result.success && result.data) {
    const newReading = {
      id: result.data.id || Math.random().toString(36).substring(2, 9),
      glucoseValue: result.data.glucoseValue || data.glucoseValue,
      session: data.session,
      readingType: data.readingType,
      symptoms: data.symptoms || [],
      timestamp: result.data.timestamp || new Date().toISOString(),
    };
    glucoseReadings.push(newReading);

    return {
      success: true,
      status: result.data.status?.toLowerCase() || 'normal',
      next_steps: result.data.guidelines ? {
        title: result.data.guidelines.recheckTimer || "Immediate Action Required",
        steps: result.data.guidelines.immediateAction ? result.data.guidelines.immediateAction.split('\n') : []
      } : null
    };
  } else {
    throw new Error(result.message || 'Failed to save glucose reading');
  }
};
