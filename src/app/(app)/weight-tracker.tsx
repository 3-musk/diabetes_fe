import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, BackButton, Button, ScreenContainer } from '../../components';
import { AddWeightModal } from '../../components/features/AddWeightModal';
import { BmiCard } from '../../components/features/BmiCard';
import { WeightGauge } from '../../components/features/WeightGauge';
import DateInput from '../../components/inputs/DateInput';
import { weightTracker as WEIGHTTRACKERCONSTANTS } from '../../constants/weightTracker';
import { getWeightHistory, saveWeightEntry, type WeightEntry, type WeightHistory, type BmiData } from '../../services/trackerService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

// ─── Types ────────────────────────────────────────────────────────────────────

import { TIME_FILTERS } from '../../constants/uiConstants';

type TimeFilter = typeof TIME_FILTERS[number];

const mapFilterToParams = (filter: TimeFilter, customFrom?: Date, customTo?: Date) => {
  const to = filter === 'Custom' && customTo ? new Date(customTo) : new Date();
  const from = filter === 'Custom' && customFrom ? new Date(customFrom) : new Date();
  let range = '';
  switch (filter) {
    case '7 Days':
      from.setDate(from.getDate() - 7);
      range = '7d';
      break;
    case '1 Month':
      from.setMonth(from.getMonth() - 1);
      range = '1m';
      break;
    case '6 Months':
      from.setMonth(from.getMonth() - 6);
      range = '6m';
      break;
    case '1 Year':
      from.setFullYear(from.getFullYear() - 1);
      range = '1y';
      break;
    case 'Custom':
      range = '';
      break;
  }
  const toStr = `${to.getFullYear()}-${String(to.getMonth()+1).padStart(2, '0')}-${String(to.getDate()).padStart(2, '0')}`;
  const fromStr = `${from.getFullYear()}-${String(from.getMonth()+1).padStart(2, '0')}-${String(from.getDate()).padStart(2, '0')}`;
  return { from: fromStr, to: toStr, range };
};

