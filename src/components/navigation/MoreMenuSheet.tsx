import { FontAwesome } from "@react-native-vector-icons/fontawesome";
import { useRouter } from "expo-router";
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ROUTES } from "../../constants/routes";
import { borderRadius, colors, fontSize, fontWeight, shadows, spacing } from "../../theme";
import AppText from "../AppText";

type MoreMenuSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function MoreMenuSheet({ visible, onClose }: MoreMenuSheetProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleOptionPress = (pathname: typeof ROUTES.appProfile | typeof ROUTES.appSettings) => {
    onClose();
    router.push(pathname);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable
          style={[
            styles.menuCard,
            { marginBottom: insets.bottom + spacing.xl },
          ]}
        >
          <View style={styles.handle} />

          <TouchableOpacity
            style={styles.option}
            onPress={() => handleOptionPress(ROUTES.appProfile)}
          >
            <FontAwesome name="user" size={20} color={colors.textPrimary} />
            <AppText variant="medium" style={styles.optionText}>
              Profile
            </AppText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.option}
            onPress={() => handleOptionPress(ROUTES.appSettings)}
          >
            <FontAwesome name="cog" size={20} color={colors.textPrimary} />
            <AppText variant="medium" style={styles.optionText}>
              Settings
            </AppText>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: colors.overlay,
  },
  menuCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    ...shadows.lg,
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.lg,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    color: colors.textPrimary,
  },
});
