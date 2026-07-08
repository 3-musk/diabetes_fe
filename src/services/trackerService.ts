
import { WeightEntry, WeightHistory, BmiData } from "../types/weight";
import { HbA1cEntry, HbA1cStatus, HbA1cHistory } from "../types/hba1c";
import { apiClient } from "../utils/apiClient";

export { HbA1cEntry, HbA1cStatus, HbA1cHistory, WeightEntry, WeightHistory, BmiData };

// ─── HbA1c Tracker Service ───

export const getHba1cHistory = async (
  page: number = 0,
  size: number = 5,
  fetchSummary: boolean = true
): Promise<HbA1cHistory> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());

    const promises: Promise<any>[] = [
      apiClient.get(`/api/hba1c/history?${params.toString()}`)
    ];
    
    if (fetchSummary) {
      promises.push(apiClient.get('/api/hba1c/summary'));
    }

    const results = await Promise.all(promises);
    const historyRes = results[0];
    // We don't currently use summaryRes as the UI calculates latest/average from loaded data
    
    let mappedHistory: HbA1cEntry[] = [];
    let hasNext = false;

    if (historyRes.data && historyRes.data.success) {
      const historyData = historyRes.data.data;
      hasNext = historyData?.hasNext ?? false;
      const items = historyData?.items || [];
      mappedHistory = items.map((e: any) => {
        let status: HbA1cStatus = "Normal";
        if (e.status) {
          const s = e.status.toLowerCase();
          if (s === "prediabetes") status = "Prediabetes";
          else if (s === "diabetes") status = "Diabetes";
        }
        return {
          id: e.id || Date.now().toString() + Math.random(),
          date: e.testDate || e.date,
          value: e.valuePercent,
          status,
        };
      });
    }

    return {
      history: mappedHistory,
      hasNext
    };
  } catch (error) {
    console.error("Error getting HbA1c history", error);
    return { history: [], hasNext: false };
  }
};

export const saveHba1cEntry = async (
  entry: HbA1cEntry,
): Promise<{ success: boolean; message?: string }> => {
  try {
    // Convert YYYY/MM/DD to YYYY-MM-DD
    const testDate = entry.date.replace(/\//g, "-");
    const payload = {
      valuePercent: entry.value,
      testDate: testDate,
    };

    const response = await apiClient.post("/api/hba1c", payload);

    if (response.data && response.data.success) {
      return { success: true };
    } else {
      throw new Error(response.data?.message || "Failed to save HbA1c reading");
    }
  } catch (error: any) {
    console.error("Error saving HbA1c entry:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to save reading",
    };
  }
};

// ─── Weight Tracker Service ───

export const getWeightHistory = async (
  from?: string, 
  to?: string, 
  range?: string,
  page: number = 0,
  size: number = 3,
  fetchSummary: boolean = true
): Promise<WeightHistory & { hasNext?: boolean }> => {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (range) {
      params.append('range', range);
    } else {
      if (from) params.append('from', from);
      if (to) params.append('to', to);
    }

    const promises: Promise<any>[] = [
      apiClient.get(`/api/weight/history?${params.toString()}`)
    ];
    
    if (fetchSummary) {
      promises.push(apiClient.get('/api/weight/summary'));
    }

    const results = await Promise.all(promises);
    const historyRes = results[0];
    const summaryRes = fetchSummary ? results[1] : null;
    
    let target, bmi;
    if (summaryRes && summaryRes.data && summaryRes.data.success) {
      const summaryData = summaryRes.data.data;
      target = summaryData?.targetWeight ?? summaryData?.target ?? undefined;
      bmi = summaryData?.bmi ?? undefined;
    }

    let mappedHistory: any[] = [];
    let hasNext = false;
    if (historyRes.data && historyRes.data.success) {
      const historyData = historyRes.data.data;
      hasNext = historyData?.hasNext ?? false;
      const items = historyData?.items || [];
      mappedHistory = items.map((e: any) => ({
         id: e.id || Date.now().toString() + Math.random(),
         date: e.recordedDate || e.date,
         weightKg: e.weightKg,
         heightCm: e.heightCm,
         onTarget: e.onTarget ?? false,
      }));
    }

    return {
      target,
      bmi,
      history: mappedHistory,
      hasNext,
    };
  } catch (error) {
    console.error("Error getting weight history", error);
    return { target: undefined, bmi: undefined, history: [], hasNext: false };
  }
};

export const saveWeightEntry = async (
  entry: WeightEntry,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const testDate = entry.date.replace(/\//g, "-");
    const payload = {
      weightKg: entry.weightKg,
      heightCm: entry.heightCm,
      recordedDate: testDate,
    };

    const response = await apiClient.post("/api/weight", payload);

    if (response.data && response.data.success) {
      return { success: true };
    } else {
      throw new Error(
        response.data?.message || "Failed to save weight reading",
      );
    }
  } catch (error: any) {
    console.error("Error saving weight entry:", error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to save reading",
    };
  }
};
