import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { AppText, BackButton, Button, DateInput } from '../../components';
import { weightTracker as WEIGHTTRACKERCONSTANTS } from '../../constants/weightTracker';
import { getWeightHistory, saveWeightEntry, type WeightEntry } from '../../services/trackerService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeFilter = '7 Days' | '1 Month' | '6 Months' | '1 Year' | 'Custom';

// ─── Config ───────────────────────────────────────────────────────────────────

const TIME_FILTERS: TimeFilter[] = ['7 Days', '1 Month', '6 Months', '1 Year', 'Custom'];

// ─── Weight arc gauge ─────────────────────────────────────────────────────────

function WeightGauge({ current, target }: { current: number; target: number }) {
  const size   = 200;
  const cx     = size / 2;
  const cy     = size / 2;
  const r      = 78;
  const gap    = target > 0 ? Math.abs(current - target) : 0;

  // Arc from 210° to 330° (bottom-open semicircle)
  const toRad  = (deg: number) => (deg * Math.PI) / 180;
  const arc = (deg: number) => ({
    x: cx + r * Math.cos(toRad(deg)),
    y: cy + r * Math.sin(toRad(deg)),
  });

  const startDeg = 210;
  const endDeg   = 330;
  const start    = arc(startDeg);
  const end      = arc(endDeg);

  // Progress dot — position based on (current - target) / range
  const range    = 10; // kg range
  const ratio    = Math.min(1, Math.max(0, (current - target) / range));
  const dotDeg   = startDeg + ratio * (endDeg - startDeg);
  const dot      = arc(dotDeg);

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <Path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 1 1 ${end.x} ${end.y}`}
          stroke={colors.border}
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />
        {/* Progress */}
        <Path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 ${ratio > 0.5 ? 1 : 0} 1 ${dot.x} ${dot.y}`}
          stroke={colors.primary}
          strokeWidth={14}
          fill="none"
          strokeLinecap="round"
        />
        {/* Dot */}
        <Circle cx={dot.x} cy={dot.y} r={10} fill={colors.secondary} stroke={colors.primary} strokeWidth={3} />
      </Svg>
      <View style={gaugeS.center}>
        <AppText style={gaugeS.arrowIcon}>↓</AppText>
        <AppText variant="bold" style={gaugeS.gapText}>{gap.toFixed(1)} KG</AppText>
        <AppText style={gaugeS.goalText}>{WEIGHTTRACKERCONSTANTS.toReachGoal}</AppText>
      </View>
    </View>
  );
}

const gaugeS = StyleSheet.create({
  center: { alignItems: 'center', marginTop: -48 },
  arrowIcon: { fontSize: fontSize.xl, color: colors.primary },
  gapText: { fontSize: 32, color: colors.textPrimary, lineHeight: 38 },
  goalText: { fontSize: fontSize.md, color: colors.textTertiary },
});

// ─── BMI bar ──────────────────────────────────────────────────────────────────

function BmiBar({ bmi }: { bmi: number }) {
  // Scale: 18.5 underweight, 25 normal, 30 overweight, 40 obese
  const segments = [
    { color: '#64B5F6', label: '18.5', pct: 0.18 },
    { color: '#4CAF50', label: '25.0', pct: 0.30 },
    { color: '#FFC107', label: '30.0', pct: 0.27 },
    { color: '#F44336', label: '40.0', pct: 0.25 },
  ];
  const clampedBmi = Math.min(40, Math.max(18.5, bmi));
  const dotPct = (clampedBmi - 18.5) / (40 - 18.5);

  return (
    <View>
      <View style={bmiS.row}>
        {segments.map((seg, i) => (
          <View key={i} style={[bmiS.seg, { flex: seg.pct, backgroundColor: seg.color }]} />
        ))}
        {/* Dot */}
        <View style={[bmiS.dot, { left: `${dotPct * 100}%` as any }]} />
      </View>
      <View style={bmiS.labels}>
        {segments.map((seg, i) => (
          <AppText key={i} style={bmiS.segLabel}>{seg.label}</AppText>
        ))}
      </View>
    </View>
  );
}

const bmiS = StyleSheet.create({
  row: { height: 10, borderRadius: 5, flexDirection: 'row', overflow: 'visible', position: 'relative' },
  seg: { height: 10 },
  dot: { position: 'absolute', top: -4, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.primary, marginLeft: -9 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  segLabel: { fontSize: 9, color: colors.textTertiary },
});

// ─── Add Weight Modal ─────────────────────────────────────────────────────────

interface AddWeightModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: WeightEntry) => void;
}

