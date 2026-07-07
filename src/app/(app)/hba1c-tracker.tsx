import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppModal, AppText, BackButton, Button, DateInput, Input, ScreenContainer } from '../../components';
import { hba1cTracker as HBA1CTRACKERCONSTANTS, STATUS_CONFIG } from '../../constants/hba1cTracker';
import { getHba1cHistory, saveHba1cEntry, type HbA1cEntry, type HbA1cStatus } from '../../services/trackerService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusPill({ status }: { status: HbA1cStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[pill.wrap, { backgroundColor: cfg.bg }]}>
      <AppText style={[pill.text, { color: cfg.text }]}>{status}</AppText>
    </View>
  );
}

const pill = StyleSheet.create({
  wrap: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
  },
  text: { fontSize: fontSize.sm, fontWeight: '600' },
});

// ─── Add HbA1c Modal ─────────────────────────────────────────────────────────

interface AddHba1cModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: HbA1cEntry) => Promise<{ success: boolean; message?: string }>;
}

function AddHba1cModal({ visible, onClose, onSave }: AddHba1cModalProps) {
  const insets = useSafeAreaInsets();
  const [value, setValue] = useState('');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    const num = parseFloat(value);
    if (!num || !date) return;
    
    setIsSaving(true);
    const status: HbA1cStatus =
      num < 5.7 ? HBA1CTRACKERCONSTANTS.normalStatus as HbA1cStatus : num < 6.5 ? HBA1CTRACKERCONSTANTS.prediabetesStatus as HbA1cStatus : HBA1CTRACKERCONSTANTS.diabetesStatus as HbA1cStatus;
    
    const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    
    const res = await onSave({ id: Date.now().toString(), date: formattedDate, value: num, status });
    setIsSaving(false);
    
    if (res && res.success) {
      setValue('');
      setDate(undefined);
      onClose();
    } else {
      Alert.alert('Invalid Entry', res?.message || 'Failed to save HbA1c reading. Please try again.');
    }
  };

  return (
    <AppModal visible={visible} onClose={onClose}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[modal.scrollContent, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
        <AppText variant="semibold" style={modal.sheetTitle}>Add HbA1c</AppText>

        <Input
          label={HBA1CTRACKERCONSTANTS.valueLabel}
          required
          placeholder={HBA1CTRACKERCONSTANTS.placeholder}
          keyboardType="decimal-pad"
          value={value}
          onChangeText={setValue}
        />

        <DateInput
          label={HBA1CTRACKERCONSTANTS.dateLabel}
          required
          value={date}
          onChange={setDate}
          dateFormat="yy/mm/dd"
          placeholder={HBA1CTRACKERCONSTANTS.placeholder}
        />

        <View style={modal.actions}>
          <Button variant="outline" style={modal.cancelBtn} title={HBA1CTRACKERCONSTANTS.cancelBtn} onPress={onClose} />
          <Button variant="primary" style={modal.saveBtn} title={HBA1CTRACKERCONSTANTS.saveBtn} onPress={handleSave} />
        </View>
      </ScrollView>
    </AppModal>
  );
}

const modal = StyleSheet.create({
  scrollContent: {
    padding: spacing.xl,
    paddingTop: spacing.xxxxl,
  },
  sheetTitle: {
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: spacing.xxxl,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  cancelBtn: {
    flex: 1,
  },
  saveBtn: {
    flex: 1,
  },
});

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function Hba1cTracker() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const params  = useLocalSearchParams();
  const [history, setHistory] = useState<HbA1cEntry[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHba1cData = async () => {
    const data = await getHba1cHistory();
    setHistory(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchHba1cData();
  }, []);
  
  useEffect(() => {
    if (params.openAddModal) {
      setShowModal(true);
    }
  }, [params]);

  const latest  = history[0];
  const avgNum = history.length
    ? (history.reduce((s, e) => s + e.value, 0) / history.length)
    : 0;
  const averageStr = history.length ? avgNum.toFixed(1) : '--';
  const averageStatus: HbA1cStatus | null = history.length
    ? (avgNum < 5.7 ? HBA1CTRACKERCONSTANTS.normalStatus as HbA1cStatus : avgNum < 6.5 ? HBA1CTRACKERCONSTANTS.prediabetesStatus as HbA1cStatus : HBA1CTRACKERCONSTANTS.diabetesStatus as HbA1cStatus)
    : null;

  const handleSave = async (entry: HbA1cEntry) => {
    const result = await saveHba1cEntry(entry);
    if (result.success) {
      await fetchHba1cData();
    }
    return result;
  };

  return (
    <ScreenContainer edges={['top', 'bottom']}>
      {/* Header */}
      <View style={s.header}>
        <BackButton color={colors.primaryBackground} />
        <AppText variant="semibold" style={s.headerTitle}>{HBA1CTRACKERCONSTANTS.pageTitle}</AppText>
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
        {/* Summary cards */}
        <View style={s.summaryRow}>
          <View style={s.summaryCard}>
            <AppText variant="bold" style={s.summaryValue}>
              {latest ? `${latest.value}%` : '--'}
            </AppText>
            {latest && <StatusPill status={latest.status} />}
            <AppText style={s.summaryLabel}>{HBA1CTRACKERCONSTANTS.latestLabel}</AppText>
          </View>
          <View style={s.summaryCard}>
            <AppText variant="bold" style={s.summaryValue}>{averageStr}%</AppText>
            {averageStatus && <StatusPill status={averageStatus} />}
            <AppText style={s.summaryLabel}>{HBA1CTRACKERCONSTANTS.averageLabel}</AppText>
          </View>
        </View>

        {/* History Card */}
        <View style={[s.card, { minHeight: SCREEN_HEIGHT * 0.55 }]}>
          <AppText variant="semibold" style={s.sectionTitle}>{HBA1CTRACKERCONSTANTS.historySectionTitle}</AppText>
          
          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, marginBottom: spacing.lg }}>
            <View style={{ gap: spacing.md }}>
              {history.map(entry => (
                <View key={entry.id} style={s.historyRow}>
                  <View>
                    <AppText style={s.historyDate}>{entry.date}</AppText>
                    <AppText variant="semibold" style={s.historyValue}>{entry.value}%</AppText>
                  </View>
                  <StatusPill status={entry.status} />
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={s.actionButtons}>
            <Button
              title={HBA1CTRACKERCONSTANTS.addBtn}
              onPress={() => setShowModal(true)}
              size="lg"
              style={s.addBtn}
            />
          </View>
        </View>
      </ScrollView>
      )}

      <AddHba1cModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          router.setParams({ openAddModal: '' });
        }}
        onSave={handleSave}
      />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerTitle: { fontSize: fontSize.xl, color: colors.textPrimary },
  scroll: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  summaryRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xl },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#F5DAAA',
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.sm,
  },
  summaryValue: { fontSize: fontSize.xxl, color: colors.textPrimary },
  summaryLabel: { fontSize: fontSize.sm, color: colors.textTertiary, marginTop: spacing.xs },
  sectionTitle: { fontSize: fontSize.lg, color: colors.textPrimary, marginBottom: spacing.md },
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
  historyRow: {
    backgroundColor: '#F9F6EF',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: { fontSize: fontSize.sm, color: colors.textTertiary, marginBottom: 4 },
  historyValue: { fontSize: fontSize.xxl, color: colors.textPrimary },
  actionButtons: {
    marginTop: 'auto',
  },
  addBtn: { width: '100%', borderRadius: borderRadius.full },
});
