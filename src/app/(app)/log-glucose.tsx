import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, BackButton, Button, Checkbox, RadioRow, GlucoseEscalationModal, NextStepsData, ScreenContainer } from '../../components';
import { GLUCOSE_MAX, GLUCOSE_MIN, glucose as GLUCOSECONSTANTS, TICK_WIDTH } from '../../constants/glucose';
import { getGlucoseInitialData, saveGlucoseReading } from '../../services/glucoseService';
import { borderRadius, colors, fontSize, spacing } from '../../theme';

// ─── Ruler picker ─────────────────────────────────────────────────────────────


function GlucoseRulerPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  // const {width} = useWindowDimensions();
  const [width, setWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const range = GLUCOSE_MAX - GLUCOSE_MIN;
  const totalWidth = range * TICK_WIDTH;

  const handleScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const raw = GLUCOSE_MIN + Math.round((x - TICK_WIDTH / 2) / TICK_WIDTH);
    const clamped = Math.max(GLUCOSE_MIN, Math.min(GLUCOSE_MAX, raw));
    onChange(clamped);
  };

  const initialOffset = ((value - GLUCOSE_MIN) * TICK_WIDTH) + TICK_WIDTH/2;

  return (
    <View 
      style={rulerStyles.wrapper}
      onLayout={(e) => {
        setWidth(e.nativeEvent.layout.width);
      }}
    >
      {/* Fixed centre needle */}
      <View style={rulerStyles.needle} />

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        contentOffset={{ x: initialOffset, y: 0 }}
        contentContainerStyle={{
          width: totalWidth + width,
          paddingHorizontal: width/2
        }}
        decelerationRate="fast"
        snapToInterval={TICK_WIDTH}
      >
        <View style={rulerStyles.ticks}>
          {Array.from({ length: range + 1 }, (_, i) => {
            const v = GLUCOSE_MIN + i;
            const isMajor = v % 5 === 0;
            return (
              <View key={v} style={rulerStyles.tickWrapper}>
                <View
                  style={[
                    rulerStyles.tick,
                    isMajor ? rulerStyles.tickMajor : rulerStyles.tickMinor,
                  ]}
                />
                {isMajor && (
                  <AppText style={rulerStyles.tickLabel}>{v}</AppText>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const rulerStyles = StyleSheet.create({
  wrapper: {
    height: 250,
    position: 'relative',
    overflow: 'visible',
    paddingTop: 20,
  },

  needle: {
    position: 'absolute',
    top: 20,
    left: '50%',
    marginLeft: -1,
    width: 2,
    height: 120,
    backgroundColor: colors.textPrimary,
    zIndex: 10,
  },

  ticks: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 120,
  },

  tickWrapper: {
    width: TICK_WIDTH,
    alignItems: 'center'

  },

  tick: {
    width: 2,
    borderRadius: 1,
    backgroundColor: '#D9D9D9',
  },

  tickMajor: {
    height: 120,
    backgroundColor: '#BDBDBD',
  },

  tickMinor: {
    height: 80,
  },

  tickLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    marginTop: 12
  },
});

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return (
    <AppText variant="semibold" style={sectionStyles.title}>
      {title}
    </AppText>
  );
}

const sectionStyles = StyleSheet.create({
  title: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function LogGlucose() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [glucoseValue, setGlucoseValue]   = useState(165);
  const [session, setSession]             = useState('morning');
  const [readingType, setReadingType]     = useState('fasting');
  const [symptoms, setSymptoms]           = useState<Set<string>>(new Set());

  // Modal State
  const [modalVisible, setModalVisible]   = useState(false);
  const [modalType, setModalType]         = useState<'low'|'high'>('low');
  const [modalNextSteps, setModalNextSteps] = useState<NextStepsData | null>(null);

  useEffect(() => {
    (async () => {
      const data = await getGlucoseInitialData();
      setGlucoseValue(data.recentGlucoseValue);
      setSession(data.recentSession);
      setReadingType(data.recentReadingType);
      setSymptoms(new Set(data.recentSymptoms));
      setLoading(false);
    })();
  }, []);

  const handleSave = async () => {
    setSubmitting(true);
    const response = await saveGlucoseReading({ glucoseValue, session, readingType, symptoms: Array.from(symptoms) });
    setSubmitting(false);

    if (response.status === 'low' || response.status === 'high') {
      setModalType(response.status as 'low' | 'high');
      setModalNextSteps(response.next_steps || null);
      setModalVisible(true);
    } else {
      router.back();
    }
  };

  const handleRecheck = () => {
    setModalVisible(false);
    setGlucoseValue(100); // Reset for new reading
    setSymptoms(new Set());
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    router.push('/home' as any); // Or use ROUTES.appHome if available
  };

  const toggleSymptom = (id: string) => {
    setSymptoms(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };


  return (
    <ScreenContainer edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton color={colors.primaryBackground} />
        <AppText variant="semibold" style={styles.headerTitle}>{GLUCOSECONSTANTS.pageTitle}</AppText>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        >
          <View style={styles.glucosePickerSection}>
            <View style={styles.valueCard}>
              <TextInput
                style={styles.valueInput}
                keyboardType="number-pad"
                value={glucoseValue ? glucoseValue.toString() : ''}
                onChangeText={(text) => {
                  if (text === '') {
                    setGlucoseValue(0);
                  } else {
                    const parsed = parseInt(text, 10);
                    if (!isNaN(parsed)) setGlucoseValue(parsed);
                  }
                }}
                maxLength={3}
              />

              <View style={styles.valueDivider} />

              <AppText style={styles.unitText}>
                {GLUCOSECONSTANTS.unitText}
              </AppText>

              <View style={styles.cardPointer} />
            </View>

            <GlucoseRulerPicker
              value={glucoseValue}
              onChange={setGlucoseValue}
            />
          </View>

          <View style={styles.sections}>
            {/* Reading Session */}
            <SectionTitle title={GLUCOSECONSTANTS.sectionReadingSession} />
            {GLUCOSECONSTANTS.readingSessions.map(s => (
              <RadioRow
                key={s.id}
                label={s.label}
                selected={session === s.id}
                onPress={() => setSession(s.id)}
              />
            ))}

            {/* Type of Reading */}
            <SectionTitle title={GLUCOSECONSTANTS.sectionTypeOfReading} />
            {GLUCOSECONSTANTS.readingTypes.map(t => (
              <RadioRow
                key={t.id}
                label={t.label}
                selected={readingType === t.id}
                onPress={() => setReadingType(t.id)}
              />
            ))}

            {/* Symptoms */}
            <SectionTitle title={GLUCOSECONSTANTS.sectionSymptoms} />
            <View style={styles.symptomsCard}>
              {GLUCOSECONSTANTS.symptoms.map(s => (
                <Checkbox
                  key={s.id}
                  title={s.label}
                  checked={symptoms.has(s.id)}
                  onChange={() => toggleSymptom(s.id)}
                />
              ))}
            </View>

          </View>
        </ScrollView>
      )}

      {/* Sticky footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          title={GLUCOSECONSTANTS.logBtn}
          onPress={handleSave}
          loading={submitting}
          size="lg"
          style={styles.logBtn}
        />
      </View>

      <GlucoseEscalationModal
        visible={modalVisible}
        type={modalType}
        value={glucoseValue}
        readingType={readingType}
        nextSteps={modalNextSteps}
        onClose={handleCloseModal}
        onRecheck={handleRecheck}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
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
  valueCard: {
    width: 180,
    height: 145,
    borderRadius: 24,
    backgroundColor: colors.surface,

    borderWidth: 1,
    borderColor: '#E7D0A4',

    alignItems: 'center',
    justifyContent: 'center',

    // position: 'absolute',
    top: 0,
    zIndex: 20,
  },
  glucosePickerSection: {
    height: 280,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: spacing.md,
  },
  valueInput: {
    fontSize: 52,
    color: colors.textPrimary,
    textAlign: 'center',
    minWidth: 100,
    padding: 0,
    margin: 0,
  },
  valueDivider: {
    width: 80,
    height: 2,
    backgroundColor: '#E2E2E2',
    marginBottom: 8
  },
  unitText: {
    fontSize: 20,
    color: colors.textSecondary,
  },
  sections: {
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primaryBackground,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#F5DAAA',
    paddingTop: spacing.xl,
    marginTop: spacing.xxxl,
  },
  symptomsCard: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cardPointer: {
    position: 'absolute',
    bottom: -20,

    width: 0,
    height: 0,

    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,

    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logBtn: {
    width: '100%',
    borderRadius: borderRadius.full,
  },
});
