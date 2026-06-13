import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BackButton, LineChart, ScreenContainer } from '../../components';
import {
  MealImpactMealItem,
  MealImpactResponse,
  mealImpactTexts,
} from '../../constants/mealImpact';
import { MealSlotId } from '../../constants/meals';
import { ROUTES } from '../../constants/routes';
import { getMealImpact } from '../../services/mealService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

function MealItemCard({
  item,
  showSwap,
  onSwap,
}: {
  item: MealImpactMealItem;
  showSwap?: boolean;
  onSwap?: () => void;
}) {
  return (
    <View style={styles.mealCard}>
      <Image
        source={{ uri: item.imageUri ?? 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop' }}
        style={styles.mealImage}
        contentFit="cover"
      />
      <View style={styles.mealContent}>
        <AppText variant="semibold" style={styles.mealName}>{item.name}</AppText>
        <AppText style={styles.mealCalories}>{item.calories} Cal</AppText>
      </View>
      {showSwap && onSwap && (
        <Pressable style={styles.swapBtn} onPress={onSwap}>
          <AppText variant="semibold" style={styles.swapBtnText}>
            {mealImpactTexts.swapMeal}
          </AppText>
        </Pressable>
      )}
    </View>
  );
}

export default function MealImpactScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slotId, date } = useLocalSearchParams<{ slotId: MealSlotId; date: string }>();
  const activeSlotId = (slotId ?? 'breakfast') as MealSlotId;
  const activeDate = date ?? new Date().toISOString().split('T')[0];

  const [impact, setImpact] = useState<MealImpactResponse | null>(null);
  const [selectedMeals, setSelectedMeals] = useState<MealImpactMealItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadImpact = useCallback(async () => {
    setLoading(true);
    const data = await getMealImpact(activeDate, activeSlotId);
    setImpact(data);
    setSelectedMeals(data.selectedMeals);
    setLoading(false);
  }, [activeDate, activeSlotId]);

  useFocusEffect(
    useCallback(() => {
      loadImpact();
    }, [loadImpact])
  );

  const goBackToAddMeal = useCallback(() => {
    router.replace({
      pathname: ROUTES.appAddMeal as any,
      params: {
        slotId: activeSlotId,
        date: activeDate,
      },
    });
  }, [router, activeSlotId, activeDate]);

  const handleSwapMeal = (mealId: string) => {
    router.push({
      pathname: ROUTES.appSwapMeal as any,
      params: {
        slotId: activeSlotId,
        date: activeDate,
        mealId,
      },
    });
  };

  if (loading || !impact) {
    return (
      <ScreenContainer edges={['top']}>
        <View style={styles.header}>
          <BackButton color={colors.primaryBackground} onPress={goBackToAddMeal} />
          <AppText variant="semibold" style={styles.headerTitle}>
            {mealImpactTexts.pageTitle}
          </AppText>
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <BackButton color={colors.primaryBackground} onPress={goBackToAddMeal} />
        <AppText variant="semibold" style={styles.headerTitle}>
          {mealImpactTexts.pageTitle}
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        <AppText variant="semibold" style={styles.sectionTitle}>
          {mealImpactTexts.selectedMeal}
        </AppText>

        <View style={styles.cardList}>
          {selectedMeals.map(meal => (
            <MealItemCard
              key={meal.id}
              item={meal}
              showSwap
              onSwap={() => handleSwapMeal(meal.id)}
            />
          ))}
        </View>

        <View style={styles.chartCard}>
          <AppText variant="semibold" style={styles.chartTitle}>
            {mealImpactTexts.combinedGlucoseCurve}
          </AppText>
          <LineChart
            data={impact.glucoseCurve.data}
            labels={impact.glucoseCurve.labels}
            yAxisLabels={impact.glucoseCurve.yAxisLabels}
            color="#7B5EA7"
            height={180}
          />

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <AppText style={styles.statLabel}>{mealImpactTexts.peakGlucose}</AppText>
              <AppText variant="semibold" style={styles.statValue}>
                {impact.peakGlucose} {impact.peakGlucoseUnit}
              </AppText>
            </View>
            <View style={styles.statBox}>
              <AppText style={styles.statLabel}>{mealImpactTexts.timeToPeak}</AppText>
              <AppText variant="semibold" style={styles.statValue}>
                {impact.timeToPeak}
              </AppText>
            </View>
          </View>
        </View>

        {impact.warningMessage && (
          <View style={styles.warningBanner}>
            <View style={styles.warningIcon}>
              <FontAwesome name="exclamation" size={14} color={colors.primaryBackground} />
            </View>
            <AppText variant="medium" style={styles.warningText}>
              {impact.warningMessage}
            </AppText>
          </View>
        )}

        <View style={styles.suggestionsCard}>
          <AppText variant="semibold" style={styles.suggestionsTitle}>
            {mealImpactTexts.bringWithinRange}
          </AppText>
          <AppText style={styles.suggestionsSubtitle}>
            {mealImpactTexts.personalized}
          </AppText>

          {impact.suggestions.map(suggestion => (
            <View key={suggestion.id} style={styles.suggestionRow}>
              <View style={styles.suggestionIcon}>
                <FontAwesome name={suggestion.icon} size={18} color={colors.secondaryForeground} />
              </View>
              <View style={styles.suggestionContent}>
                <AppText variant="medium" style={styles.suggestionTitle}>
                  {suggestion.title}
                </AppText>
                <AppText style={styles.suggestionPeak}>
                  {mealImpactTexts.predictedPeak} - {suggestion.predictedPeak} mg/dl
                </AppText>
              </View>
              {suggestion.withinTarget && (
                <View style={styles.targetBadge}>
                  <AppText style={styles.targetBadgeText}>{suggestion.statusLabel}</AppText>
                </View>
              )}
            </View>
          ))}

          <AppText style={styles.suggestionsFooter}>
            {impact.suggestionsFooter}
          </AppText>
        </View>
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
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  cardList: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  mealImage: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.md,
  },
  mealContent: {
    flex: 1,
  },
  mealName: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  mealCalories: {
    fontSize: fontSize.md,
    color: colors.primary,
    marginTop: 2,
  },
  swapBtn: {
    backgroundColor: '#E8C547',
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  swapBtnText: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  chartTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.secondarybackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    color: '#5B4A7A',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  warningIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.textPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  suggestionsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  suggestionsTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  suggestionsSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.lg,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.secondarybackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  suggestionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  suggestionPeak: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  targetBadge: {
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  targetBadgeText: {
    fontSize: fontSize.xs,
    color: colors.success,
    fontWeight: '600',
  },
  suggestionsFooter: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});
