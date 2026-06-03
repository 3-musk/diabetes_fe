import { StyleSheet } from "react-native";
import { borderRadius, colors, fontSize, shadows, spacing } from "../../theme";

export const homeStyles = StyleSheet.create({
  stack: {
    gap: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  outlineButton: {
    minHeight: 44,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  outlineButtonText: {
    color: colors.primary,
    fontSize: fontSize.sm,
  },
  quickLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: spacing.md,
    gap: spacing.md,
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
  },
  quickText: {
    flex: 1,
  },
  quickTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  timestamp: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  metric: {
    flex: 1,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  metricValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 5,
    marginTop: spacing.xs,
  },
  metricValue: {
    fontSize: fontSize.xxl,
  },
  highMetric: {
    color: colors.error,
  },
  metricUnit: {
    fontSize: fontSize.sm,
    textAlign: "center",
    verticalAlign: "middle",
  },
  goalChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.sm,
  },
  goalValue: {
    color: colors.textPrimary,
    fontSize: fontSize.xs,
  },
});
