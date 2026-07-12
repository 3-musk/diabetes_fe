import { apiClient } from '../utils/apiClient';

export type TrendMetric = 'Glucose' | 'Meal' | 'Exercise' | 'Weight';

export interface TrendDataPoint {
  x: string;
  y: number;
  xLabel: string;
  readingType?: string;
}

export interface TrendDataResponse {
  tab: string;
  range: string;
  readingType: string;
  from: string;
  to: string;
  chartType: string;
  x: string;
  y: string;
  xLabel: string[];
  yLabel: string[];
  points: TrendDataPoint[];
}

/**
 * Mock API service to fetch trend data based on selected metric and optional filters.
 */
export const getTrendData = async (
  accessToken: string,
  metric: TrendMetric,
  range: string,
  from: string,
  to: string,
  readingType: string = 'All'
): Promise<TrendDataResponse | null> => {
  try {
    const params = new URLSearchParams();
    params.append('range', range);
    params.append('from', from);
    params.append('to', to);
    params.append('tab', metric.toLowerCase());
    if (readingType) {
      params.append('readingType', readingType);
    }
    
    const response = await apiClient.get(`/api/trends?${params.toString()}`, {
      headers: { authorization: `Bearer ${accessToken}` }
    });
    
    if (response.data && response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error("Failed to fetch trend data:", error);
  }
  return null;
};
