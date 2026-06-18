import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SvgIcon } from '@/utils/icon';
import { AppText, BackButton, Button, RoundCheckBox, ScreenContainer } from '../../components';
import { MealSlotId, getDefaultMealSlotByTime } from '../../constants/meals';
import { ROUTES } from '../../constants/routes';
import { SwapMealOption, SwapMealResponse, swapMealTexts } from '../../constants/swapMeal';
import { getSwapMealOptions, saveMealSwap } from '../../services/mealService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=120&h=120&fit=crop';

function MealRow({
  name,
  calories,
  imageUri,
  calorieChangePercent,
  selected,
  onPress,
}: {
  name: string;
  calories: number;
  imageUri?: string;
  calorieChangePercent?: number | null;
  selected?: boolean;
  onPress?: () => void;
}) {
  const content = (
    <>
      <Image
        source={{ uri: imageUri ?? FALLBACK_IMAGE }}
        style={styles.mealImage}
        contentFit="cover"
      />
      <View style={styles.mealContent}>
        <AppText variant="semibold" style={styles.mealName}>{name}</AppText>
        <View style={styles.calorieRow}>
          <AppText style={styles.mealCalories}>{calories} {swapMealTexts.calUnit}</AppText>
          {calorieChangePercent != null && calorieChangePercent < 0 && (
            <AppText style={styles.calorieChange}>
              - {Math.abs(calorieChangePercent)}% ↓
            </AppText>
          )}
        </View>
      </View>
      {onPress && <RoundCheckBox selected={!!selected} />}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={[styles.optionRow, selected && styles.optionRowSelected]}
        onPress={onPress}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={styles.currentRow}>{content}</View>;
}

export default function SwapMealScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slotId, date, mealId } = useLocalSearchParams<{
    slotId: MealSlotId;
    date: string;
    mealId: string;
  }>();

  const activeSlotId = (slotId ?? getDefaultMealSlotByTime()) as MealSlotId;
  const activeDate = date ?? new Date().toISOString().split('T')[0];

  const [swapData, setSwapData] = useState<SwapMealResponse | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSwapOptions = useCallback(async () => {
    if (!mealId) return;

    setLoading(true);
    const data = await getSwapMealOptions(activeDate, activeSlotId, mealId);
    setSwapData(data);
    setSelectedOptionId(data?.options[0]?.id ?? null);
    setLoading(false);
  }, [activeDate, activeSlotId, mealId]);

  useEffect(() => {
    loadSwapOptions();
  }, [loadSwapOptions]);

  const goBackToMealImpact = useCallback(() => {
    router.replace({
      pathname: ROUTES.appMealImpact as any,
      params: {
        slotId: activeSlotId,
        date: activeDate,
      },
    });
  }, [router, activeSlotId, activeDate]);

  const handleCompare = () => {
    if (!mealId || !selectedOptionId) return;

    router.push({
      pathname: ROUTES.appMealCompare as any,
      params: {
        slotId: activeSlotId,
        date: activeDate,
        mealId,
        alternativeId: selectedOptionId,
      },
    });
  };

  const handleKeepOriginal = () => {
    goBackToMealImpact();
  };

  const handleSave = async () => {
    if (!mealId || !selectedOptionId) return;

    setSaving(true);
    try {
      await saveMealSwap(activeDate, activeSlotId, mealId, selectedOptionId);
      goBackToMealImpact();
    } finally {
      setSaving(false);
    }
  };

  if (loading || !swapData) {
    return (
      <ScreenContainer edges={['top']}>
        <View style={styles.header}>
          <BackButton color={colors.primaryBackground} onPress={goBackToMealImpact} />
          <AppText variant="semibold" style={styles.headerTitle}>
            {swapMealTexts.pageTitle}
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
        <BackButton color={colors.primaryBackground} onPress={goBackToMealImpact} />
        <AppText variant="semibold" style={styles.headerTitle}>
          {swapMealTexts.pageTitle}
        </AppText>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + spacing.xxl }]}
      >
        <View style={styles.card}>
          <AppText variant="semibold" style={styles.sectionTitle}>
            {swapMealTexts.pageTitle}
          </AppText>
          <View style={styles.currentRow}>
            <Image
              source={{ uri: swapData.currentMeal.imageUri ?? FALLBACK_IMAGE }}
              style={styles.mealImage}
              contentFit="cover"
            />
            <View style={styles.mealContent}>
              <AppText variant="semibold" style={styles.mealName}>
                {swapData.currentMeal.name}
              </AppText>
              <AppText style={styles.mealCalories}>
                {swapData.currentMeal.calories} {swapMealTexts.calUnit}
              </AppText>
            </View>
            <View style={styles.currentBadge}>
              <AppText variant="semibold" style={styles.currentBadgeText}>
                {swapMealTexts.currentMeal}
              </AppText>
            </View>
          </View>
        </View>

        <View style={styles.swapIconWrap}>
          <SvgIcon 
            source={require('../../../assets/svgs/meals/mealswap.svg')}
            size={30}
          />
        </View>

        <View style={styles.card}>
          <AppText variant="semibold" style={styles.sectionTitle}>
            {swapMealTexts.selectMeal}
          </AppText>

          {swapData.options.map((option: SwapMealOption) => (
            <MealRow
              key={option.id}
              name={option.name}
              calories={option.calories}
              imageUri={option.imageUri}
              calorieChangePercent={option.calorieChangePercent}
              selected={selectedOptionId === option.id}
              onPress={() => setSelectedOptionId(option.id)}
            />
          ))}

          <Button
            title={swapMealTexts.compare}
            variant="outline"
            onPress={handleCompare}
            style={styles.actionBtn}
            disabled={!selectedOptionId}
          />
          <Button
            title={swapMealTexts.keepOriginal}
            variant="outline"
            onPress={handleKeepOriginal}
            style={styles.actionBtn}
          />
          <Button
            title={swapMealTexts.save}
            onPress={handleSave}
            loading={saving}
            size="lg"
            style={styles.saveBtn}
            disabled={!selectedOptionId}
          />
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: spacing.xl
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.secondarybackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  currentBadge: {
    backgroundColor: colors.textPrimary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  currentBadgeText: {
    fontSize: fontSize.sm,
    color: colors.primaryBackground,
  },
  swapIconWrap: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  swapIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.secondarybackground,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionRowSelected: {
    borderColor: colors.primary,
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
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 2,
  },
  mealCalories: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
  calorieChange: {
    fontSize: fontSize.md,
    color: colors.success,
  },
  actionBtn: {
    marginTop: spacing.sm,
  },
  saveBtn: {
    marginTop: spacing.md,
  },
});
