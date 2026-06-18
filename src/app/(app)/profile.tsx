import { FontAwesome } from "@react-native-vector-icons/fontawesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText, BackButton, Button, Input, ScreenContainer } from "../../components";
import { markProfileComplete } from "../../services/carePlanService";
import { borderRadius, colors, fontSize, spacing } from "../../theme";
import { profileTexts } from "../../constants/profile";

export default function Profile() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const insets = useSafeAreaInsets();

  const [gender, setGender] = useState('');
  const [showGender, setShowGender] = useState(false);

  const handleBack = useCallback(() => {
    if (returnTo) {
      router.navigate(returnTo as any);
    } else {
      router.back();
    }
  }, [router, returnTo]);

  const handleSave = () => {
    markProfileComplete();
    handleBack();
  };

  useEffect(() => {
    const onBackPress = () => {
      if (returnTo) {
        handleBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [returnTo, handleBack]);

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <BackButton color={colors.primaryBackground} onPress={handleBack} />
        <AppText variant="semibold" style={styles.headerTitle}>{profileTexts.pageTitle}</AppText>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={profileTexts.fullNameLabel}
          placeholder={profileTexts.enterDetails}
          required
          containerStyle={styles.inputContainer}
        />
        <Input
          label={profileTexts.emailLabel}
          placeholder={profileTexts.enterDetails}
          required
          containerStyle={styles.inputContainer}
        />
        <Input
          label={profileTexts.yobLabel}
          placeholder={profileTexts.enterDetails}
          required
          keyboardType="numeric"
          containerStyle={styles.inputContainer}
        />
        <Input
          label={profileTexts.heightLabel}
          placeholder={profileTexts.enterDetails}
          required
          keyboardType="numeric"
          containerStyle={styles.inputContainer}
        />
        <Input
          label={profileTexts.weightLabel}
          placeholder={profileTexts.enterDetails}
          required
          keyboardType="numeric"
          containerStyle={styles.inputContainer}
        />
        <Input
          label={profileTexts.bmiLabel}
          placeholder={profileTexts.enterDetails}
          required
          keyboardType="numeric"
          containerStyle={styles.inputContainer}
        />

        <View style={styles.genderField}>
          <TouchableOpacity onPress={() => setShowGender(!showGender)} activeOpacity={1}>
            <View pointerEvents="none">
              <Input
                label={profileTexts.genderLabel}
                placeholder={profileTexts.selectGender}
                value={gender}
                required
                rightIcon={
                  <FontAwesome
                    name={showGender ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colors.textTertiary}
                  />
                }
                containerStyle={styles.inputContainer}
                editable={false}
              />
            </View>
          </TouchableOpacity>

          {showGender && (
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => { setGender(profileTexts.male); setShowGender(false); }}
              >
                <AppText style={styles.dropdownText}>{profileTexts.male}</AppText>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownOption}
                onPress={() => { setGender(profileTexts.female); setShowGender(false); }}
              >
                <AppText style={styles.dropdownText}>{profileTexts.female}</AppText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Button style={styles.saveBtn} onPress={handleSave}>
          <AppText variant="semibold" style={styles.saveBtnText}>{profileTexts.saveBtn}</AppText>
        </Button>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  genderField: {
    zIndex: 10,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnText: {
    color: colors.primaryBackground,
    fontSize: fontSize.lg,
  },
  dropdown: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    marginTop: -spacing.md,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownText: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
});
