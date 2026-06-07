import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, BackButton, Button } from '../../components';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';
import { medication as MEDICATIONCONSTANTS } from '../../constants/medication';
import { saveMedication } from '../../services/medicationService';

// ─── Medicine categories ───────────────────────────────────────────────────────

type MedCategory = 'Capsules' | 'Pills' | 'Liquid' | 'Others';

// ─── Date input ───────────────────────────────────────────────────────────────

function DateField({
  label,
  required,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={s.fieldWrap}>
      <AppText style={s.fieldLabel}>
        {label}
        {required && <AppText style={s.required}> *</AppText>}
      </AppText>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          placeholder={MEDICATIONCONSTANTS.selectDatePlaceholder}
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChange}
        />
        <FontAwesome name="calendar" size={18} color={colors.textTertiary} style={s.calIcon} />
      </View>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AddMedication() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [category,  setCategory]  = useState<MedCategory>('Capsules');
  const [medName,   setMedName]   = useState('');
  const [strength,  setStrength]  = useState('');
  const [frequency, setFrequency] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const decreaseFreq = () => setFrequency(f => Math.max(0, f - 1));
  const increaseFreq = () => setFrequency(f => f + 1);

  const handleSave = async () => {
    setSubmitting(true);
    await saveMedication({ category, medName, strength, frequency, startDate, endDate });
    setSubmitting(false);
    router.back();
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <BackButton />
        <AppText variant="semibold" style={s.headerTitle}>{MEDICATIONCONSTANTS.pageTitle}</AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.card}>
          {/* Medicine category */}
          <AppText variant="semibold" style={s.cardTitle}>{MEDICATIONCONSTANTS.selectCategoryTitle}</AppText>
          <View style={s.categoryRow}>
            {MEDICATIONCONSTANTS.categories.map(cat => {
              const active = category === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  style={s.categoryItem}
                  onPress={() => setCategory(cat.id)}
                >
                  <View style={[s.categoryCircle, active && s.categoryCircleActive]}>
                    <FontAwesome
                      name={cat.icon}
                      size={20}
                      color={active ? colors.primaryForeground : colors.textTertiary}
                    />
                  </View>
                  <AppText style={[s.categoryLabel, active && s.categoryLabelActive]}>
                    {cat.id}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {/* Medication Name */}
          <View style={s.fieldWrap}>
            <AppText style={s.fieldLabel}>
              {MEDICATIONCONSTANTS.medicationNameLabel}<AppText style={s.required}> *</AppText>
            </AppText>
            <TextInput
              style={s.input}
              placeholder={MEDICATIONCONSTANTS.medicationNamePlaceholder}
              placeholderTextColor={colors.textTertiary}
              value={medName}
              onChangeText={setMedName}
            />
          </View>

          {/* Strength */}
          <View style={s.fieldWrap}>
            <AppText style={s.fieldLabel}>
              {MEDICATIONCONSTANTS.strengthLabel}<AppText style={s.required}> *</AppText>
            </AppText>
            <TextInput
              style={s.input}
              placeholder={MEDICATIONCONSTANTS.strengthPlaceholder}
              placeholderTextColor={colors.textTertiary}
              value={strength}
              onChangeText={setStrength}
            />
          </View>

          {/* Frequency */}
          <View style={s.fieldWrap}>
            <AppText style={s.fieldLabel}>
              {MEDICATIONCONSTANTS.frequencyLabel} <AppText style={s.required}>*</AppText>
            </AppText>
            <View style={s.frequencyRow}>
              <Pressable style={s.freqBtn} onPress={decreaseFreq}>
                <FontAwesome name="minus" size={14} color={colors.secondaryForeground} />
              </Pressable>
              <AppText variant="semibold" style={s.freqValue}>{frequency}</AppText>
              <Pressable style={[s.freqBtn, s.freqBtnAdd]} onPress={increaseFreq}>
                <FontAwesome name="plus" size={14} color={colors.secondaryForeground} />
              </Pressable>
            </View>
          </View>

          {/* Start Date */}
          <DateField label={MEDICATIONCONSTANTS.startDateLabel} value={startDate} onChange={setStartDate} />

          {/* End Date */}
          <DateField label={MEDICATIONCONSTANTS.endDateLabel} value={endDate} onChange={setEndDate} />

          {/* Save */}
          <Button style={s.saveBtn} title={MEDICATIONCONSTANTS.saveBtn} onPress={handleSave} loading={submitting} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: fontSize.xl, color: colors.textPrimary },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },

  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: spacing.xl,
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },

  // Categories
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  categoryItem: { alignItems: 'center', gap: spacing.xs },
  categoryCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryLabel: { fontSize: fontSize.sm, color: colors.textTertiary },
  categoryLabelActive: { color: colors.primary, fontWeight: '600' },

  // Fields
  fieldWrap: { marginBottom: spacing.lg },
  fieldLabel: { fontSize: fontSize.md, color: colors.textPrimary, marginBottom: spacing.xs },
  required: { color: colors.error },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  inputRow: { position: 'relative', justifyContent: 'center' },
  calIcon: { position: 'absolute', right: spacing.lg },

  // Frequency
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  freqBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  freqBtnAdd: { backgroundColor: colors.secondary },
  freqValue: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },

  // Save
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
  saveBtnText: { color: colors.primaryForeground, fontSize: fontSize.lg },
});
