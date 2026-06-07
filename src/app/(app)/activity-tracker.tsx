import { SvgIcon } from '@/utils/icon';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AddActivityModal, AppText, BackButton, Button, DateStrip, NewActivityData, RoundCheckBox } from '../../components';
import { Activity, addActivity, fetchActivities } from '../../services/activityService';
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
  
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadActivities(selectedDate);
  }, [selectedDate]);

  const loadActivities = async (date: Date) => {
    setLoading(true);
    // Use ISO string date prefix (YYYY-MM-DD) as the key for API simulation
    const dateKey = date.toISOString().split('T')[0];
    const data = await fetchActivities(dateKey);
    setActivities(data);
    setLoading(false);
  };

  const handleSaveActivity = async () => {
    if (!selectedActivityId) return;
    setSubmitting(true);
    // Simulate saving the selected activity reading to backend
    await new Promise(resolve => setTimeout(resolve, 800));
    setSubmitting(false);
    router.back();
  };

  const handleAddCustomActivity = async (data: NewActivityData) => {
    setModalVisible(false);
    setLoading(true);
    const dateKey = selectedDate.toISOString().split('T')[0];
    const response = await addActivity({ ...data, date: dateKey });
    if (response.success) {
      setActivities(prev => [...prev, response.data]);
      setSelectedActivityId(response.data.id);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton color={colors.primaryBackground} />
        <AppText variant="semibold" style={styles.headerTitle}>Activity</AppText>
      </View>

      <View style={[styles.scroll, { flex: 1, paddingBottom: spacing.lg }]}>
        <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <View style={styles.card}>
          <AppText variant="semibold" style={styles.cardTitle}>Workout Type</AppText>

          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginVertical: 40 }} />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginBottom: spacing.lg }}>
              <View style={styles.activitiesList}>
                {activities.map(activity => {
                  const isSelected = selectedActivityId === activity.id;
                  return (
                    <Pressable
                      key={activity.id}
                      style={styles.activityRow}
                      onPress={() => setSelectedActivityId(activity.id)}
                    >
                      <View style={styles.activityIconWrapper}>
                        <SvgIcon 
                          source={ACTIVITY_SVG_MAP[activity.name] || FALLBACK_SVG} 
                          size={40}
                        />
                      </View>
                      <View style={styles.activityDetails}>
                        <AppText style={styles.durationText}>{activity.durationMins} Mins</AppText>
                        <AppText style={styles.activityName}>{activity.name}</AppText>
                      </View>
                      <RoundCheckBox selected={isSelected} />
                    </Pressable>
                  );
                })}
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
                Add Activity
              </AppText>
            </Pressable>
            
            <Button
              title="Save"
              onPress={handleSaveActivity}
              loading={submitting}
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
    </SafeAreaView>
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