// ─── Main screen ──────────────────────────────────────────────────────────────

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function WeightTracker() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('1 Month');
  const [targetWeight, setTargetWeight] = useState<number | undefined>(undefined);
  const [currentWeight, setCurrentWeight] = useState<number | undefined>(undefined);
  const [bmi, setBmi] = useState<BmiData | undefined>(undefined);
  const [history, setHistory] = useState<WeightEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Custom Date Modal State
  const [showCustomDateModal, setShowCustomDateModal] = useState(false);
  const [customFrom, setCustomFrom] = useState(new Date());
  const [customTo, setCustomTo] = useState(new Date());

  const fetchWeightData = async (forceFilter?: TimeFilter) => {
    setPage(0);
    const filterToUse = forceFilter || activeFilter;
    const { from, to, range } = mapFilterToParams(filterToUse, customFrom, customTo);
    const data: WeightHistory & { hasNext?: boolean } = await getWeightHistory(from, to, range, 0, 5, true);
    setTargetWeight(data.target || undefined);
    setBmi(data.bmi || undefined);
    setHistory(data.history || []);
    setHasNext(data.hasNext ?? false);
    
    if (data.history && data.history.length > 0) {
      setCurrentWeight(data.history[0].weightKg);
    } else {
      setCurrentWeight(undefined);
    }
    setLoading(false);
  };

  const handleLoadMore = async () => {
    if (!hasNext || loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { from, to, range } = mapFilterToParams(activeFilter, customFrom, customTo);
    const data = await getWeightHistory(from, to, range, nextPage, 5, false);
    
    if (data.history && data.history.length > 0) {
      setHistory(prev => [...prev, ...data.history]);
    }
    setHasNext(data.hasNext ?? false);
    setPage(nextPage);
    setLoadingMore(false);
  };

  useEffect(() => {
    if (activeFilter !== 'Custom') {
      fetchWeightData();
    }
  }, [activeFilter]);

  useEffect(() => {
    if (params.openAddModal) {
      setShowModal(true);
    }
  }, [params.openAddModal]);

  const handleSave = async (entry: WeightEntry) => {
    const result = await saveWeightEntry(entry);
    if (result.success) {
      await fetchWeightData();
    }
    return result;
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
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
          {currentWeight ? (
            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
              <WeightGauge current={currentWeight} target={targetWeight ?? 0} />

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
                    <AppText style={s.chipUnit}> {WEIGHTTRACKERCONSTANTS.kgUnit}</AppText>
                  </View>

                  <AppText style={s.chipLabel}>
                    {WEIGHTTRACKERCONSTANTS.currentWeight}
                  </AppText>
                </LinearGradient>

                <View style={s.vsBadge}>
                  <AppText style={s.vsText}>{WEIGHTTRACKERCONSTANTS.vsText}</AppText>
                </View>

                <LinearGradient
                  colors={['#FA7878', '#F6BC5C']}
                  start={{ x: 0, y: 1 }}
                  end={{ x: 1, y: 0 }}
                  style={[s.chip, { marginLeft: 3 }]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                    <AppText variant="bold" style={s.chipValue}>
                      {targetWeight ?? '--'}
                    </AppText>
                    <AppText style={s.chipUnit}> {WEIGHTTRACKERCONSTANTS.kgUnit}</AppText>
                  </View>

                  <AppText style={s.chipLabel}>
                    {WEIGHTTRACKERCONSTANTS.targetWeight}
                  </AppText>
                </LinearGradient>
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
              <AppText variant="medium" style={{ fontSize: 18, color: colors.textSecondary, marginVertical: spacing.xl }}>
                Log your first weight reading.
              </AppText>
            </View>
          )}

          {/* BMI Card */}
          {bmi ? <BmiCard bmi={bmi} /> : null}

          {/* Time filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
            {TIME_FILTERS.map(f => (
              <Pressable
                key={f}
                style={[s.filterChip, activeFilter === f && s.filterChipActive]}
                onPress={() => {
                  if (f === 'Custom') {
                    setShowCustomDateModal(true);
                  } else {
                    setActiveFilter(f);
                  }
                }}
              >
                <AppText style={[s.filterText, activeFilter === f && s.filterTextActive]}>
                  {f}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>

          {/* History Card */}
          <View style={[s.card, { minHeight: SCREEN_HEIGHT * 0.55, maxHeight: SCREEN_HEIGHT }]}>
            <AppText variant="semibold" style={s.sectionTitle}>{WEIGHTTRACKERCONSTANTS.historySectionTitle}</AppText>

            <ScrollView 
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={false} 
              style={{ flex: 1, marginBottom: spacing.lg }}
              onScroll={({ nativeEvent }) => {
                const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
                const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
                if (isCloseToBottom) {
                  handleLoadMore();
                }
              }}
              scrollEventThrottle={400}
            >
              <View style={{ gap: spacing.md }}>
                {history.map(entry => (
                  <View key={entry.id} style={s.historyRow}>
                    <View>
                      <AppText style={s.histDate}>{entry.date}</AppText>
                      <AppText variant="semibold" style={s.histValue}>{entry.weightKg} {WEIGHTTRACKERCONSTANTS.kgUnitLower}</AppText>
                    </View>
                    {entry.onTarget && (
                      <View style={s.targetBadge}>
                        <AppText style={s.targetText}>{WEIGHTTRACKERCONSTANTS.onTargetBadge}</AppText>
                      </View>
                    )}
                  </View>
                ))}
                {loadingMore && (
                  <View style={{ paddingVertical: spacing.md }}>
                    <ActivityIndicator size="small" color={colors.primary} />
                  </View>
                )}
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
        onClose={() => {
          setShowModal(false);
          router.setParams({ openAddModal: '' });
        }}
        onSave={handleSave}
      />
      
      {/* Custom Date Selection Modal */}
      <Modal visible={showCustomDateModal} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <AppText variant="semibold" style={s.modalTitle}>Select Custom Range</AppText>
            
            <DateInput
              label="From Date"
              value={customFrom}
              onChange={setCustomFrom}
              containerStyle={{ marginBottom: spacing.md }}
              dateFormat="yy/mm/dd"
            />
            
            <DateInput
              label="To Date"
              value={customTo}
              onChange={setCustomTo}
              containerStyle={{ marginBottom: spacing.lg }}
              dateFormat="yy/mm/dd"
            />
            
            <View style={s.modalActions}>
              <Button
                title="Cancel"
                onPress={() => setShowCustomDateModal(false)}
                style={{ flex: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}
                textStyle={{ color: colors.textPrimary }}
              />
              <Button
                title="Go"
                style={{ flex: 1 }}
                onPress={() => {
                  setShowCustomDateModal(false);
                  setActiveFilter('Custom');
                  fetchWeightData('Custom');
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: spacing.xl,
    ...shadows.md,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
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
