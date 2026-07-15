import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppModal, AppText, Button, DateStrip, HeaderActionIcons, ScreenContainer } from '../../components';
import { carePlan as CAREPLANCONSTANTS } from '../../constants/carePlan';
import { MealSlot } from '../../constants/uiConstants';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import {
  getCarePlan,
  type CarePlan
} from '../../services/carePlanService';
import { getUser } from '../../services/authService';
import { borderRadius, colors, fontSize, spacing } from '../../theme';
import { SvgIcon } from '../../utils/icon';



// ─── Removed WeekCalendar in favor of DateStrip ────────────────────────────────

// ─── Accordion slot card ──────────────────────────────────────────────────────

function SlotCard({ slot, initiallyOpen }: { slot: MealSlot; initiallyOpen: boolean }) {
  const [open, setOpen] = useState(initiallyOpen);
  const hasDetail = !!(slot.diet || slot.physicalActivity || slot.medications);

  return (
    <View style={card.wrap}>
      <Pressable style={card.header} onPress={() => setOpen(o => !o)}>
        <SvgIcon source={slot.icon} size={42} />
        <AppText variant="medium" style={card.label}>{slot.label}</AppText>
        <View style={card.toggleBtn}>
          <FontAwesome
            name={open ? 'minus' : 'plus'}
            size={12}
            color={colors.secondaryForeground}
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
    backgroundColor: '#F9F6F0',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  label: { flex: 1, fontSize: fontSize.md, color: colors.textPrimary },
  toggleBtn: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#FCE4A8', // yellow toggle circle
    alignItems: 'center', justifyContent: 'center',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md, // slightly more gap
  },
  detailBlock: { gap: 4 }, // slight gap between title and value
  detailTitle: { fontSize: 13, color: colors.textPrimary, fontWeight: 'bold' },
  detailText: { fontSize: 14, color: '#4E3A32', lineHeight: 20 }, // slightly larger text like mockup
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
    <AppModal 
      visible={visible} 
      onClose={onClose} 
      closeOnOverlayPress={true} 
      maxHeight={'25%'}
      containerStyle={{
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.lg,
        marginBottom: Platform.OS === 'ios' ? 80 : insets.bottom + 60
      }}
    >
      <View style={[
        popup.cardContent, 
        { 
          paddingBottom: Platform.OS === 'ios' ? 0 : Math.max(insets.bottom + 16, 24)
        }
      ]}>
        <AppText style={popup.message}>
          {CAREPLANCONSTANTS.popupMessage}
        </AppText>
        <Button style={popup.actionBtn} title={CAREPLANCONSTANTS.popupBtn} onPress={onGoToProfile} />
      </View>
    </AppModal>
  );
}

const popup = StyleSheet.create({
  cardContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
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
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [selectedDate,     setSelectedDate]     = useState(new Date());

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        try {
          const token = accessToken ?? '';
          const format = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
          const dateStr = format(selectedDate);
          setScreenState('loading');
          const plan  = await getCarePlan(token, dateStr);

          if (!active) return;

          if (plan && plan.hasPlan) {
            setCarePlan(plan);
            setScreenState('has_care_plan');
            return;
          }

          const user = await getUser(token);

          if (!active) return;

          if (user) {
            if (!user.hasBmiDetails) {
              setScreenState('needs_profile');
            } else if (!user.hasLifestyleQuestion) {
              setScreenState('needs_lifestyle');
            } else {
              setScreenState('pending');
            }
          } else {
            setScreenState('needs_profile');
          }
        } catch (e) {
          console.error('Care plan load error:', e);
          if (active) {
            setScreenState('needs_profile');
          }
        }
      })();

      return () => {
        active = false;
      };
    }, [accessToken, selectedDate])
  );

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (screenState === 'pending') {
      timeout = setTimeout(() => {
        // Automatically finish pending generation after 10s
        setScreenState('has_care_plan');
      }, 10000);
    }
    return () => clearTimeout(timeout);
  }, [screenState]);

  const handlePersonalisePress = () => {
    if (screenState === 'needs_profile') {
      setShowProfilePopup(true);
    } else {
      router.push({
        pathname: ROUTES.appLifestyleQuestions as any,
        params: { returnTo: '/(app)/care-plan' },
      });
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
      <ScreenContainer edges={['top']}>
        <View style={s.pageHeader}>
          <AppText variant="semibold" style={s.pageTitle}>{CAREPLANCONSTANTS.pageTitle}</AppText>
          <HeaderActionIcons />
        </View>
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  // ── Has care plan ──
  if (screenState === 'has_care_plan') {
    const slots: MealSlot[] = carePlan?.sessions?.map((s) => {
      const dietTasks = (s.tasks || []).filter(t => t.category === 'diet').map(t => t.description).join('\n\n');
      const physicalTasks = (s.tasks || []).filter(t => t.category === 'physical_activity').map(t => t.description).join('\n\n');
      const medTasks = (s.tasks || []).filter(t => t.category === 'medication').map(t => t.description).join('\n\n');

      let icon = require('../../../assets/svgs/care_plan/morning.svg');
      let label = CAREPLANCONSTANTS.morning;
      if (s.session.toLowerCase() === 'afternoon') {
        icon = require('../../../assets/svgs/care_plan/afternoon.svg');
        label = CAREPLANCONSTANTS.afternoon;
      } else if (s.session.toLowerCase() === 'evening') {
        icon = require('../../../assets/svgs/care_plan/evening.svg');
        label = CAREPLANCONSTANTS.evening;
      } else if (s.session.toLowerCase() === 'night' || s.session.toLowerCase() === 'dinner') {
        icon = require('../../../assets/svgs/care_plan/dinner.svg');
        label = CAREPLANCONSTANTS.night;
      }

      return {
        id: s.session,
        label,
        icon,
        diet: dietTasks || undefined,
        physicalActivity: physicalTasks || undefined,
        medications: medTasks || undefined,
      };
    }) || [];

    const activeSlotId = (() => {
      const h = new Date().getHours();
      if (h < 11) return 'morning';
      if (h < 16) return 'afternoon';
      if (h < 20) return 'evening';
      return 'night';
    })();

    return (
      <ScreenContainer edges={['top']}>
        <View style={s.pageHeader}>
          <AppText variant="semibold" style={s.pageTitle}>{CAREPLANCONSTANTS.pageTitle}</AppText>
          <HeaderActionIcons />
        </View>

        <DateStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.carePlanScroll, { paddingBottom: insets.bottom + 20 }]}
        >
          <View style={s.slotsCard}>
            {slots.map(slot => {
              // The API may return 'night' but we map its id to 'night' or 'dinner'
              const initiallyOpen = slot.id.toLowerCase() === activeSlotId || 
                (activeSlotId === 'night' && slot.id.toLowerCase() === 'dinner');
              
              return (
                <SlotCard key={slot.id} slot={slot} initiallyOpen={initiallyOpen} />
              );
            })}
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // ── All other states ──
  return (
    <ScreenContainer edges={['top']}>
      <View style={s.pageHeader}>
        <AppText variant="semibold" style={s.pageTitle}>{CAREPLANCONSTANTS.pageTitle}</AppText>
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
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: '#F9F6F0' }, // Overall beige background
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center' },
  pageHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  pageTitle: { fontSize: fontSize.xxl, color: '#4E3A32', fontWeight: 'bold' }, // Dark brown
  carePlanScroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  slotsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: '#FDE4C3',
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
});
