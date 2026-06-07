import { SvgIcon } from "@/utils/icon";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { ROUTES } from "../../constants/routes";
import { colors, spacing } from "../../theme";

/**
 * Shared reminder + notification icon buttons used across page headers.
 * Includes the ReminderModal so it works standalone wherever dropped in.
 */
export function HeaderActionIcons() {
  const router = useRouter();

  return (
    <>
      <View style={styles.row}>
        <Pressable style={styles.icon} onPress={() => router.push(ROUTES.appReminders as any)}>
          <SvgIcon source={require('../../../assets/svgs/medication_reminder.svg')} size={46} />
        </Pressable>
        <Pressable style={styles.icon}>
          <SvgIcon source={require('../../../assets/svgs/notification.svg')} size={46} />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.xxxl,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
  },
});
