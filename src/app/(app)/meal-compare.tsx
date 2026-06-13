import { LineChart as GiftedLineChart } from 'react-native-gifted-charts';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BackButton, ScreenContainer } from '../../components';
import { MealSlotId } from '../../constants/meals';
import { ROUTES } from '../../constants/routes';
import { MealCompareResponse, swapMealTexts } from '../../constants/swapMeal';
import { getMealCompare } from '../../services/mealService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

function NutrientTable({ nutrients }: { nutrients: MealCompareResponse['nutrients'] }) {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <AppText variant="semibold" style={[styles.tableCell, styles.tableHeaderCell, styles.nutrientCol]}>
          {swapMealTexts.nutrient}
        </AppText>
        <AppText variant="semibold" style={[styles.tableCell, styles.tableHeaderCell]}>
          {swapMealTexts.original}
        </AppText>
        <AppText variant="semibold" style={[styles.tableCell, styles.tableHeaderCell]}>
          {swapMealTexts.optimized}
        </AppText>
      </View>

      {nutrients.map(row => (
        <View key={row.label} style={styles.tableRow}>
          <AppText style={[styles.tableCell, styles.nutrientCol]}>{row.label}</AppText>
          <AppText style={styles.tableCell}>{row.original}</AppText>
          <AppText style={styles.tableCell}>{row.optimized}</AppText>
        </View>
      ))}
    </View>
  );
}

function CompareGlucoseChart({ data }: { data: MealCompareResponse['glucoseComparison'] }) {
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - spacing.lg * 2 - spacing.lg * 2;
  const height = 180;
  const yAxisLabelWidth = 40;
  const maxY = Math.max(...data.yAxisLabels);
  const noOfSections = data.yAxisLabels.length - 1;
  const stepValue = maxY / noOfSections;

  const dataSet = [
    {
      data: data.original.data.map((value, index) => ({
        value,
        label: data.labels[index] ?? '',
      })),
      color: data.original.color,
      thickness: 2,
      dataPointsRadius: 3,
      curved: true,
    },
    {
      data: data.optimized.data.map((value, index) => ({
        value,
        label: data.labels[index] ?? '',
      })),
      color: data.optimized.color,
      thickness: 2,
      dataPointsRadius: 3,
      curved: true,
    },
  ];

  return (
    <View>
      <View style={[styles.chartWrap, { width: chartWidth }]}>
        <GiftedLineChart
          dataSet={dataSet}
          height={height}
          width={chartWidth - yAxisLabelWidth - 10}
          maxValue={maxY}
          noOfSections={noOfSections}
          stepValue={stepValue}
          yAxisLabelWidth={yAxisLabelWidth}
          textFontSize={10}
          textColor={colors.textSecondary}
          xAxisLabelTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
          yAxisTextStyle={{ color: colors.textSecondary, fontSize: 10 }}
          rulesType="solid"
          rulesColor={colors.border}
          yAxisColor={colors.border}
          xAxisColor={colors.border}
          initialSpacing={16}
          endSpacing={16}
          isAnimated
          animationDuration={600}
        />
      </View>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: data.original.color }]} />
          <AppText style={styles.legendText}>{data.original.legendLabel}</AppText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: data.optimized.color }]} />
          <AppText style={styles.legendText}>{data.optimized.legendLabel}</AppText>
        </View>
      </View>
    </View>
  );
}

export default function MealCompareScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slotId, date, mealId, alternativeId } = useLocalSearchParams<{
    slotId: MealSlotId;
    date: string;
    mealId: string;
    alternativeId: string;
  }>();

  const activeSlotId = (slotId ?? 'breakfast') as MealSlotId;
  const activeDate = date ?? new Date().toISOString().split('T')[0];

  const [compareData, setCompareData] = useState<MealCompareResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const goBackToSwapMeal = useCallback(() => {
    router.replace({
      pathname: ROUTES.appSwapMeal as any,
      params: {
        slotId: activeSlotId,
        date: activeDate,
        mealId,
      },
    });
  }, [router, activeSlotId, activeDate, mealId]);

  const loadCompare = useCallback(async () => {
    if (!mealId || !alternativeId) return;

    setLoading(true);
    const data = await getMealCompare(activeDate, activeSlotId, mealId, alternativeId);
    setCompareData(data);
    setLoading(false);
  }, [activeDate, activeSlotId, mealId, alternativeId]);

  useEffect(() => {
    loadCompare();
  }, [loadCompare]);

  if (loading || !compareData) {
    return (
      <ScreenContainer edges={['top']}>
        <AppText style={styles.breadcrumb}>{swapMealTexts.pageTitle}</AppText>
        <View style={styles.header}>
          <BackButton color={colors.primaryBackground} onPress={goBackToSwapMeal} />
          <AppText variant="semibold" style={styles.headerTitle}>
            {swapMealTexts.comparePageTitle}
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
      <AppText style={styles.breadcrumb}>{swapMealTexts.pageTitle}</AppText>
      <View style={styles.header}>
        <BackButton color={colors.primaryBackground} onPress={goBackToSwapMeal} />
        <AppText variant="semibold" style={styles.headerTitle}>
          {swapMealTexts.comparePageTitle}
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        <View style={styles.card}>
          <AppText variant="semibold" style={styles.cardTitle}>
            {swapMealTexts.finalizedMeal}
          </AppText>
          <AppText variant="semibold" style={styles.finalizedName}>
            {compareData.finalizedMealName}
          </AppText>
          <AppText style={styles.swappedFrom}>
            {compareData.swappedFromLabel}
          </AppText>

          <View style={styles.predictionBox}>
            <AppText variant="semibold" style={styles.predictionPrimary}>
              {swapMealTexts.newMealPrediction} : {compareData.newPeakGlucose}mg/dl peak
            </AppText>
            <AppText style={styles.predictionSecondary}>
              {swapMealTexts.originalPeak} : {compareData.originalPeakGlucose}mg/dl | {compareData.peakImprovement} mg/dl {swapMealTexts.peakImprovement}
            </AppText>
          </View>
        </View>

        <View style={styles.card}>
          <AppText variant="semibold" style={styles.cardTitle}>
            {swapMealTexts.comparingTitle}
          </AppText>
          <NutrientTable nutrients={compareData.nutrients} />
        </View>

        <View style={styles.card}>
          <AppText variant="semibold" style={styles.cardTitle}>
            {swapMealTexts.compareSideBySide}
          </AppText>
          <CompareGlucoseChart data={compareData.glucoseComparison} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  breadcrumb: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
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
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: spacing.lg,
    ...shadows.sm,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  finalizedName: {
    fontSize: fontSize.xxl,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  swappedFrom: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.md,
  },
  predictionBox: {
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  predictionPrimary: {
    fontSize: fontSize.md,
    color: colors.success,
    marginBottom: spacing.xs,
  },
  predictionSecondary: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tableCell: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  tableHeaderCell: {
    color: colors.textSecondary,
  },
  nutrientCol: {
    flex: 1.2,
  },
  chartWrap: {
    marginTop: spacing.sm,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});
