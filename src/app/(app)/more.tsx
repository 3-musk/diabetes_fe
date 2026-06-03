import { StyleSheet, View } from "react-native";
import { AppText } from "../../components";
import { colors, fontSize, fontWeight, spacing } from "../../theme";

export default function More() {
  return (
    <View style={styles.container}>
      <AppText variant="bold" style={styles.title}>More</AppText>
      <AppText style={styles.text}>Use the More tab to open Profile and Settings.</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
  },
});
