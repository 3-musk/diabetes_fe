import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
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
import { AppText, BackButton, Button, DateStrip, ScreenContainer } from '../../components';
import { NutritionSection } from '../../components/home/NutritionSection';
import {
  DayMealsResponse,
  getDefaultMealSlotByTime,
  MealSlotData,
  MealSlotId,
  mealsTexts,
} from '../../constants/meals';
import { ROUTES } from '../../constants/routes';
import { getMealsByDate } from '../../services/mealService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

const MEAL_SLOT_IMAGES: Record<MealSlotId, any> = {
  breakfast: require('../../../assets/images/meals/breakfast.png'),
  lunch: require('../../../assets/images/meals/lunch.png'),
  evening: require('../../../assets/images/meals/evening.png'),
  dinner: require('../../../assets/images/meals/dinner.png'),
};

function CaloriesCard({ consumed, total }: { consumed: number; total: number }) {
  const progress = total > 0 ? Math.min(consumed / total, 1) : 0;

  return (
    <>
      <AppText variant="semibold" style={styles.sectionTitle}>
        {mealsTexts.totalCalories}
      </AppText>

      <View style={styles.caloriesInner}>
        <AppText style={styles.consumedLabel}>
          {mealsTexts.consumedToday}
        </AppText>
        <View style={styles.caloriesValueRow}>
          <AppText variant="semibold" style={styles.consumedValue}>
            {consumed.toLocaleString()}
          </AppText>
          <AppText variant="medium" style={styles.caloriesDivider}>
            {' '}/ {total.toLocaleString()} 
            <AppText style={styles.caloriesText}>
              {' '}{mealsTexts.caloriesUnit}
            </AppText>
          </AppText>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>
    </>
  );
}

function RecommendationCard({ recommendations }: { recommendations: string[] }) {
  if (recommendations.length === 0) return null;

  return (
    <View style={styles.recommendationCard}>
      <View style={styles.recommendationHeader}>
        <SvgIcon 
          source={require('../../../assets/svgs/meals/recommendation.svg')}
          size={40}
        />
        <View>
          <AppText variant="regular" style={styles.recommendationTitle}>
            {mealsTexts.ourRecommendation}
          </AppText>
          {recommendations.map(item => (
            <AppText key={item} style={styles.recommendationText}>
              {item}
            </AppText>
          ))}
        </View>
      </View>
    </View>
  );
}

function LoggedMealRow({
  timeLabel,
  name,
  calories,
  approxCal,
}: {
  timeLabel: string;
  name: string;
  calories: number;
  approxCal?: number;
}) {
  return (
    <View style={styles.loggedMealRow}>
      <View style={styles.loggedMealHeader}>
        <AppText variant="medium" style={styles.loggedMealTime}>
          {timeLabel}
        </AppText>
        {approxCal != null && (
          <View style={styles.approxCalBadge}>
            <AppText variant="medium" style={styles.approxCalText}>
              {mealsTexts.approxCal} {approxCal}
            </AppText>
          </View>
        )}
      </View>
      <View style={styles.loggedMealBody}>
        <AppText variant="medium" style={styles.loggedMealName}>
          {name}
        </AppText>
        <AppText style={styles.loggedMealCalories}>
          {calories} {mealsTexts.caloriesUnit}
        </AppText>
      </View>
    </View>
  );
}

function MealSlotCard({
  slot,
  expanded,
  onToggle,
  onAddMeal,
}: {
  slot: MealSlotData;
  expanded: boolean;
  onToggle: () => void;
  onAddMeal: () => void;
}) {
  return (
    <View style={styles.slotCard}>
      <Pressable style={styles.slotHeader} onPress={onToggle}>
        <View style={styles.slotIconCircle}>
          <Image
            source={MEAL_SLOT_IMAGES[slot.id]}
            style={styles.slotIconImage}
            contentFit="contain"
          />
        </View>
        <View style={styles.slotHeaderText}>
          <AppText variant="semibold" style={styles.slotTitle}>
            {slot.label}
          </AppText>
          <AppText style={styles.slotSubtitle}>
            {mealsTexts.recommended} {slot.recommendedCalories.toLocaleString()} {mealsTexts.caloriesUnit}
          </AppText>
        </View>
        <FontAwesome
          name={expanded ? 'chevron-down' : 'chevron-right'}
          size={14}
          color={colors.textTertiary}
        />
      </Pressable>

      {expanded && (
        <View style={styles.slotBody}>
          <RecommendationCard recommendations={slot.recommendations} />

          {slot.loggedMeals.map(meal => (
            <LoggedMealRow
              key={meal.id}
              timeLabel={meal.timeLabel}
              name={meal.name}
              calories={meal.calories}
              approxCal={meal.approxCal}
            />
          ))}

          <Button
            title={mealsTexts.addMeal}
            onPress={onAddMeal}
            size="lg"
            style={styles.addMealBtn}
          />
        </View>
      )}
    </View>
  );
}

