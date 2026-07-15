// Glucose status codes, display colors, gauge ranges and UI copy

export type GlucoseStatus =
  | "NORMAL"
  | "MODERATE"
  | "HIGH_RISK"
  | "CRITICAL"
  | "EMERGENCY";

/** Hex color for each glucose reading status */
export const GLUCOSE_STATUS_COLORS: Record<GlucoseStatus, string> = {
  NORMAL: "#15933A",
  MODERATE: "#c9b90d",
  HIGH_RISK: "#e99313ff",
  CRITICAL: "#e3130b",
  EMERGENCY: "#7b0909",
};

/** Min / max values for the gauge */
export const GLUCOSE_GAUGE_RANGE = { min: 60, max: 250 } as const;

/** Gauge arc segments – ordered low to high */
export const GLUCOSE_GAUGE_RANGES = [
  { from: 60, to: 100, color: GLUCOSE_STATUS_COLORS.NORMAL },
  { from: 100, to: 140, color: GLUCOSE_STATUS_COLORS.MODERATE },
  { from: 140, to: 180, color: GLUCOSE_STATUS_COLORS.HIGH_RISK },
  { from: 180, to: 250, color: GLUCOSE_STATUS_COLORS.CRITICAL },
] as const;

/** UI strings */
export const GLUCOSE_STRINGS = {
  sectionTitle: "Glucose Monitor",
  summaryTitle: "Daily Glucose Summary",
  emptyTitle: "Glucose Monitor",
  emptyBody: "Your readings will appear here once you log your first check.",
  emptyAction: "Add first glucose reading",
  logButton: "Log Glucose",
  lastLogPrefix: "Last log: ",
  metricAverage: "Average",
  metricLowest: "Lowest",
  metricHighest: "Highest",
  criticalModalDefaultText: "Your glucose level is not normal. Please visit nearest hospital or consult a doctor immediately.",
} as const;
