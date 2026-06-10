import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, BackButton, Button } from '../../components';
import { AddWeightModal } from '../../components/features/AddWeightModal';
import { BmiCard } from '../../components/features/BmiCard';
import { WeightGauge } from '../../components/features/WeightGauge';
import { weightTracker as WEIGHTTRACKERCONSTANTS } from '../../constants/weightTracker';
import { getWeightHistory, saveWeightEntry, type WeightEntry, type WeightHistory } from '../../services/trackerService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeFilter = '7 Days' | '1 Month' | '6 Months' | '1 Year' | 'Custom';

// ─── Config ───────────────────────────────────────────────────────────────────

const TIME_FILTERS: TimeFilter[] = ['7 Days', '1 Month', '6 Months', '1 Year', 'Custom'];

// ─── Main screen ──────────────────────────────────────────────────────────────

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WeightTracker() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('1 Month');
  const [targetWeight, setTargetWeight] = useState(70);
  const [currentWeight, setCurrentWeight] = useState(75.5);
  const [bmi, setBmi] = useState(20.7);
  const [history, setHistory] = useState<WeightEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data: WeightHistory = await getWeightHistory();
      setTargetWeight(data.target);
      setBmi(data.bmi);
      setHistory(data.history);
      if (data.history.length > 0) {
        setCurrentWeight(data.history[0].weightKg);
      }
      setLoading(false);
    })();
  }, []);

  const handleSave = async (entry: WeightEntry) => {
    await saveWeightEntry(entry);
    setHistory(prev => [entry, ...prev]);
    setCurrentWeight(entry.weightKg);
  };

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <BackButton color={colors.primaryBackground} />
        <AppText variant="semibold" style={s.headerTitle}>{WEIGHTTRACKERCONSTANTS.pageTitle}</AppText>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 40, flexGrow: 1 }]}
        >
          {/* Gauge Section without wrapper card */}
          <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
            <WeightGauge current={currentWeight} target={targetWeight} />

            {/* Current / Target chips */}
            <View style={s.chipRow}>
              <LinearGradient
                colors={['#F5BC1E', '#F7D57C']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={[s.chip, { marginRight: 3 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <AppText variant="bold" style={s.chipValue}>
                    {currentWeight}
                  </AppText>
                  <AppText style={s.chipUnit}> KG</AppText>
                </View>

                <AppText style={s.chipLabel}>
                  Current Weight
                </AppText>
              </LinearGradient>

              <View style={s.vsBadge}>
                <AppText style={s.vsText}>VS</AppText>
              </View>

              <LinearGradient
                colors={['#FA7878', '#F6BC5C']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={[s.chip, { marginLeft: 3 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                  <AppText variant="bold" style={s.chipValue}>
                    {targetWeight}
                  </AppText>
                  <AppText style={s.chipUnit}> KG</AppText>
                </View>

                <AppText style={s.chipLabel}>
                  Target Weight
                </AppText>
              </LinearGradient>
            </View>
          </View>

          {/* BMI Card */}
          <BmiCard bmi={bmi} />

          {/* Time filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
            {TIME_FILTERS.map(f => (
              <Pressable
                key={f}
                style={[s.filterChip, activeFilter === f && s.filterChipActive]}
                onPress={() => setActiveFilter(f)}
              >
                <AppText style={[s.filterText, activeFilter === f && s.filterTextActive]}>
                  {f}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>

          {/* History Card */}
          <View style={[s.card, { minHeight: SCREEN_HEIGHT * 0.55 }]}>
            <AppText variant="semibold" style={s.sectionTitle}>{WEIGHTTRACKERCONSTANTS.historySectionTitle}</AppText>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginBottom: spacing.lg }}>
              <View style={{ gap: spacing.md }}>
                {history.map(entry => (
                  <View key={entry.id} style={s.historyRow}>
                    <View>
                      <AppText style={s.histDate}>{entry.date}</AppText>
                      <AppText variant="semibold" style={s.histValue}>{entry.weightKg} Kg</AppText>
                    </View>
                    {entry.onTarget && (
                      <View style={s.targetBadge}>
                        <AppText style={s.targetText}>{WEIGHTTRACKERCONSTANTS.onTargetBadge}</AppText>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>

            <View style={s.actionButtons}>
              <Button
                title={WEIGHTTRACKERCONSTANTS.addBtn}
                onPress={() => setShowModal(true)}
                size="lg"
                style={s.addBtn}
              />
            </View>
          </View>
        </ScrollView>
      )}

      <AddWeightModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: fontSize.xl, color: colors.textPrimary },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
    position: 'relative',
  },
  chip: {
    flex: 1,
    maxWidth: 170,
    height: 108,
    borderRadius: 24,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  vsBadge: {
    position: 'absolute',
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F7F2EA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  vsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B625A',
  },
  chipValue: {
    fontSize: 24,
    color: '#3A2618',
  },
  chipUnit: {
    fontSize: 12,
    color: '#3A2618',
  },
  chipLabel: {
    marginTop: 6,
    fontSize: 16,
    color: '#3A2618',
  },
  bmiCard: {
    backgroundColor: '#FFF', borderRadius: 24,
    padding: spacing.xl, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: '#F5DAAA',
    ...shadows.sm,
  },
  bmiHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md, alignItems: 'center' },
  bmiTitle: { fontSize: fontSize.xl, color: colors.textPrimary },
  bmiSub: { fontSize: fontSize.sm, color: colors.textSecondary },
  filterScroll: { marginBottom: spacing.lg, maxHeight: 40 },
  filterChip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
    marginRight: spacing.sm, backgroundColor: colors.surface,
  },
  filterChipActive: { color: colors.primaryBackground, backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: fontSize.sm, color: colors.textSecondary },
  filterTextActive: { color: colors.primaryBackground, fontWeight: '600' },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F5DAAA',
  },
  sectionTitle: { fontSize: fontSize.lg, color: colors.textPrimary, marginVertical: spacing.xl },
  historyRow: {
    backgroundColor: '#F9F6EF', borderRadius: borderRadius.lg,
    padding: spacing.lg, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center',
  },
  histDate: { fontSize: fontSize.sm, color: colors.textTertiary, marginBottom: 4 },
  histValue: { fontSize: fontSize.xxl, color: colors.textPrimary },
  targetBadge: {
    backgroundColor: colors.successLight, borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md, paddingVertical: spacing.xs,
  },
  targetText: { fontSize: fontSize.sm, color: colors.success, fontWeight: '600' },
  actionButtons: {
    marginTop: 'auto',
  },
  addBtn: { width: '100%', borderRadius: borderRadius.full },
  bmiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 24,
  },
  bmiTypeCard: {
    width: '48%',
    backgroundColor: '#F5F2EA',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
