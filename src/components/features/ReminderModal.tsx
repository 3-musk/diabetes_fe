import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, colors, fontSize, spacing } from '../../theme';
import DateInput from '../inputs/DateInput';
import { AppModal } from '../ui/AppModal';
import AppText from '../ui/AppText';
import { Button } from '../ui/Button';

// ─── Types ────────────────────────────────────────────────────────────────────

import { DAYS_OF_WEEK, FREQUENCIES, PERIODS } from '../../constants/uiConstants';
import { reminders } from '../../constants/reminders';

type FrequencyType = typeof FREQUENCIES[number];

const parseDate = (value: string): Date | undefined => {
  if (!value) return undefined;

  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
};

const formatDateValue = (date?: Date): string =>
  date
    ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    : '';

// ─── Drum-roll picker helpers ─────────────────────────────────────────────────

const HOURS   = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const ITEM_H = 44;

function DrumPicker({
  items,
  selected,
  onSelect,
  onScrollingChange,
  width = 60,
}: {
  items: readonly string[];
  selected: string;
  onSelect: (v: string) => void;
  onScrollingChange?: (scrolling: boolean) => void;
  width?: number;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const isScrolling = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!isScrolling.current) {
      const idx = items.indexOf(selected);
      if (idx >= 0) {
        scrollRef.current?.scrollTo({ y: idx * ITEM_H, animated: mounted.current });
      }
    }
    mounted.current = true;
  }, [selected, items]);

  const handleScroll = (e: any) => {
    if (!isScrolling.current) return;
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (items[clamped] !== selected) {
      onSelect(items[clamped]);
    }
  };

  const handleMomentumScrollEnd = (e: any) => {
    isScrolling.current = false;
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    if (items[clamped] !== selected) {
      onSelect(items[clamped]);
    }
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
        onScrollBeginDrag={() => {
          isScrolling.current = true;
          onScrollingChange?.(true);
        }}
        onMomentumScrollEnd={(e) => {
          handleMomentumScrollEnd(e);
          onScrollingChange?.(false);
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingVertical: ITEM_H }}
      >
        {items.map(item => {
          const isSelected = item === selected;
          return (
            <Pressable key={item} style={drum.item} onPress={() => {
              isScrolling.current = false;
              onSelect(item);
            }}>
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
  const [days,      setDays]      = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate,   setEndDate]   = useState<Date | undefined>(undefined);
  const [hour,      setHour]      = useState('12');
  const [minute,    setMinute]    = useState('00');
  const [period,    setPeriod]    = useState('AM');
  const [pickerScrolling, setPickerScrolling] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (visible) {
      if (initialData) {
        setTitle(initialData.title);
        setFrequency(initialData.frequency);
        setDays(initialData.days);
        setStartDate(parseDate(initialData.startDate));
        setEndDate(parseDate(initialData.endDate));
        setHour(initialData.hour);
        setMinute(initialData.minute);
        setPeriod(initialData.period);
      } else {
        // Reset
        setTitle('');
        setFrequency('Daily');
        setDays([]);
        setStartDate(undefined);
        setEndDate(undefined);
        setHour('12');
        setMinute('00');
        setPeriod('AM');
      }
    }
  }, [visible, initialData]);

  const toggleDay = (day: string) => {
    setDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    onSave({
      id: initialData?.id,
      title,
      frequency,
      days,
      startDate: formatDateValue(startDate),
      endDate: formatDateValue(endDate),
      hour,
      minute,
      period,
    });
    onClose();
  };

  const selectedDaysLabel = days.length
    ? `${reminders.selectedDaysPrefix} ${days.join(', ')}`
    : reminders.noDaysSelected;

  return (
    <AppModal visible={visible} onClose={onClose} closeOnOverlayPress={true}>
      {/* Scrollable form fields ONLY — no drum pickers inside */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[s.scrollContent]}
      >
        <AppText variant="semibold" style={s.sheetTitle}>{reminders.reminderTitle}</AppText>

        {/* Title */}
        <AppText variant='medium' style={s.label}>
          {reminders.titleLabel} <AppText style={s.required}>*</AppText>
        </AppText>
        <TextInput
          style={s.input}
          placeholder={reminders.titlePlaceholder}
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
            <DateInput
              label={reminders.startDateLabel}
              value={startDate}
              onChange={setStartDate}
              placeholder={reminders.selectDatePlaceholder}
              dateFormat="yy/mm/dd"
              containerStyle={s.dateField}
            />
            <DateInput
              label={reminders.endDateLabel}
              value={endDate}
              onChange={setEndDate}
              placeholder={reminders.selectDatePlaceholder}
              dateFormat="yy/mm/dd"
              containerStyle={s.dateField}
            />
          </>
        )}
      </ScrollView>

      {/* Time picker is OUTSIDE ScrollView — no gesture conflict */}
      <View style={[s.timeCard, { marginHorizontal: spacing.xl }]}>
        <AppText variant="semibold" style={s.timeTitle}>{reminders.scheduledTimeTitle}</AppText>
        <View style={s.pickerRow}>
          <DrumPicker items={HOURS}   selected={hour}   onSelect={setHour}   width={70} />
          <DrumPicker items={MINUTES} selected={minute} onSelect={setMinute} width={70} />
          <DrumPicker items={PERIODS} selected={period} onSelect={setPeriod} width={60} />
        </View>
      </View>

      {/* Actions also outside ScrollView */}
      <View style={[s.actions, { paddingHorizontal: spacing.xl, paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
        <Button variant="outline" style={s.cancelBtn} title={reminders.cancelBtn} onPress={onClose} />
        <Button variant="primary" style={s.saveBtn} title={reminders.saveBtn} onPress={handleSave} />
      </View>
    </AppModal>
  );
}

const s = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  sheetTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl
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
    marginTop: spacing.lg,
    marginBottom: spacing.xxxl,
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
  freqText: { 
    fontSize: fontSize.md, 
    color: colors.textSecondary 
  },
  freqTextActive: { 
    color: colors.primaryBackground, 
    fontWeight: '600' 
  },
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
  dateField: { marginBottom: spacing.md },
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
  actions: { 
    flexDirection: 'row', 
    marginTop: spacing.lg,
    gap: spacing.xl
  },
  cancelBtn: { flex: 1 },
  saveBtn: { flex: 1 },
});
