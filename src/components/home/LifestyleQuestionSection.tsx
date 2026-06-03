import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet } from "react-native";
import AppText from "../AppText";
import { borderRadius, colors, fontSize, spacing } from "../../theme";
import type { LifestyleQuestionData } from "./types";

export function LifestyleQuestionSection({ data }: { data: LifestyleQuestionData | null }) {
  if (!data) return null;

  return (
    <LinearGradient
      colors={["#FFD83B", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.questionCard}
    >
      <AppText variant="semibold" style={styles.questionTitle}>
        Lifestyle Questions ({data.current}/{data.total})
      </AppText>
      <AppText style={styles.questionText}>{data.question}</AppText>
      <Pressable style={styles.primaryPill}>
        <AppText variant="semibold" style={styles.primaryPillText}>
          View Lifestyle Questions
        </AppText>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  questionCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  questionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    marginBottom: spacing.lg,
  },
  questionText: {
    color: colors.textPrimary,
    fontSize: fontSize.sm,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  primaryPill: {
    minHeight: 42,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  primaryPillText: {
    color: colors.primaryForeground,
    fontSize: fontSize.sm,
  },
});