function AddWeightModal({ visible, onClose, onSave }: AddWeightModalProps) {
  const insets = useSafeAreaInsets();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [date, setDate]     = useState<Date | undefined>(undefined);

  const handleSave = () => {
    const w = parseFloat(weight);
    if (!w || !date) return;
    
    const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    
    onSave({ id: Date.now().toString(), date: formattedDate, weightKg: w, onTarget: w <= 76 });
    setWeight(''); setHeight(''); setDate(undefined);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={modal.overlay}>
          <View style={[modal.card, { marginTop: insets.top + 60, paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            <Pressable style={modal.closeBtnOuter} onPress={onClose}>
              <View style={modal.closeBtn}>
                <FontAwesome name="times" size={16} color={colors.textPrimary} />
              </View>
            </Pressable>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={modal.scrollContent}>
              <AppText variant="semibold" style={modal.sheetTitle}>Add Weight</AppText>

              <AppText style={modal.label} variant="medium">{WEIGHTTRACKERCONSTANTS.weightLabel} <AppText variant="medium" style={modal.required}>*</AppText></AppText>
              <TextInput
                style={modal.input}
                placeholder={WEIGHTTRACKERCONSTANTS.weightPlaceholder}
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                value={weight}
                onChangeText={setWeight}
              />

              <AppText style={modal.label} variant="medium">{WEIGHTTRACKERCONSTANTS.heightLabel} <AppText variant="medium" style={modal.required}>*</AppText></AppText>
              <TextInput
                style={modal.input}
                placeholder={WEIGHTTRACKERCONSTANTS.heightPlaceholder}
                placeholderTextColor={colors.textTertiary}
                keyboardType="decimal-pad"
                value={height}
                onChangeText={setHeight}
              />

              <AppText style={modal.label} variant="medium">{WEIGHTTRACKERCONSTANTS.dateLabel} <AppText variant="medium" style={modal.required}>*</AppText></AppText>
              <DateInput
                value={date}
                onChange={setDate}
                dateFormat="yy/mm/dd"
                containerStyle={{ marginBottom: spacing.lg }}
              />

              <View style={modal.actions}>
                <Button variant="outline" style={modal.cancelBtn} title={WEIGHTTRACKERCONSTANTS.cancelBtn} onPress={onClose} />
                <Button variant="primary" style={modal.saveBtn} title={WEIGHTTRACKERCONSTANTS.saveBtn} onPress={handleSave} />
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.lg,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    ...shadows.lg,
  },
  closeBtnOuter: {
    alignSelf: 'center',
    marginTop: -48,
    marginBottom: 16,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.xs,
  },
  sheetTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.xxxl,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  required: { color: '#FF3B30' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    backgroundColor: '#FFF',
    marginBottom: spacing.lg,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  calIcon: { marginLeft: -36, paddingRight: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl },
  cancelBtn: {
    flex: 1, borderWidth: 1, borderColor: colors.primary,
    borderRadius: borderRadius.full, alignItems: 'center', paddingVertical: spacing.md,
  },
  cancelText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '600' },
  saveBtn: {
    flex: 1, backgroundColor: colors.primary,
    borderRadius: borderRadius.full, alignItems: 'center', paddingVertical: spacing.md,
  },
  saveText: { color: colors.primaryForeground, fontSize: fontSize.md, fontWeight: '600' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

const CURRENT_WEIGHT = 75.5;
const TARGET_WEIGHT  = 70;
const BMI            = 20.7;

export default function WeightTracker() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<TimeFilter>('1 Month');
  const [history, setHistory]           = useState<WeightEntry[]>([]);
  const [showModal, setShowModal]       = useState(false);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    (async () => {
      const data = await getWeightHistory();
      setHistory(data);
      setLoading(false);
    })();
  }, []);

  const handleSave = async (entry: WeightEntry) => {
    await saveWeightEntry(entry);
    setHistory(prev => [entry, ...prev]);
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
      <View style={[s.scroll, { flex: 1, paddingBottom: spacing.lg }]}>
        {/* Gauge */}
        <View style={s.gaugeCard}>
          <WeightGauge current={CURRENT_WEIGHT} target={TARGET_WEIGHT} />

          {/* Current / Target chips */}
          <View style={s.chipRow}>
            <View style={[s.chip, s.chipCurrent]}>
              <AppText variant="bold" style={s.chipValue}>{CURRENT_WEIGHT} KG</AppText>
              <AppText style={s.chipLabel}>{WEIGHTTRACKERCONSTANTS.currentWeight}</AppText>
            </View>
            <View style={[s.chip, s.chipTarget]}>
              <AppText variant="bold" style={s.chipValue}>{TARGET_WEIGHT} KG</AppText>
              <AppText style={s.chipLabel}>{WEIGHTTRACKERCONSTANTS.targetWeight}</AppText>
            </View>
          </View>

          {/* BMI */}
          <View style={s.bmiBlock}>
            <View style={s.bmiHeader}>
              <AppText variant="semibold" style={s.bmiTitle}>{WEIGHTTRACKERCONSTANTS.bmiTitle}</AppText>
              <AppText style={s.bmiSub}>{BMI}{WEIGHTTRACKERCONSTANTS.normalWeight}</AppText>
            </View>
            <BmiBar bmi={BMI} />
          </View>
        </View>

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
        <View style={s.card}>
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
      </View>
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
  gaugeCard: {
    backgroundColor: colors.surface, borderRadius: borderRadius.xl,
    padding: spacing.lg, marginBottom: spacing.lg, ...shadows.sm,
    borderWidth: 1, borderColor: '#F5DAAA',
  },
  chipRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  chip: {
    flex: 1, borderRadius: borderRadius.xl, padding: spacing.md, alignItems: 'center',
  },
  chipCurrent: { backgroundColor: colors.primary },
  chipTarget:  { backgroundColor: '#E91E8C' },
  chipValue: { fontSize: fontSize.xl, color: colors.primaryForeground },
  chipLabel: { fontSize: fontSize.sm, color: colors.primaryForeground, opacity: 0.85, marginTop: 2 },
  bmiBlock: { marginTop: spacing.lg },
  bmiHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  bmiTitle: { fontSize: fontSize.md, color: colors.textPrimary },
  bmiSub: { fontSize: fontSize.sm, color: colors.textTertiary },
  filterScroll: { marginBottom: spacing.lg },
  filterChip: {
    paddingHorizontal: spacing.lg, paddingVertical: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1, borderColor: colors.border,
    marginRight: spacing.sm, backgroundColor: colors.surface,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { fontSize: fontSize.sm, color: colors.textSecondary },
  filterTextActive: { color: colors.primaryForeground, fontWeight: '600' },
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
  sectionTitle: { fontSize: fontSize.lg, color: colors.textPrimary, marginBottom: spacing.md },
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
});
