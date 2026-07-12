import { SvgIcon } from '@/utils/icon';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddActivityModal, AppText, BackButton, Button, DateStrip, NewActivityData, RoundCheckBox, ScreenContainer } from '../../components';
import { activityTrackerTexts } from '../../constants/activityTracker';
import { Activity, addActivity, fetchActivities, saveCompletedActivities } from '../../services/activityService';
import { borderRadius, colors, fontSize, spacing } from '../../theme';

const ACTIVITY_SVG_MAP: Record<string, any> = {
  'Running': require('../../../assets/svgs/running.svg'),
  'Yoga': require('../../../assets/svgs/yoga.svg'),
  'Strength Training': require('../../../assets/svgs/strength_training.svg'),
  'Evening Walk': require('../../../assets/svgs/walking.svg'),
  'Walking': require('../../../assets/svgs/walking.svg'),
};

const FALLBACK_SVG = require('../../../assets/svgs/activity.svg');

export default function ActivityTracker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedActivityIds, setSelectedActivityIds] = useState<Set<string>>(new Set());
  
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadActivities(selectedDate);
    }, [selectedDate])
  );

  const loadActivities = async (date: Date, isLoadMore = false) => {
    if (!isLoadMore) {
      setLoading(true);
      setPage(0);
      setSelectedActivityIds(new Set());
    } else {
      if (!hasNext || loadingMore) return;
      setLoadingMore(true);
    }

    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const pageToFetch = isLoadMore ? page + 1 : 0;
    
    const response = await fetchActivities(dateKey, dateKey, pageToFetch, 10);
    
    if (isLoadMore) {
      setActivities(prev => [...prev, ...response.activities]);
    } else {
      setActivities(response.activities);
    }
    
    setHasNext(response.hasNext);
    setPage(pageToFetch);
    setLoading(false);
    setLoadingMore(false);
  };

  const handleSaveActivity = async () => {
    if (selectedActivityIds.size === 0) return;
    setSubmitting(true);
    await saveCompletedActivities(Array.from(selectedActivityIds));
    setSubmitting(false);
    router.back();
  };

  const handleAddCustomActivity = async (data: NewActivityData) => {
    setModalVisible(false);
    setLoading(true);
    const dateKey = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    const response = await addActivity({ ...data, date: dateKey });
    if (response.success && response.data) {
      const newActivity = response.data as Activity;
      setActivities(prev => [...prev, newActivity]);
      // If it's not completed on backend, we could auto-select it, but custom activities are usually pre-completed.
      if (!newActivity.completed) {
        setSelectedActivityIds(prev => new Set(prev).add(newActivity.id));
      }
    }
    setLoading(false);
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton color={colors.primaryBackground} />
        <AppText variant="medium" style={styles.headerTitle}>{activityTrackerTexts.pageTitle}</AppText>
      </View>

      <View style={[styles.scroll, { flex: 1, paddingBottom: spacing.lg }]}>
        <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <View style={styles.card}>
          <AppText variant="medium" style={styles.cardTitle}>{activityTrackerTexts.workoutType}</AppText>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
          ) : (
            <ScrollView 
              showsVerticalScrollIndicator={false} 
              style={{ flex: 1, marginBottom: spacing.lg }}
              onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
                if (isCloseToBottom) {
                  loadActivities(selectedDate, true);
                }
              }}
              scrollEventThrottle={400}
            >
              <View style={styles.activitiesList}>
                {activities.map(activity => {
                  const isSelected = !!activity.completed || selectedActivityIds.has(activity.id);
                  return (
                    <Pressable
                      key={activity.id}
                      style={styles.activityRow}
                      onPress={() => {
                        if (activity.completed) return; // cannot unselect already completed
                        setSelectedActivityIds(prev => {
                          const newSet = new Set(prev);
                          if (newSet.has(activity.id)) {
                            newSet.delete(activity.id);
                          } else {
                            newSet.add(activity.id);
                          }
                          return newSet;
                        });
                      }}
                    >
                      <View style={styles.activityIconWrapper}>
                        <SvgIcon 
                          source={ACTIVITY_SVG_MAP[activity.name] || FALLBACK_SVG} 
                          size={40}
                        />
                      </View>
                      <View style={styles.activityDetails}>
                        <AppText style={styles.durationText}>{activity.durationMins} {activityTrackerTexts.minsUnit}</AppText>
                        <AppText style={styles.activityName}>{activity.name}</AppText>
                      </View>
                      <RoundCheckBox selected={isSelected} disabled={activity.completed} />
                    </Pressable>
                  );
                })}
                {loadingMore && (
                  <View style={{ paddingVertical: spacing.md }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                )}
              </View>
            </ScrollView>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Pressable style={styles.addBtn} onPress={() => setModalVisible(true)}>
              <AppText 
                variant='semibold'
                style={styles.addBtnText}
              >
                {activityTrackerTexts.addActivity}
              </AppText>
            </Pressable>
            
            <Button
              title={activityTrackerTexts.save}
              onPress={handleSaveActivity}
              loading={submitting}
              disabled={selectedActivityIds.size === 0}
              style={styles.saveBtn}
            />
          </View>
        </View>
      </View>

      <AddActivityModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleAddCustomActivity}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9F6EF', // Matching the background from the mockup
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: spacing.xl,
    marginTop: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F5DAAA',
  },
  cardTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xl,
  },
  activitiesList: {
    gap: spacing.md,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F6EF',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
  },
  activityIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2DFB8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  activityDetails: {
    flex: 1,
  },
  durationText: {
    fontSize: 12,
    color: colors.textTertiary,
    marginBottom: 2,
  },
  activityName: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 'auto',
  },
  addBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  addBtnText: {
    color: colors.primary,
    fontSize: fontSize.md,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.md,
  },
});
