import { SvgIcon } from '@/utils/icon';
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
import { AppText, BackButton, Button, DateInput } from '../../components';
import { medication as MEDICATIONCONSTANTS } from '../../constants/medication';
import { saveMedication } from '../../services/medicationService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

// ─── Medicine categories ───────────────────────────────────────────────────────

type MedCategory = 'Capsules' | 'Pills' | 'Liquid' | 'Others';



// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AddMedication() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();

  const [category,  setCategory]  = useState<MedCategory>('Capsules');
  const [medName,   setMedName]   = useState('');
  const [strength,  setStrength]  = useState('');
  const [frequency, setFrequency] = useState(0);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate,   setEndDate]   = useState<Date | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  const decreaseFreq = () => setFrequency(f => Math.max(0, f - 1));
  const increaseFreq = () => setFrequency(f => f + 1);

  const handleSave = async () => {
    setSubmitting(true);
    const format = (d?: Date) => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : '';
    await saveMedication({ category, medName, strength, frequency, startDate: format(startDate), endDate: format(endDate), isSystemGenerated: false });
    setSubmitting(false);
    router.back();
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <BackButton color={colors.primaryBackground} />
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
                    <SvgIcon color={active ? '#FFFFFF' :'#7c7b7b'} source={cat.icon} />
                  </View>
                  <AppText variant='semibold' style={[s.categoryLabel, active && s.categoryLabelActive]}>
                    {cat.id}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {/* Medication Name */}
          <View style={s.fieldWrap}>
            <AppText style={s.fieldLabel} variant='medium'>
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
            <AppText style={s.fieldLabel} variant='medium'>
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
          <View style={[
            s.fieldWrap, 
            {
              flex: 1,
              flexDirection: 'row',
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'space-between',
            }
          ]}>
            <AppText style={s.fieldLabel} variant='medium'>
              {MEDICATIONCONSTANTS.frequencyLabel} <AppText style={s.required}>*</AppText>
            </AppText>
            <View style={s.frequencyRow}>
              <Pressable style={s.freqBtn} onPress={decreaseFreq}>
                <FontAwesome name="minus" size={14} color={colors.secondaryForeground} />
              </Pressable>
              <AppText variant="medium" style={s.freqValue}>{frequency}</AppText>
              <Pressable style={[s.freqBtn, s.freqBtnAdd]} onPress={increaseFreq}>
                <FontAwesome name="plus" size={14} color={colors.secondaryForeground} />
              </Pressable>
            </View>
          </View>

          {/* Start Date */}
          <DateInput 
            containerStyle={s.fieldWrap}
            label={MEDICATIONCONSTANTS.startDateLabel} 
            value={startDate} 
            onChange={setStartDate} 
            placeholder={MEDICATIONCONSTANTS.selectDatePlaceholder}
            dateFormat="yy/mm/dd"
          />

          {/* End Date */}
          <DateInput 
            containerStyle={s.fieldWrap}
            label={MEDICATIONCONSTANTS.endDateLabel} 
            value={endDate} 
            onChange={setEndDate} 
            placeholder={MEDICATIONCONSTANTS.selectDatePlaceholder}
            dateFormat="yy/mm/dd"
          />

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
    backgroundColor: colors.primaryBackground,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: spacing.xl,
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
    marginTop: spacing.xl
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
  fieldWrap: { 
    marginBottom: spacing.md,
    marginTop: spacing.md
  },
  fieldLabel: { 
    fontSize: fontSize.md, 
    color: colors.textPrimary, 
    marginBottom: spacing.xs 
  },
  required: { 
    color: colors.error 
  },
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
    padding: 4,
    borderWidth: 1,
    borderRadius: borderRadius.full,
    borderColor: '#ddd6d6'
  },
  freqBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  freqBtnAdd: { 
    backgroundColor: colors.secondary 
  },
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
