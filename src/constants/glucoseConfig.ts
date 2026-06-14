// Glucose status codes, display colors, gauge ranges and UI copy

export type GlucoseStatus = 'normal' | 'borderline' | 'abnormal' | 'danger';

/** Hex color for each glucose reading status */
export const GLUCOSE_STATUS_COLORS: Record<GlucoseStatus, string> = {
  normal:       '#15933A',
  borderline:   '#679315',
  abnormal:     '#e99313ff',
  danger:       '#c9130d',
};

/** Min / max values for the gauge */
export const GLUCOSE_GAUGE_RANGE = { min: 60, max: 250 } as const;

/** Gauge arc segments – ordered low to high */
export const GLUCOSE_GAUGE_RANGES = [
  { from: 60,  to: 100, color: GLUCOSE_STATUS_COLORS.normal },
  { from: 100, to: 140, color: GLUCOSE_STATUS_COLORS.borderline },
  { from: 140, to: 180, color: GLUCOSE_STATUS_COLORS.abnormal },
  { from: 180, to: 250, color: GLUCOSE_STATUS_COLORS.danger },
] as const;

/** UI strings */
export const GLUCOSE_STRINGS = {
  sectionTitle:        'Glucose Monitor',
  summaryTitle:        'Daily Glucose Summary',
  emptyTitle:          'Glucose Monitor',
  emptyBody:           'Your readings will appear here once you log your first check.',
  emptyAction:         'Add first glucose reading',
  logButton:           'Log Glucose',
  lastLogPrefix:       'Last log: ',
  metricAverage:       'Average',
  metricLowest:        'Lowest',
  metricHighest:       'Highest',
} as const;
