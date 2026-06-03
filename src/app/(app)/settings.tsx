import { StyleSheet, View } from "react-native";
import { AppText } from "../../components";
import { colors, fontSize, fontWeight, spacing } from "../../theme";

export default function Settings() {
  return (
    <View style={styles.container}>
      <AppText variant="bold" style={styles.title}>Settings</AppText>
      <AppText style={styles.text}>Update app preferences and account settings here.</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    backgroundColor: colors.background,
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
