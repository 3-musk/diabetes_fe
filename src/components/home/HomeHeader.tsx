import { StyleSheet, View } from "react-native";
import { colors, fontSize, spacing } from "../../theme";
import AppText from "../ui/AppText";
import { HeaderActionIcons } from "../navigation/HeaderActionIcons";

import { HOME_STRINGS } from "../../constants/home";

export function HomeHeader({ name }: { name: string }) {
  return (
    <View style={styles.header}>
      <View>
        <AppText variant="medium" style={styles.headerEyebrow}>{HOME_STRINGS.welcome}</AppText>
        <AppText variant="semibold" style={styles.headerName}>{name}</AppText>
      </View>
      <HeaderActionIcons />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  headerEyebrow: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  headerName: {
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    marginTop: 2,
  },
});
