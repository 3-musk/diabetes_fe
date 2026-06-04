// Nutrition status codes, display labels, colors, gauge positions and UI copy

import type { NutritionStatus } from '../components/home/types';

/** Hex color and display label for each nutrition status */
export const NUTRITION_STATUS_CONFIG: Record<
  Exclude<NutritionStatus, null>,
  { label: string; color: string }
> = {
  increase: { label: 'Increase', color: '#FFC233' },
  optimal:  { label: 'Optimal',  color: '#19D438' },
  limit:    { label: 'Limit',    color: '#c9130d' },
  normal:   { label: 'Optimal',  color: '#19D438' },
  high:     { label: 'Limit',    color: '#c9130d' },
  low:      { label: 'Increase', color: '#FFC233' },
};

/** Gauge needle / arc angles for each nutrition status */
export const NUTRITION_STATUS_GAUGE: Record<
  Exclude<NutritionStatus, null>,
  { needleAngle: number; arcStartAngle: number; arcEndAngle: number }
> = {
  increase: { needleAngle: 210, arcStartAngle: 205, arcEndAngle: 235 },
  optimal:  { needleAngle: 270, arcStartAngle: 255, arcEndAngle: 285 },
  limit:    { needleAngle: 330, arcStartAngle: 305, arcEndAngle: 335 },
  low:      { needleAngle: 210, arcStartAngle: 205, arcEndAngle: 235 },
  normal:   { needleAngle: 270, arcStartAngle: 255, arcEndAngle: 285 },
  high:     { needleAngle: 330, arcStartAngle: 305, arcEndAngle: 335 },
};

/** Ordered list of nutrient keys to display with their tile labels */
export const NUTRIENT_DISPLAY = [
  { key: 'carbohydrates' as const, title: 'Carbs',   emptySubtitle: 'Limit'    },
  { key: 'totalFat'      as const, title: 'Fat',     emptySubtitle: 'Optimal'  },
  { key: 'protein'       as const, title: 'Protein', emptySubtitle: 'Increase' },
  { key: 'dietaryFiber'  as const, title: 'Fibre',   emptySubtitle: 'Increase' },
  { key: 'addedSugar'    as const, title: 'Sugar',   emptySubtitle: 'Optimal'  },
];

/** UI strings */
export const NUTRITION_STRINGS = {
  sectionTitle:  'Daily Nutrition Compass',
  emptyBody:     'Track your macros to see how meals affect your energy levels.',
  emptyAction:   'Log your first meal',
  noDataLabel:   'No data',
  noDataSymbol:  '--',
} as const;
