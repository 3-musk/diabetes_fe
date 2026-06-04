import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { borderRadius, colors, fontSize, spacing } from "../../theme";
import AppText from "../AppText";
import Button from "../Button";
import type { LifestyleQuestionData } from "./types";

export function LifestyleQuestionSection({ data }: { data: LifestyleQuestionData | null }) {
  if (!data) return null;

  return (
    <LinearGradient
      colors={["#F7C118", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.questionCard}
    >
      <AppText variant="semibold" style={styles.questionTitle}>
        Lifestyle Questions ({data.current}/{data.total})
      </AppText>
      <AppText style={styles.questionText}>
        {data.question}
      </AppText>
      <Button
        onPress={()=>{}}
      >
        <AppText variant="semibold" style={styles.primaryPillText}>
          View Lifestyle Questions
        </AppText>
      </Button>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  questionCard: {
    borderRadius: borderRadius.lg,
    borderColor: colors.secondary,
    borderWidth: 1,
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl
  },
  questionTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    marginBottom: spacing.lg,
  },
  questionText: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  primaryPillText: {
    color: colors.primaryForeground,
    fontSize: fontSize.lg,
  },
});
