import { Pressable, StyleSheet, View } from "react-native";
import AppText from "../AppText";
import { borderRadius, colors, fontSize, shadows, spacing } from "../../theme";
import { OutlineAction, SetupCard } from "./Shared";
import type { Hba1cData } from "./types";

export function Hba1cSection({ data }: { data: Hba1cData | null }) {
  if (!data) {
    return (
      <>
        <View style={styles.hba1cIntro}>
          <AppText variant="semibold" style={styles.hba1cIntroTitle}>
            Your First HbA1c Step
          </AppText>
          <AppText style={styles.hba1cIntroText}>
            Tracking your HbA1c provides a powerful window into your long term health.
            Let's start building your story today.
          </AppText>
          <Pressable style={styles.goldButton}>
            <AppText variant="semibold" style={styles.goldButtonText}>
              Add your First Reading
            </AppText>
          </Pressable>
        </View>

        <SetupCard title="HbA1c">
          <AppText style={styles.bodyText}>
            Add your HbA1c value to understand your average blood sugar over the last
            2-3 months.
          </AppText>
          <OutlineAction title="Add HbA1c Value" />
        </SetupCard>
      </>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeaderRow}>
        <AppText variant="semibold" style={styles.sectionTitle}>
          HbA1c
        </AppText>
        <View style={styles.warningPill}>
          <AppText variant="semibold" style={styles.warningPillText}>
            {data.status}
          </AppText>
        </View>
      </View>
      <AppText style={styles.timestamp}>{data.date}</AppText>
      <AppText variant="bold" style={styles.hba1cValue}>
        {data.value}
      </AppText>
      <AppText style={styles.timestamp}>{data.note}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    color: colors.textSecondary,
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  hba1cIntro: {
    backgroundColor: colors.secondaryForeground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  hba1cIntroTitle: {
    color: colors.secondary,
    fontSize: fontSize.lg,
    marginBottom: spacing.sm,
  },
  hba1cIntroText: {
    color: "#F4E1D1",
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  goldButton: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  goldButtonText: {
    color: colors.secondaryForeground,
    fontSize: fontSize.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: spacing.lg,
    ...shadows.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  warningPill: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  warningPillText: {
    color: colors.secondaryForeground,
    fontSize: fontSize.xs,
  },
  timestamp: {
    color: colors.textTertiary,
    fontSize: fontSize.xs,
  },
  hba1cValue: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    marginVertical: spacing.xs,
  },
});
