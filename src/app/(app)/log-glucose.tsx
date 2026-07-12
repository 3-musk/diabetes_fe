import { useRouter, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AppText,
  BackButton,
  Button,
  Checkbox,
  RadioRow,
  GlucoseEscalationModal,
  GlucoseCriticalModal,
  ScreenContainer,
} from "../../components";
import { GuidelinesData } from "../../components/features/GlucoseEscalationModal";
import {
  GLUCOSE_MAX,
  GLUCOSE_MIN,
  glucose as GLUCOSECONSTANTS,
  TICK_WIDTH,
} from "../../constants/glucose";
import { ROUTES } from "../../constants/routes";
import {
  getGlucoseInitialData,
  saveGlucoseReading,
  getSystemConfigurations,
} from "../../services/glucoseService";
import { borderRadius, colors, fontSize, spacing } from "../../theme";

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

  const initialOffset = (value - GLUCOSE_MIN) * TICK_WIDTH + TICK_WIDTH / 2;

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
          paddingHorizontal: width / 2,
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
    position: "relative",
    overflow: "visible",
    paddingTop: 20,
  },

  needle: {
    position: "absolute",
    top: 20,
    left: "50%",
    marginLeft: -1,
    width: 2,
    height: 120,
    backgroundColor: colors.textPrimary,
    zIndex: 10,
  },

  ticks: {
    flexDirection: "row",
    alignItems: "center",
    height: 120,
  },

  tickWrapper: {
    width: TICK_WIDTH,
    alignItems: "center",
  },

  tick: {
    width: 2,
    borderRadius: 1,
    backgroundColor: "#D9D9D9",
  },

  tickMajor: {
    height: 120,
    backgroundColor: "#BDBDBD",
  },

  tickMinor: {
    height: 80,
  },

  tickLabel: {
    fontSize: 8,
    color: colors.textSecondary,
    marginTop: 12,
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

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [glucoseValue, setGlucoseValue] = useState(100);
  const [session, setSession] = useState("");
  const [readingType, setReadingType] = useState("");
  const [symptoms, setSymptoms] = useState<Set<string>>(new Set());

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<"low" | "high">("low");
  const [modalGuidelines, setModalGuidelines] = useState<GuidelinesData | null>(
    null,
  );
  const [modalShowRecheck, setModalShowRecheck] = useState(false);

  // Dynamic Form Options
  const [readingSessions, setReadingSessions] = useState<
    { id: string; label: string }[]
  >([]);
  const [readingTypes, setReadingTypes] = useState<
    { id: string; label: string }[]
  >([]);
  const [symptomList, setSymptomList] = useState<
    { id: string; label: string }[]
  >([]);
  const [unitText, setUnitText] = useState("mg/dL");
  const [othersText, setOthersText] = useState("");

  // Critical Modal State
  const [criticalModalVisible, setCriticalModalVisible] = useState(false);
  const [criticalText, setCriticalText] = useState("");

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadData = async () => {
        try {
          setLoading(true);
          const configData = await getSystemConfigurations();

          if (isActive && configData && configData.data) {
            const sessions: { id: string; label: string }[] = [];
            const types: { id: string; label: string }[] = [];
            const symps: { id: string; label: string }[] = [];
            let unit = "mg/dL";

            configData.data.forEach((item: any) => {
              if (item.category === "READING_SESSION") {
                sessions.push({ id: item.code, label: item.config.display });
              } else if (item.category === "READING_TYPE") {
                types.push({ id: item.code, label: item.config.display });
              } else if (item.category === "SYMPTOM") {
                symps.push({ id: item.code, label: item.config.display });
              } else if (item.category === "UNIT") {
                unit = item.config.display;
              }
            });

            setReadingSessions(sessions);
            setReadingTypes(types);
            setSymptomList(symps);
            setUnitText(unit);
          }

          if (isActive) {
            // Clear old selections
            setGlucoseValue(100);
            setSession("");
            setReadingType("");
            setSymptoms(new Set());
            setOthersText("");
          }
        } catch (e) {
          console.error("Failed to load data", e);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      loadData();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const finalSymptoms = Array.from(symptoms).filter((s) => s !== "OTHERS");
      if (symptoms.has("OTHERS") && othersText.trim() !== "") {
        finalSymptoms.push(othersText.trim());
      }

      const response = await saveGlucoseReading({
        glucoseValue,
        session,
        readingType,
        symptoms: finalSymptoms,
      });
      const statusUpper = response.status?.toUpperCase();

      if (statusUpper === "CRITICAL" || statusUpper === "EMERGENCY") {
        setCriticalText(response.guidelines?.escalation || "");
        setCriticalModalVisible(true);
      } else if (statusUpper === "HIGH_RISK") {
        setModalType(response.guidelines?.type === "HYPO" ? "low" : "high");
        setModalGuidelines(response.guidelines);
        setModalShowRecheck(response.showRecheckOption);
        setModalVisible(true);
      } else {
        // NORMAL or anything else
        router.replace(ROUTES.appHome as any);
      }
    } catch (error: any) {
      console.error("Failed to save glucose reading:", error);
      Alert.alert("Error", error?.response?.data?.message || error?.message || "Failed to save reading");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecheck = () => {
    setModalVisible(false);
    setGlucoseValue(100); // Reset for new reading
    setSymptoms(new Set());
    setOthersText("");
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setCriticalModalVisible(false);
    router.replace(ROUTES.appHome as any);
  };

  const toggleSymptom = (id: string) => {
    setSymptoms((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <ScreenContainer edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton color={colors.primaryBackground} />
        <AppText variant="semibold" style={styles.headerTitle}>
          {GLUCOSECONSTANTS.pageTitle}
        </AppText>
      </View>

      {loading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: insets.bottom + 100 },
          ]}
        >
          <View style={styles.glucosePickerSection}>
            <View style={styles.valueCard}>
              <TextInput
                style={styles.valueInput}
                keyboardType="number-pad"
                value={glucoseValue ? glucoseValue.toString() : ""}
                onChangeText={(text) => {
                  if (text === "") {
                    setGlucoseValue(0);
                  } else {
                    const parsed = parseInt(text, 10);
                    if (!isNaN(parsed)) setGlucoseValue(parsed);
                  }
                }}
                maxLength={3}
              />

              <View style={styles.valueDivider} />

              <AppText style={styles.unitText}>{unitText}</AppText>

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
            {readingSessions.map((s) => (
              <RadioRow
                key={s.id}
                label={s.label}
                selected={session === s.id}
                onPress={() => setSession(s.id)}
              />
            ))}

            {/* Type of Reading */}
            <SectionTitle title={GLUCOSECONSTANTS.sectionTypeOfReading} />
            {readingTypes.map((t) => (
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
              {symptomList.map((s) => (
                <Checkbox
                  key={s.id}
                  title={s.label}
                  checked={symptoms.has(s.id)}
                  onChange={() => toggleSymptom(s.id)}
                />
              ))}
              <Checkbox
                title="Others"
                checked={symptoms.has("OTHERS")}
                onChange={() => {
                  toggleSymptom("OTHERS");
                  if (symptoms.has("OTHERS")) {
                    setOthersText(""); // Clear if unchecking
                  }
                }}
              />
              {symptoms.has("OTHERS") && (
                <TextInput
                  style={styles.othersInput}
                  placeholder="Type here"
                  placeholderTextColor={colors.textSecondary}
                  value={othersText}
                  onChangeText={setOthersText}
                  multiline
                  textAlignVertical="top"
                />
              )}
            </View>
          </View>
        </ScrollView>
      )}

      {/* Sticky footer */}
      <View
        style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}
      >
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
        guidelines={modalGuidelines}
        showRecheckOption={modalShowRecheck}
        onClose={handleCloseModal}
        onRecheck={handleRecheck}
      />

      <GlucoseCriticalModal
        visible={criticalModalVisible}
        escalationText={criticalText}
        onClose={handleCloseModal}
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
    flexDirection: "row",
    alignItems: "center",
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
    borderColor: "#E7D0A4",

    alignItems: "center",
    justifyContent: "center",

    // position: 'absolute',
    top: 0,
    zIndex: 20,
  },
  glucosePickerSection: {
    height: 280,
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: spacing.md,
  },
  valueInput: {
    fontSize: 52,
    color: colors.textPrimary,
    textAlign: "center",
    minWidth: 100,
    padding: 0,
    margin: 0,
  },
  valueDivider: {
    width: 80,
    height: 2,
    backgroundColor: "#E2E2E2",
    marginBottom: 8,
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
    borderColor: "#F5DAAA",
    paddingTop: spacing.xl,
    marginTop: spacing.xxxl,
  },
  symptomsCard: {
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  othersInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    minHeight: 120,
    color: colors.textPrimary,
    fontSize: fontSize.md,
  },
  cardPointer: {
    position: "absolute",
    bottom: -20,

    width: 0,
    height: 0,

    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,

    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.primary,
  },
  footer: {
    position: "absolute",
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
    width: "100%",
    borderRadius: borderRadius.full,
  },
});
