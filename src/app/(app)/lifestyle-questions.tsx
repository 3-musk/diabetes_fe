import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgIcon } from '@/utils/icon';
import { useAuth } from '../../context/AuthContext';
import { getLifestyleQuestions, submitLifestyleAnswers, type CarePlanQuestion } from '../../services/carePlanService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';
import { AppText, BackButton, Button } from '../../components';
import { lifestyleQuestions as LIFESTYLEQUESTIONSCONSTANTS } from '../../constants/lifestyleQuestions';

export default function LifestyleQuestions() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { accessToken } = useAuth();

  const [questions,  setQuestions]  = useState<CarePlanQuestion[]>([]);
  const [current,    setCurrent]    = useState(0);
  const [answers,    setAnswers]    = useState<Record<string, string[]>>({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const qs = await getLifestyleQuestions(accessToken ?? '');
      setQuestions(qs);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const q        = questions[current];
  const total    = questions.length;
  const selected = answers[q?.id] ?? [];

  const toggleOption = (option: string) => {
    const prev = answers[q.id] ?? [];
    const next = q.type === 'single'
      ? [option]
      : prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option];
    setAnswers(a => ({ ...a, [q.id]: next }));
  };

  const canGoNext = selected.length > 0;

  const handleNext = () => {
    if (current < total - 1) {
      setCurrent(c => c + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await submitLifestyleAnswers(accessToken ?? '', answers);
    setSubmitting(false);
    router.back();
  };

  const progress = ((current + 1) / total) * 100;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <BackButton />
        <AppText variant="semibold" style={s.headerTitle}>{LIFESTYLEQUESTIONSCONSTANTS.pageTitle}</AppText>
        {/* Notification-like icon */}
        <View style={s.headerActions}>
          <View style={s.headerIcon}>
            <SvgIcon source={require('../../../assets/svgs/medication_reminder.svg')} size={46} />
          </View>
          <View style={s.headerIcon}>
            <SvgIcon source={require('../../../assets/svgs/notification.svg')} size={46} />
          </View>
        </View>
      </View>

      {/* Progress bar */}
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${progress}%` }]} />
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Question number */}
        <AppText style={s.questionNum}>{current + 1}/{total}</AppText>
        <AppText variant="semibold" style={s.questionText}>{q.question}</AppText>

        {/* Options */}
        <View style={s.options}>
          {q.options.map(option => {
            const isSelected = selected.includes(option);
            return (
              <Pressable
                key={option}
                style={[s.option, isSelected && s.optionSelected]}
                onPress={() => toggleOption(option)}
              >
                <View style={[s.radio, isSelected && s.radioSelected]}>
                  {isSelected && <View style={s.radioInner} />}
                </View>
                <AppText style={[s.optionText, isSelected && s.optionTextSelected]}>
                  {option}
                </AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer nav */}
      <View style={[s.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          variant="outline"
          title={LIFESTYLEQUESTIONSCONSTANTS.previousBtn}
          onPress={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          style={s.navBtn}
        />
        <Button
          variant="primary"
          title={current === total - 1 ? LIFESTYLEQUESTIONSCONSTANTS.submitBtn : LIFESTYLEQUESTIONSCONSTANTS.nextBtn}
          onPress={handleNext}
          disabled={!canGoNext || submitting}
          loading={submitting}
          style={s.navBtn}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    gap: spacing.md,
  },
  headerTitle: { flex: 1, fontSize: fontSize.xl, color: colors.textPrimary },
  headerActions: { flexDirection: 'row', gap: spacing.sm },
  headerIcon: {
    width: 34, height: 34, borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
    alignItems: 'center', justifyContent: 'center',
  },
  progressTrack: {
    height: 4, backgroundColor: colors.border,
    marginHorizontal: spacing.lg, borderRadius: 2, marginBottom: spacing.lg,
  },
  progressFill: {
    height: 4, backgroundColor: colors.primary, borderRadius: 2,
  },
  scroll: { paddingHorizontal: spacing.lg },
  questionNum: { fontSize: fontSize.sm, color: colors.textTertiary, marginBottom: spacing.sm },
  questionText: { fontSize: fontSize.lg, color: colors.textPrimary, lineHeight: 24, marginBottom: spacing.xl },
  options: { gap: spacing.sm },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    ...shadows.sm,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: '#FFF5F2' },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    borderColor: colors.border, alignItems: 'center', justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  optionText: { fontSize: fontSize.md, color: colors.textPrimary, flex: 1 },
  optionTextSelected: { color: colors.primary, fontWeight: '600' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  navBtn: {
    flex: 1, borderRadius: borderRadius.full,
    alignItems: 'center', paddingVertical: spacing.md,
  },
  navBtnOutline: { borderWidth: 1, borderColor: colors.primary },
  navBtnFill:    { backgroundColor: colors.primary },
  navBtnDisabled: { opacity: 0.4 },
  navBtnText:    { fontSize: fontSize.md, fontWeight: '600' },
  navBtnTextOutline: { color: colors.primary },
  navBtnTextFill:    { color: colors.primaryForeground },
});
