import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import React, { useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';
import AppText from '../ui/AppText';

// ─── Types ────────────────────────────────────────────────────────────────────

type FrequencyType = 'Only Once' | 'Daily' | 'Custom';

const FREQUENCIES: FrequencyType[] = ['Only Once', 'Daily', 'Custom'];

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Drum-roll picker helpers ─────────────────────────────────────────────────

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

const ITEM_H = 44;

function DrumPicker({
  items,
  selected,
  onSelect,
  width = 60,
}: {
  items: string[];
  selected: string;
  onSelect: (v: string) => void;
  width?: number;
}) {
  const selIdx  = items.indexOf(selected);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (items[clamped] !== selected) onSelect(items[clamped]);
  };

  return (
    <View style={[drum.wrapper, { width }]}>
      {/* highlight band */}
      <View style={drum.highlight} pointerEvents="none" />
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentOffset={{ x: 0, y: selIdx * ITEM_H }}
        contentContainerStyle={{ paddingVertical: ITEM_H }}
      >
        {items.map(item => {
          const isSelected = item === selected;
          return (
            <Pressable key={item} style={drum.item} onPress={() => onSelect(item)}>
              <AppText
                variant={isSelected ? 'bold' : 'regular'}
                style={[drum.itemText, isSelected ? drum.selectedText : drum.fadedText]}
              >
                {item}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const drum = StyleSheet.create({
  wrapper: {
    height: ITEM_H * 3,
    overflow: 'hidden',
    position: 'relative',
  },
  highlight: {
    position: 'absolute',
    top: ITEM_H,
    left: 0,
    right: 0,
    height: ITEM_H,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    zIndex: 1,
  },
  item: {
    height: ITEM_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemText: { fontSize: fontSize.xl },
  selectedText: { color: colors.primary, fontSize: 26 },
  fadedText: { color: colors.textTertiary },
});

// ─── Date input row ───────────────────────────────────────────────────────────

function DateInputRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View style={di.wrapper}>
      <AppText style={di.label}>{label}</AppText>
      <View style={di.inputRow}>
        <TextInput
          style={di.input}
          placeholder="Select Date"
          placeholderTextColor={colors.textTertiary}
          value={value}
          onChangeText={onChange}
        />
        <FontAwesome name="calendar" size={16} color={colors.textTertiary} style={di.icon} />
      </View>
    </View>
  );
}

const di = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  label: { fontSize: fontSize.md, color: colors.textPrimary, marginBottom: spacing.xs },
  inputRow: { position: 'relative', justifyContent: 'center' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    paddingRight: 44,
  },
  icon: { position: 'absolute', right: spacing.lg },
});

// ─── Main Modal ───────────────────────────────────────────────────────────────

export type ReminderData = {
  id?: string;
  title: string;
  frequency: FrequencyType;
  days: string[];
  startDate: string;
  endDate: string;
  hour: string;
  minute: string;
  period: string;
};

type ReminderModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: ReminderData) => void;
  initialData?: ReminderData | null;
};

export function ReminderModal({ visible, onClose, onSave, initialData }: ReminderModalProps) {
  const insets = useSafeAreaInsets();
  const [title,     setTitle]     = useState('');
  const [frequency, setFrequency] = useState<FrequencyType>('Daily');
  const [days,      setDays]      = useState<string[]>(['Tue', 'Thu', 'Sat']);
  const [startDate, setStartDate] = useState('');
  const [endDate,   setEndDate]   = useState('');
  const [hour,      setHour]      = useState('5');
  const [minute,    setMinute]    = useState('48');
  const [period,    setPeriod]    = useState('PM');

  // Sync state when modal opens
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTitle(initialData.title);
        setFrequency(initialData.frequency);
        setDays(initialData.days);
        setStartDate(initialData.startDate);
        setEndDate(initialData.endDate);
        setHour(initialData.hour);
        setMinute(initialData.minute);
        setPeriod(initialData.period);
      } else {
        // Reset
        setTitle('');
        setFrequency('Daily');
        setDays(['Tue', 'Thu', 'Sat']);
        setStartDate('');
        setEndDate('');
        setHour('5');
        setMinute('48');
        setPeriod('PM');
      }
    }
  }, [visible, initialData]);

  const toggleDay = (day: string) => {
    setDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    onSave({ id: initialData?.id, title, frequency, days, startDate, endDate, hour, minute, period });
    onClose();
  };

  const selectedDaysLabel = days.length
    ? `Selected ${days.join(', ')}`
    : 'No days selected';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={s.overlay} onPress={onClose}>
          <Pressable style={[s.sheet, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            {/* Handle */}
          <View style={s.handle} />

          <AppText variant="semibold" style={s.sheetTitle}>Reminder</AppText>

          {/* Title */}
          <AppText style={s.label}>
            Title <AppText style={s.required}>*</AppText>
          </AppText>
          <TextInput
            style={s.input}
            placeholder="Enter Title"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={setTitle}
          />

          {/* Frequency tabs */}
          <View style={s.freqRow}>
            {FREQUENCIES.map(f => (
              <Pressable
                key={f}
                style={[s.freqChip, frequency === f && s.freqChipActive]}
                onPress={() => setFrequency(f)}
              >
                <AppText style={[s.freqText, frequency === f && s.freqTextActive]}>
                  {f}
                </AppText>
              </Pressable>
            ))}
          </View>

          {/* Custom-only: day selection + dates */}
          {frequency === 'Custom' && (
            <>
              <AppText style={s.selectedDaysLabel}>{selectedDaysLabel}</AppText>
              <View style={s.daysRow}>
                {DAYS_OF_WEEK.map(day => (
                  <Pressable
                    key={day}
                    style={[s.dayChip, days.includes(day) && s.dayChipActive]}
                    onPress={() => toggleDay(day)}
                  >
                    <AppText style={[s.dayText, days.includes(day) && s.dayTextActive]}>
                      {day}
                    </AppText>
                  </Pressable>
                ))}
              </View>
              <DateInputRow label="Start Date" value={startDate} onChange={setStartDate} />
              <DateInputRow label="End Date"   value={endDate}   onChange={setEndDate} />
            </>
          )}

          {/* Time picker */}
          <View style={s.timeCard}>
            <AppText variant="semibold" style={s.timeTitle}>Scheduled Time</AppText>
            <View style={s.pickerRow}>
              <DrumPicker items={HOURS}   selected={hour}   onSelect={setHour}   width={70} />
              <DrumPicker items={MINUTES} selected={minute} onSelect={setMinute} width={70} />
              <DrumPicker items={PERIODS} selected={period} onSelect={setPeriod} width={60} />
            </View>
          </View>

          {/* Actions */}
          <View style={s.actions}>
            <Pressable style={s.cancelBtn} onPress={onClose}>
              <AppText style={s.cancelText}>Cancel</AppText>
            </Pressable>
            <Pressable style={s.saveBtn} onPress={handleSave}>
              <AppText style={s.saveText}>Save</AppText>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
    ...shadows.lg,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  required: { color: colors.error },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  freqRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  freqChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  freqChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  freqText: { fontSize: fontSize.md, color: colors.textSecondary },
  freqTextActive: { color: colors.primaryForeground, fontWeight: '600' },
  selectedDaysLabel: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  daysRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dayChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: { fontSize: fontSize.sm, color: colors.textSecondary },
  dayTextActive: { color: colors.primaryForeground, fontWeight: '600' },
  timeCard: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  timeTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
  },
  actions: { flexDirection: 'row', gap: spacing.md },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  cancelText: { color: colors.primary, fontSize: fontSize.md, fontWeight: '600' },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  saveText: { color: colors.primaryForeground, fontSize: fontSize.md, fontWeight: '600' },
});
