import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from "react-native";
import { HBA1C_COLORS, HBA1C_STRINGS } from "../../constants/hba1cConfig";
import { ROUTES } from "../../constants/routes";
import { borderRadius, colors, fontSize, spacing } from "../../theme";
import AppText from "../ui/AppText";
import type { Hba1cData } from "./types";

export function Hba1cSection({ data }: { data: Hba1cData | null }) {
  const router = useRouter();
  const goToTracker = () => router.push(ROUTES.appHba1cTracker as any);
  if (!data) {
    return (
      <>
        <View style={styles.hba1cIntro}>
          <AppText variant="semibold" style={styles.hba1cIntroTitle}>
            {HBA1C_STRINGS.introTitle}
          </AppText>
          <AppText style={styles.hba1cIntroText}>
            {HBA1C_STRINGS.introBody}
          </AppText>
          <Pressable style={styles.goldButton} onPress={goToTracker}>
            <AppText variant="semibold" style={styles.goldButtonText}>
              {HBA1C_STRINGS.introAction}
            </AppText>
          </Pressable>
        </View>
      </>
    );
  }

  const formatted = new Date(data.testDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Pressable style={styles.card} onPress={goToTracker}>
      <View style={styles.sectionHeaderRow}>
        <AppText variant="semibold" style={styles.sectionTitle}>
          {HBA1C_STRINGS.sectionTitle}
        </AppText>
      </View>
      <View style={styles.sectionHeaderRow}>
        <View style={styles.valueBlock}>
          <AppText variant="medium" style={styles.timestamp}>{formatted}</AppText>
          <AppText variant="medium" style={styles.hba1cValue}>
            {data.value}%
          </AppText>
        </View>
        <View style={styles.warningPill}>
          <AppText variant="medium" style={styles.warningPillText}>
            {data.status}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hba1cIntro: {
    backgroundColor: colors.secondaryForeground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  hba1cIntroTitle: {
    color: colors.secondary,
    fontSize: fontSize.xl,
    marginBottom: spacing.sm,
  },
  hba1cIntroText: {
    color: HBA1C_COLORS.introText,
    fontSize: fontSize.md,
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
    borderColor: HBA1C_COLORS.cardBorder,
    padding: spacing.lg,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  valueBlock: {
    paddingLeft: 15,
  },
  warningPill: {
    backgroundColor: HBA1C_COLORS.pillBackground,
    borderRadius: borderRadius.full,
    borderColor: HBA1C_COLORS.cardBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  warningPillText: {
    color: colors.secondaryForeground,
    fontSize: fontSize.xl,
  },
  timestamp: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  hba1cValue: {
    color: colors.textPrimary,
    fontSize: fontSize.xxl,
    marginVertical: spacing.xs,
  },
});
