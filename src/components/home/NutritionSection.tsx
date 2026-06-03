import { FontAwesome } from "@react-native-vector-icons/fontawesome";
import { StyleSheet, View } from "react-native";
import AppText from "../AppText";
import { borderRadius, colors, fontSize, shadows, spacing } from "../../theme";
import { GoalChip, OutlineAction, SetupCard } from "./Shared";
import type { GoalChipData, NutritionData, NutritionMetric } from "./types";

const defaultNutritionMetrics: NutritionMetric[] = [
  { label: "Carbs", value: "50g", icon: "cutlery", color: "#FF6B6B" },
  { label: "Fat", value: "10g", icon: "tint", color: "#FFB020" },
  { label: "Protein", value: "20g", icon: "heartbeat", color: "#FF9F43" },
  { label: "Avg\nGlucose", value: "90", icon: "line-chart", color: "#36C46D" },
  { label: "Time\nin Target", value: "90%", icon: "bullseye", color: "#36C46D" },
];

const defaultGoals: GoalChipData[] = [
  { icon: "smile-o", label: "Log Meal", value: "0/3" },
  { icon: "flask", label: "TL: 1 kg / W: 0 kg", value: "0%" },
  { icon: "bar-chart", label: "Weekly Progress", value: "48%" },
];

export function NutritionSection({ data }: { data: NutritionData | null }) {
  if (!data) {
    return (
      <SetupCard title="Daily Nutrition Compass">
        <AppText style={styles.mutedText}>
          Track your macros to see how meals affect your energy levels.
        </AppText>
        <OutlineAction title="Log your first meal" />
      </SetupCard>
    );
  }

  return (
    <View style={styles.card}>
      <AppText variant="semibold" style={styles.sectionTitle}>
        Daily Nutrition Compass
      </AppText>
      <View style={styles.nutritionRow}>
        {(data.metrics.length ? data.metrics : defaultNutritionMetrics).map((item) => (
          <View key={item.label} style={styles.nutritionItem}>
            <View style={[styles.smallIconCircle, { backgroundColor: `${item.color}20` }]}>
              <FontAwesome name={item.icon} size={13} color={item.color} />
            </View>
            <AppText variant="semibold" style={styles.nutritionValue}>
              {item.value}
            </AppText>
            <AppText style={styles.nutritionLabel}>{item.label}</AppText>
          </View>
        ))}
      </View>
      <View style={styles.goalGrid}>
        {(data.goals.length ? data.goals : defaultGoals).map((item) => (
          <GoalChip key={item.label} {...item} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mutedText: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginLeft: spacing.xxl,
    marginBottom: spacing.lg,
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
  nutritionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  nutritionItem: {
    width: "19%",
    alignItems: "center",
  },
  smallIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  nutritionValue: {
    color: colors.textPrimary,
    fontSize: fontSize.xs,
  },
  nutritionLabel: {
    color: colors.textTertiary,
    fontSize: 9,
    textAlign: "center",
  },
  goalGrid: {
    flexDirection: "row",
    gap: spacing.sm,
  },
});
