import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { borderRadius, colors, fontSize, spacing } from "../../theme";
import AppText from "../ui/AppText";
import Button from "../ui/Button";
import { useRouter } from "expo-router";
import { ROUTES } from "../../constants/routes";
import { lifestyleQuestions } from "../../constants/lifestyleQuestions";
import type { LifestyleQuestionData } from "./types";
import { useFeatureAccess } from "../../hooks/useFeatureAccess";

export function LifestyleQuestionSection({ data }: { data: LifestyleQuestionData | null }) {
  const router = useRouter();
  const { checkFeature } = useFeatureAccess();

  if (!data) return null;

  return (
    <LinearGradient
      colors={["#F7C118", "#FFFFFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.questionCard}
    >
      <AppText variant="semibold" style={styles.questionTitle}>
        {data.isCompleted ? lifestyleQuestions.questionsAnswered : `${lifestyleQuestions.questionsProgressPrefix} (${data.current}/${data.total})`}
      </AppText>
      <AppText style={styles.questionText}>
        {data.question}
      </AppText>
      <Button
        onPress={() => checkFeature('care-plan', () => router.push(ROUTES.appLifestyleQuestions as any))}
      >
        <AppText variant="semibold" style={styles.primaryPillText}>
          {data.isCompleted ? lifestyleQuestions.viewAnswers : lifestyleQuestions.viewQuestions}
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
    color: colors.primaryBackground,
    fontSize: fontSize.lg,
  },
});
