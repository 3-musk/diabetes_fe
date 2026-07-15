import { FontAwesome } from "@react-native-vector-icons/fontawesome";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { BackHandler, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText, Button, Input, PageHeader, ScreenContainer } from "../../components";
import { getUser, updateUser } from "../../services/authService";
import { borderRadius, colors, fontSize, spacing } from "../../theme";
import { profileTexts } from "../../constants/profile";

export default function Profile() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [yob, setYob] = useState('');
  const [height, setHeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [diagnosisYear, setDiagnosisYear] = useState('');
  const [gender, setGender] = useState('');
  const [showGender, setShowGender] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const user = await getUser();
        if (user) {
          setName(user.name || '');
          setEmail(user.email || '');
          setYob(user.yearOfBirth ? String(user.yearOfBirth) : '');
          setHeight(user.heightCm ? String(user.heightCm) : '');
          setTargetWeight(user.targetWeightKg ? String(user.targetWeightKg) : '');
          setDiagnosisYear(user.diagnosisYear ? String(user.diagnosisYear) : '');
          
          if (user.gender) {
            if (user.gender.toUpperCase() === 'MALE') setGender(profileTexts.male);
            else if (user.gender.toUpperCase() === 'FEMALE') setGender(profileTexts.female);
            else setGender(user.gender);
          }
        }
      } catch (error) {
        console.error("Failed to load user", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleBack = useCallback(() => {
    if (returnTo) {
      router.navigate(returnTo as any);
    } else {
      router.back();
    }
  }, [router, returnTo]);

  const handleSave = async () => {
    setLoading(true);
    let mappedGender = gender;
    if (gender === profileTexts.male) mappedGender = 'MALE';
    else if (gender === profileTexts.female) mappedGender = 'FEMALE';
    
    await updateUser({
      name,
      email,
      yearOfBirth: yob ? parseInt(yob) : undefined,
      diagnosisYear: diagnosisYear ? parseInt(diagnosisYear) : undefined,
      heightCm: height ? parseFloat(height) : undefined,
      targetWeightKg: targetWeight ? parseFloat(targetWeight) : undefined,
      gender: mappedGender
    });
    setLoading(false);
    
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
      <PageHeader title={profileTexts.pageTitle} onBack={handleBack} />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom + 20, 40) }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={profileTexts.fullNameLabel}
          placeholder={profileTexts.enterDetails}
          required
          value={name}
          onChangeText={setName}
          containerStyle={styles.inputContainer}
        />
        <Input
          label={profileTexts.emailLabel}
          placeholder={profileTexts.enterDetails}
          required
          value={email}
          onChangeText={setEmail}
          containerStyle={styles.inputContainer}
        />
        <Input
          label={profileTexts.yobLabel}
          placeholder={profileTexts.enterDetails}
          required
          keyboardType="numeric"
          value={yob}
          onChangeText={(val) => setYob(val.replace(/[^0-9]/g, ''))}
          containerStyle={styles.inputContainer}
        />
        <Input
          label={profileTexts.heightLabel}
          placeholder={profileTexts.enterDetails}
          required
          keyboardType="decimal-pad"
          value={height}
          onChangeText={(val) => setHeight(val.replace(/[^0-9.]/g, ''))}
          containerStyle={styles.inputContainer}
        />
        <Input
          label={profileTexts.targetWeightLabel}
          placeholder={profileTexts.enterDetails}
          required
          keyboardType="decimal-pad"
          value={targetWeight}
          onChangeText={(val) => setTargetWeight(val.replace(/[^0-9.]/g, ''))}
          containerStyle={styles.inputContainer}
        />
        <Input
          label={profileTexts.diagnosisYearLabel}
          placeholder={profileTexts.enterDetails}
          required
          keyboardType="numeric"
          value={diagnosisYear}
          onChangeText={(val) => setDiagnosisYear(val.replace(/[^0-9]/g, ''))}
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
