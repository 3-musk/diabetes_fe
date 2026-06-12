import { StyleSheet } from "react-native";
import { AppText, ScreenContainer } from "../../components";
import { colors, fontSize, fontWeight, spacing } from "../../theme";

export default function Settings() {
  return (
    <ScreenContainer edges={['top']} contentStyle={styles.container}>
      <AppText variant="bold" style={styles.title}>Settings</AppText>
      <AppText style={styles.text}>Update app preferences and account settings here.</AppText>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
  },
  title: {
    fontSize: fontSize.title,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  text: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
