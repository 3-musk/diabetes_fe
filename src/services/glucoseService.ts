import { apiClient } from "../utils/apiClient";

export type ReadingSession = { id: string; label: string };
export type ReadingType = { id: string; label: string };
export type Symptom = { id: string; label: string };

// Initial mock data that would come from API
export const getSystemConfigurations = async () => {
  const payload = {
    categories: ["READING_TYPE", "READING_SESSION", "SYMPTOM", "UNIT"],
  };
  const response = await apiClient.post(
    "/api/system-configuration/by-category",
    payload,
  );
  return response.data;
};

export const getGlucoseInitialData = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    recentGlucoseValue: 165,
    recentSession: "morning",
    recentReadingType: "fasting",
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

  const response = await apiClient.post("/api/glucose/readings", payload);
  const result = response.data;

  if (result.success && result.data) {
    return {
      success: true,
      status: result.data.status || "NORMAL",
      showRecheckOption: result.data.showRecheckOption ?? false,
      guidelines: result.data.guidelines || null,
    };
  } else {
    throw new Error(result.message || "Failed to save glucose reading");
  }
};
