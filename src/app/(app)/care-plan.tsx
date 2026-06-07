import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText, Button, HeaderActionIcons, PlanCard } from '../../components';
import { carePlan as CAREPLANCONSTANTS } from '../../constants/carePlan';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import {
  getCarePlan,
  getLifestyleQuestionsStatus,
  getProfileCompletion,
  type CarePlan,
  type ProfileCompletion
} from '../../services/carePlanService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

// ─── Types ────────────────────────────────────────────────────────────────────

type MealSlot = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  diet?: string;
  physicalActivity?: string;
  medications?: string;
};

// ─── Mock care plan data ──────────────────────────────────────────────────────

const MOCK_MEAL_SLOTS: MealSlot[] = [
  {
    id: 'morning',
    label: 'Morning',
    icon: 'coffee',
    diet: 'Oats porridge with milk and mixed fruits',
    physicalActivity: '20-minute morning walk',
    medications: 'Metformin 500mg after meal',
  },
  { id: 'afternoon', label: 'Afternoon', icon: 'cutlery' },
  { id: 'evening',   label: 'Evening',   icon: 'leaf' },
  { id: 'dinner',    label: 'Dinner',    icon: 'moon-o' },
];

// ─── Week Calendar ────────────────────────────────────────────────────────────

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function WeekCalendar() {
  const today     = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun … 6=Sat
  // ISO week: Mon=0 … Sun=6
  const isoDay    = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

  // Generate Mon–Sun dates for this week
  const weekDates = DAY_LABELS.map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - isoDay + i);
    return d;
  });

  const monthLabel = today.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <View style={cal.wrap}>
      <AppText variant="semibold" style={cal.month}>{monthLabel}</AppText>
      <View style={cal.row}>
        {weekDates.map((date, i) => {
          const isToday = date.toDateString() === today.toDateString();
          return (
            <Pressable key={i} style={cal.dayCol}>
              <AppText style={[cal.dayLabel, isToday && cal.dayLabelActive]}>
                {DAY_LABELS[i]}
              </AppText>
              <View style={[cal.dayCircle, isToday && cal.dayCircleActive]}>
                <AppText style={[cal.dayNum, isToday && cal.dayNumActive]}>
                  {date.getDate()}
                </AppText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const cal = StyleSheet.create({
  wrap: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  month: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: spacing.xs },
  dayLabel: { fontSize: fontSize.sm, color: colors.textTertiary },
  dayLabelActive: { color: colors.primary, fontWeight: '700' },
  dayCircle: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center',
  },
  dayCircleActive: { backgroundColor: colors.primary },
  dayNum: { fontSize: fontSize.md, color: colors.textPrimary, fontWeight: '600' },
  dayNumActive: { color: colors.primaryForeground },
});

// ─── Accordion slot card ──────────────────────────────────────────────────────

function SlotCard({ slot }: { slot: MealSlot }) {
  const [open, setOpen] = useState(slot.id === 'morning');
  const hasDetail = !!(slot.diet || slot.physicalActivity || slot.medications);

  return (
    <View style={card.wrap}>
      <Pressable style={card.header} onPress={() => setOpen(o => !o)}>
        <View style={card.iconCircle}>
          <FontAwesome name={slot.icon} size={18} color={colors.primary} />
        </View>
        <AppText variant="medium" style={card.label}>{slot.label}</AppText>
        <View style={card.toggleBtn}>
          <FontAwesome
            name={open ? 'minus' : 'plus'}
            size={14}
            color={colors.primary}
          />
        </View>
      </Pressable>

      {open && hasDetail && (
        <View style={card.body}>
          {slot.diet && (
            <View style={card.detailBlock}>
              <AppText variant="semibold" style={card.detailTitle}>{CAREPLANCONSTANTS.dietTitle}</AppText>
              <AppText style={card.detailText}>{slot.diet}</AppText>
            </View>
          )}
          {slot.physicalActivity && (
            <View style={card.detailBlock}>
              <AppText variant="semibold" style={card.detailTitle}>{CAREPLANCONSTANTS.physicalActivityTitle}</AppText>
              <AppText style={card.detailText}>{slot.physicalActivity}</AppText>
            </View>
          )}
          {slot.medications && (
            <View style={card.detailBlock}>
              <AppText variant="semibold" style={card.detailTitle}>{CAREPLANCONSTANTS.medicationsTitle}</AppText>
              <AppText style={card.detailText}>{slot.medications}</AppText>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const card = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  iconCircle: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#FEF3E2',
    alignItems: 'center', justifyContent: 'center',
  },
  label: { flex: 1, fontSize: fontSize.lg, color: colors.textPrimary },
  toggleBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FEF3E2',
    alignItems: 'center', justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  detailBlock: { gap: 2 },
  detailTitle: { fontSize: fontSize.sm, color: colors.textPrimary },
  detailText: { fontSize: fontSize.sm, color: colors.textSecondary, lineHeight: 18 },
});

// ─── "Complete Profile" popup ─────────────────────────────────────────────────

function CompleteProfilePopup({
  visible,
  onClose,
  onGoToProfile,
}: {
  visible: boolean;
  onClose: () => void;
  onGoToProfile: () => void;
}) {
  const insets = useSafeAreaInsets();
  
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={popup.overlay} onPress={onClose}>
          <Pressable style={[popup.card, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
            <Pressable style={popup.closeBtn} onPress={onClose}>
              <FontAwesome name="times" size={18} color={colors.textSecondary} />
            </Pressable>
            <AppText style={popup.message}>
              {CAREPLANCONSTANTS.popupMessage}
            </AppText>
            <Button style={popup.actionBtn} title={CAREPLANCONSTANTS.popupBtn} onPress={onGoToProfile} />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const popup = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    ...shadows.lg,
  },
  closeBtn: {
    alignSelf: 'center',
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  actionText: { color: colors.primaryForeground, fontSize: fontSize.lg },
});

// ─── "Personalise" section ────────────────────────────────────────────────────

function PersonaliseCareplan({ onPress }: { onPress: () => void }) {
  return (
    <View style={ps.card}>
      <Image
        source={require('../../../assets/images/care-plan-illustration.png')}
        style={ps.illustration}
        resizeMode="contain"
      />
      <Button style={ps.btn} title={CAREPLANCONSTANTS.personaliseBtn} onPress={onPress} />
    </View>
  );
}

const ps = StyleSheet.create({
  card: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl, gap: spacing.xxxl,
  },
  illustration: { width: '90%', height: 260 },
  btn: {
    backgroundColor: colors.primary, borderRadius: borderRadius.full,
    width: '100%', alignItems: 'center', paddingVertical: spacing.lg,
  },
  btnText: { color: colors.primaryForeground, fontSize: fontSize.lg },
});

// ─── "Pending" section ────────────────────────────────────────────────────────

function PendingCarePlan() {
  return (
    <View style={pend.card}>
      <View style={pend.iconWrap}>
        <FontAwesome name="clock-o" size={48} color={colors.secondary} />
      </View>
      <AppText variant="semibold" style={pend.title}>{CAREPLANCONSTANTS.pendingTitle}</AppText>
      <AppText style={pend.body}>
        {CAREPLANCONSTANTS.pendingBody}
      </AppText>
    </View>
  );
}

const pend = StyleSheet.create({
  card: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: spacing.xl, gap: spacing.lg,
  },
  iconWrap: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: colors.secondaryForeground,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: fontSize.xxl, color: colors.textPrimary, textAlign: 'center' },
  body: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', lineHeight: 22 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

type ScreenState = 'loading' | 'has_care_plan' | 'needs_profile' | 'needs_lifestyle' | 'pending';

export default function CarePlanScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const { accessToken } = useAuth();

  const [screenState,      setScreenState]     = useState<ScreenState>('loading');
  const [carePlan,         setCarePlan]         = useState<CarePlan | null>(null);
  const [profileStatus,    setProfileStatus]    = useState<ProfileCompletion | null>(null);
  const [showProfilePopup, setShowProfilePopup] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = accessToken ?? '';
        const plan  = await getCarePlan(token);

        if (plan) {
          setCarePlan(plan);
          setScreenState('has_care_plan');
          return;
        }

        const [profile, lifestyle] = await Promise.all([
          getProfileCompletion(token),
          getLifestyleQuestionsStatus(token),
        ]);

        setProfileStatus(profile);

        if (!profile.isComplete) {
          setScreenState('needs_profile');
        } else if (!lifestyle.answered) {
          setScreenState('needs_lifestyle');
        } else {
          setScreenState('pending');
        }
      } catch (e) {
        console.error('Care plan load error:', e);
        setScreenState('needs_profile');
      }
    })();
  }, []);

  const handlePersonalisePress = () => {
    if (!profileStatus?.isComplete) {
      setShowProfilePopup(true);
    } else {
      router.push(ROUTES.appLifestyleQuestions as any);
    }
  };

  const handleGoToProfile = () => {
    setShowProfilePopup(false);
    // Push with returnTo param so profile.tsx can reliably navigate back
    router.push({
      pathname: ROUTES.appProfile as any,
      params: { returnTo: '/(app)/care-plan' },
    });
  };

  // ── Loading ──
  if (screenState === 'loading') {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.pageHeader}>
          <AppText variant="semibold" style={s.pageTitle}>{CAREPLANCONSTANTS.pageTitle}</AppText>
          <HeaderActionIcons />
        </View>
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Has care plan ──
  if (screenState === 'has_care_plan') {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.pageHeader}>
          <AppText variant="semibold" style={s.pageTitle}>{CAREPLANCONSTANTS.pageTitle}</AppText>
          <HeaderActionIcons />
        </View>

        <WeekCalendar />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.carePlanScroll, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={s.slotsCard}>
            {MOCK_MEAL_SLOTS.map(slot => (
              <SlotCard key={slot.id} slot={slot} />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── All other states ──
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.pageHeader}>
        <AppText variant="semibold" style={s.pageTitle}>Care Plan</AppText>
        <HeaderActionIcons />
      </View>

      {(screenState === 'needs_profile' || screenState === 'needs_lifestyle') && (
        <>
          <PersonaliseCareplan onPress={handlePersonalisePress} />
          <CompleteProfilePopup
            visible={showProfilePopup}
            onClose={() => setShowProfilePopup(false)}
            onGoToProfile={handleGoToProfile}
          />
        </>
      )}

      {screenState === 'pending' && <PendingCarePlan />}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.background },
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pageHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  pageTitle: { fontSize: fontSize.xl, color: colors.textPrimary },
  carePlanScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  slotsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.sm,
  },
});
