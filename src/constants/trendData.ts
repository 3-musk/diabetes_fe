export const TREND_MOCK_DATA = {
  Glucose: {
    title: 'Glucose',
    filterOption: 'Meal',
    data: [90, 120, 130, 115, 110, 113, 100, 90],
    labels: ['1', '4', '7', '10', '13', '16', '19', '22'],
    yAxisLabels: [0, 50, 100, 150],
    optimalRange: [75, 130] as [number, number],
  },
  Meal: {
    title: 'Meal',
    data: [1, 2, 3, 2, 4, 3, 2, 3],
    labels: ['1', '4', '7', '10', '13', '16', '19', '22'],
    yAxisLabels: [0, 2, 4, 6],
  },
  Exercise: {
    title: 'Exercise (mins)',
    data: [20, 30, 0, 45, 60, 20, 0, 30],
    labels: ['1', '4', '7', '10', '13', '16', '19', '22'],
    yAxisLabels: [0, 20, 40, 60],
  },
  Weight: {
    title: 'Weight (kg)',
    data: [75, 74.8, 74.5, 74.5, 74.2, 74.0, 73.8, 73.5],
    labels: ['1', '4', '7', '10', '13', '16', '19', '22'],
    yAxisLabels: [70, 72, 74, 76, 78],
  },
};
