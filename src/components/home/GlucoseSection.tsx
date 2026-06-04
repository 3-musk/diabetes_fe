import { Dimensions, StyleSheet, View } from "react-native";
import {
  GLUCOSE_GAUGE_RANGE,
  GLUCOSE_GAUGE_RANGES,
  GLUCOSE_STATUS_COLORS,
  GLUCOSE_STRINGS,
} from "../../constants/glucoseConfig";
import { borderRadius, colors, fontSize, shadows, spacing } from "../../theme";
import AppText from "../AppText";
import Button from "../Button";
import GlucoseGauge from "../common/GlucoseGauge";
import { Metric, OutlineAction, SetupCard } from "./Shared";
import type { GlucoseReading } from "./types";

const { width } = Dimensions.get('window');

export function GlucoseSection({ data }: { data: GlucoseReading | null }) {
  if (!data) {
    return (
      <SetupCard title={GLUCOSE_STRINGS.sectionTitle}>
        <AppText style={styles.mutedText}>
          {GLUCOSE_STRINGS.emptyBody}
        </AppText>
        <OutlineAction title={GLUCOSE_STRINGS.emptyAction} />
      </SetupCard>
    );
  }

  const tileColor = GLUCOSE_STATUS_COLORS[data.status as keyof typeof GLUCOSE_STATUS_COLORS]
    ?? GLUCOSE_STATUS_COLORS.danger;

  return (
    <View style={[styles.monitorCard, { borderColor: tileColor }]}>
      <AppText variant="semibold" style={styles.sectionTitle}>
        {GLUCOSE_STRINGS.sectionTitle}
      </AppText>
      <View style={styles.gaugeWrap}>
        <GlucoseGauge
          value={data.value}
          unit={data.unit}
          status={data.status}
          min={GLUCOSE_GAUGE_RANGE.min}
          max={GLUCOSE_GAUGE_RANGE.max}
          ranges={[...GLUCOSE_GAUGE_RANGES]}
        />
      </View>
      <AppText style={styles.timestamp}>
        {GLUCOSE_STRINGS.lastLogPrefix}{new Date(data.timestamp).toLocaleString()}
      </AppText>
      <Button style={styles.logButton} onPress={() => {}}>
        <AppText variant="semibold" style={styles.logButtonText}>
          {GLUCOSE_STRINGS.logButton}
        </AppText>
      </Button>
    </View>
  );
}

export function GlucoseSummarySection({ data }: { data: GlucoseReading | null }) {
  if (!data) return null;

  return (
    <View style={styles.summaryCard}>
      <AppText variant="semibold" style={styles.sectionTitle}>
        {GLUCOSE_STRINGS.summaryTitle}
      </AppText>
      <View style={styles.summaryRow}>
        <Metric label={GLUCOSE_STRINGS.metricAverage} color={colors.textPrimary} value={data.statistics.average + ''} unit={data.unit} align="flex-start" />
        <Metric label={GLUCOSE_STRINGS.metricLowest}  color={colors.textPrimary} value={data.statistics.lowest  + ''} unit={data.unit} align="center" />
        <Metric label={GLUCOSE_STRINGS.metricHighest} color={colors.textPrimary} value={data.statistics.highest + ''} unit={data.unit} align="flex-end" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mutedText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    width: width * 0.7,
    lineHeight: 18,
    marginLeft: spacing.lg,
    marginVertical: spacing.lg,
  },
  monitorCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderLeftWidth: width * 0.01,
    padding: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  gaugeWrap: {
    height: 200,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  timestamp: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    textAlign: 'center',
  },
  logButton: {
    alignSelf: "center",
    minWidth: 130,
    minHeight: 34,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.md,
  },
  logButtonText: {
    color: colors.primaryForeground,
    fontSize: fontSize.sm,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderLeftWidth: width * 0.01,
    borderLeftColor: colors.textPrimary,
    padding: spacing.lg,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