export default function MealsScreen() {
  const router = useRouter();
  const { date } = useLocalSearchParams<{ date?: string }>();
  const insets = useSafeAreaInsets();
  const [selectedDate, setSelectedDate] = useState(() => {
    if (!date) return new Date();
    const [year, month, day] = date.split('-').map(Number);
    return new Date(year, month - 1, day);
  });
  const [dayMeals, setDayMeals] = useState<DayMealsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(() => getDefaultMealSlotByTime());

  const loadMeals = useCallback(async (date: Date) => {
    setLoading(true);
    const data = await getMealsByDate(date);
    setDayMeals(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!date) return;

    const [year, month, day] = date.split('-').map(Number);
    const paramDate = new Date(year, month - 1, day);
    setSelectedDate(prev =>
      prev.toDateString() === paramDate.toDateString() ? prev : paramDate
    );
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      loadMeals(selectedDate);
    }, [loadMeals, selectedDate])
  );

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    loadMeals(date);
  };

  const handleAddMeal = (slotId: string) => {
    if (!dayMeals) return;
    router.push({
      pathname: ROUTES.appAddMeal as any,
      params: {
        slotId,
        date: dayMeals.date,
      },
    });
  };

  return (
    <ScreenContainer edges={['top']}>
      <View style={styles.header}>
        <BackButton color={colors.primaryBackground} />
        <AppText variant="semibold" style={styles.headerTitle}>
          {mealsTexts.pageTitle}
        </AppText>
      </View>

      {loading || !dayMeals ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + spacing.xxl },
          ]}
        >
          <DateStrip selectedDate={selectedDate} onSelectDate={handleDateChange} />

          <View style={styles.sectionWrap}>
            <NutritionSection data={dayMeals.nutrition} leftBorder={false}/>
          </View>
          
          <View style={styles.caloriesCard}>
            <CaloriesCard
              consumed={dayMeals.calories.consumed}
              total={dayMeals.calories.total}
            />

            <View style={styles.slotsWrap}>
              {dayMeals.slots.map(slot => (
                <MealSlotCard
                  key={slot.id}
                  slot={slot}
                  expanded={expandedSlotId === slot.id}
                  onToggle={() =>
                    setExpandedSlotId(prev => (prev === slot.id ? null : slot.id))
                  }
                  onAddMeal={() => handleAddMeal(slot.id)}
                />
              ))}
            </View>
          </View>

        </ScrollView>
      )}
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
  sectionWrap: {
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    borderColor: colors.secondary
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  caloriesCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    borderColor: colors.secondary,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  caloriesInner: {
    backgroundColor: colors.secondarybackground,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    borderColor: colors.secondary,
    padding: spacing.lg,
  },
  consumedLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  caloriesValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  consumedValue: {
    fontSize: fontSize.xxl,
    color: colors.success,
  },
  caloriesDivider: {
    fontSize: fontSize.xxl,
    color: colors.textSecondary,
  },
  caloriesText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  progressTrack: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  slotsWrap: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  slotCard: {
    backgroundColor: colors.secondarybackground,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    borderColor: colors.secondary,
    overflow: 'hidden',
    ...shadows.sm,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  slotIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondarybackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotIconImage: {
    width: 40,
    height: 40,
  },
  slotHeaderText: {
    flex: 1,
  },
  slotTitle: {
    fontSize: fontSize.lg,
    color: colors.primary,
  },
  slotSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: 2,
  },
  slotBody: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  recommendationCard: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  recommendationTitle: {
    fontSize: fontSize.md,
    color: colors.secondaryForeground,
    marginBottom: 10
  },
  recommendationText: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  loggedMealRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  loggedMealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  loggedMealTime: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  approxCalBadge: {
    backgroundColor: colors.tabBackgroundColor,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  approxCalText: {
    fontSize: fontSize.sm,
    color: colors.primaryBackground,
  },
  loggedMealBody: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingTop: spacing.md,
  },
  loggedMealName: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  loggedMealCalories: {
    fontSize: fontSize.md,
    color: colors.textTertiary,
  },
  addMealBtn: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.full,
  },
});
