import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { BackHandler, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, BackButton } from "../../components";
import { borderRadius, colors, fontSize, spacing } from "../../theme";

export default function Profile() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  const handleBack = () => {
    if (returnTo) {
      router.navigate(returnTo as any);
      return true;
    } else {
      router.back();
      return true;
    }
  };

  useEffect(() => {
    const onBackPress = () => {
      if (returnTo) {
        handleBack();
        return true; // prevent default behavior
      }
      return false; // let default behavior happen
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    return () => {
      subscription.remove();
    };
  }, [returnTo]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header with back button so returning lands on the previous screen (care-plan etc.) */}
      <View style={styles.header}>
        <BackButton onPress={handleBack} />
        <AppText variant="semibold" style={styles.headerTitle}>Profile</AppText>
      </View>

      <View style={styles.content}>
        <AppText style={styles.text}>Manage your personal details here.</AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  text: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: "center",
  },
});
