import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, BackButton, Button, ScreenContainer } from '../../components';
import { lifestyleQuestions as LIFESTYLEQUESTIONSCONSTANTS } from '../../constants/lifestyleQuestions';
import { useAuth } from '../../context/AuthContext';
import { getLifestyleQuestions, submitLifestyleAnswers, type CarePlanQuestion } from '../../services/carePlanService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

export default function LifestyleQuestions() {
  const router  = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const insets  = useSafeAreaInsets();
  const { accessToken } = useAuth();

  const [questions,  setQuestions]  = useState<CarePlanQuestion[]>([]);
  const [current,    setCurrent]    = useState(0);
  const [answers,    setAnswers]    = useState<Record<string, string[]>>({});
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const { questions: qs, existingAnswers } = await getLifestyleQuestions(accessToken ?? '');
      setQuestions(qs);
      
      if (existingAnswers) {
        const mappedAnswers: Record<string, string[]> = {};
        Object.keys(existingAnswers).forEach(key => {
          const val = existingAnswers[key];
          mappedAnswers[key] = Array.isArray(val) ? val : [val];
        });
        setAnswers(mappedAnswers);
      }
      
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <ScreenContainer edges={['top']}>
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  const q        = questions[current];
  const total    = questions.length;
  const selected = answers[q?.id] ?? [];

  const toggleOption = (optionKey: string) => {
    const prev = answers[q.id] ?? [];
    const next = q.selectionMode === 'SINGLE'
      ? [optionKey]
      : prev.includes(optionKey) ? prev.filter(o => o !== optionKey) : [...prev, optionKey];
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
    
    // Format answers for API payload based on selectionMode
    const payloadAnswers: Record<string, string | string[]> = {};
    for (const question of questions) {
      const selectedKeys = answers[question.id] || [];
      if (question.selectionMode === 'SINGLE') {
        payloadAnswers[question.id] = selectedKeys[0] || '';
      } else {
        payloadAnswers[question.id] = selectedKeys;
      }
    }

    await submitLifestyleAnswers(accessToken ?? '', payloadAnswers);
    setSubmitting(false);
    if (returnTo) {
      router.navigate(returnTo as any);
    } else {
      router.back();
    }
  };

  const progress = ((current + 1) / total) * 100;

  return (
    <ScreenContainer edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <BackButton color={colors.primaryBackground}/>
        <AppText variant="semibold" style={s.headerTitle}>{LIFESTYLEQUESTIONSCONSTANTS.pageTitle}</AppText>
      </View>

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={s.card}>
          {/* Question number */}
          <AppText style={s.questionNum}>{current + 1}/{total}</AppText>
          <AppText variant="semibold" style={s.questionText}>{q.question}</AppText>

          {/* Options */}
          <View style={s.options}>
            {q.options.map(option => {
              const isSelected = selected.includes(option.key);
              return (
                <Pressable
                  key={option.key}
                  style={s.option}
                  onPress={() => toggleOption(option.key)}
                >
                  <View style={[s.radio, isSelected && s.radioSelected]}>
                    {isSelected && <View style={s.radioInner} />}
                  </View>
                  <AppText style={s.optionText}>
                    {option.value}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          {/* Footer nav inside card */}
          <View style={s.footer}>
            {current > 0 ? (
              <Button
                variant="outline"
                title={LIFESTYLEQUESTIONSCONSTANTS.previousBtn}
                onPress={() => setCurrent(c => Math.max(0, c - 1))}
                style={s.navBtn}
              />
            ) : <View style={{ flex: 1 }} />}
            <Button
              variant="primary"
              title={current === total - 1 ? LIFESTYLEQUESTIONSCONSTANTS.submitBtn : LIFESTYLEQUESTIONSCONSTANTS.nextBtn}
              onPress={handleNext}
              disabled={!canGoNext || submitting}
              loading={submitting}
              style={s.navBtn}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
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
  scroll: { paddingHorizontal: spacing.lg },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#72C2E9', // from the dashed border mockup, keeping it solid or standard light blue
    padding: spacing.xl,
    ...shadows.sm,
    marginTop: spacing.md,
  },
  questionNum: { fontSize: fontSize.md, color: colors.textTertiary, marginBottom: spacing.sm },
  questionText: { fontSize: fontSize.xl, color: colors.textPrimary, lineHeight: 28, marginBottom: spacing.xxl },
  options: { gap: spacing.lg, marginBottom: spacing.xxl },
  option: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  radio: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 1,
    borderColor: '#A16A54', alignItems: 'center', justifyContent: 'center', // brownish border from mockup
  },
  radioSelected: { borderColor: colors.primary },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary },
  optionText: { fontSize: fontSize.md, color: colors.textSecondary, flex: 1 },
  footer: {
    flexDirection: 'row', gap: spacing.md,
    paddingTop: spacing.lg,
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
