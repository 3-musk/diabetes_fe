import { TREND_MOCK_DATA } from '../constants/trendData';

export type TrendMetric = 'Glucose' | 'Meal' | 'Exercise' | 'Weight';

export interface TrendDataResponse {
  title: string;
  filterOption?: string;
  data: number[];
  labels: string[];
  yAxisLabels: number[];
  optimalRange?: [number, number];
}

/**
 * Mock API service to fetch trend data based on selected metric and optional filters.
 */
export const getTrendData = async (
  metric: TrendMetric,
  filter?: string
): Promise<TrendDataResponse> => {
  // Simulate network latency
  await new Promise((resolve) => setTimeout(resolve, 800));

  const data = TREND_MOCK_DATA[metric];
  
  if (!data) {
    return {
      title: 'Unknown',
      data: [],
      labels: [],
      yAxisLabels: [],
    };
  }

  // In a real app, 'filter' would be used to alter the data array 
  // (e.g. fetching only 'Fasting' glucose levels).
  return data;
};
