import { StyleSheet, View } from "react-native";
import { AppText } from "../../components";
import { colors, fontSize, fontWeight, spacing } from "../../theme";

export default function Profile() {
  return (
    <View style={styles.container}>
      <AppText variant="bold" style={styles.title}>Profile</AppText>
      <AppText style={styles.text}>Manage your personal details here.</AppText>
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
