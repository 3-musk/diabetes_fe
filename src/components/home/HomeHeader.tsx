import { SvgIcon } from "@/utils/icon";
import { Pressable, StyleSheet, View } from "react-native";
import { colors, fontSize, spacing } from "../../theme";
import AppText from "../AppText";

export function HomeHeader({ name }: { name: string }) {
  return (
    <View style={styles.header}>
      <View>
        <AppText variant="medium" style={styles.headerEyebrow}>Welcome</AppText>
        <AppText variant="semibold" style={styles.headerName}>
          {name}
        </AppText>
      </View>

      <View style={styles.headerActions}>
        <Pressable style={styles.headerIcon}>
          <SvgIcon source={require('../../../assets/svgs/medication_reminder.svg')} size={46}/>
        </Pressable>
        <Pressable style={styles.headerIcon}>
          <SvgIcon source={require('../../../assets/svgs/notification.svg')} size={46}/>
        </Pressable>
      </View>
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
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  headerName: {
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: spacing.xxxl,
  },
  headerIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
  },
});
