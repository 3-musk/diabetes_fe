import { Dimensions, StyleSheet, View } from "react-native";
import { borderRadius, colors, fontSize, shadows, spacing } from "../../theme";
import AppText from "../AppText";
import Button from "../Button";
import GlucoseGauge from "../common/GlucoseGauge";
import { Metric, OutlineAction, SetupCard } from "./Shared";
import type { GlucoseMetric, GlucoseReading } from "./types";
const { width, height } = Dimensions.get('window');


const readingColors : Record<string, string> = {
  normal: '#15933A',
  'borderline': '#679315',
  'out_of_range': '#c9e913',
  'danger': '#c9130d'
}

export function GlucoseSection({ data }: { data: GlucoseReading | null }) {
  if (!data) {
    return (
      <SetupCard title="Glucose Monitor">
        <AppText style={styles.mutedText}>
          Your readings will appear here once you log your first check.
        </AppText>
        <OutlineAction title="Add first glucose reading" />
      </SetupCard>
    );
  }

  const tileColor = readingColors[data.status as string] || readingColors['danger']

  return (
    <View style={[styles.monitorCard,{ borderColor : tileColor}]}>
      <AppText variant="semibold" style={styles.sectionTitle}>
        Glucose Monitor
      </AppText>
      <View style={styles.gaugeWrap}>
        <GlucoseGauge 
            value={190}
            unit="mg/dl"
            status="Normal"
            min={60}
            max={250}
            ranges={[
              { from: 60, to: 100, color: "#9CB400" },
              { from: 100, to: 140, color: "#B5D300" },
              { from: 140, to: 180, color: "#F0B414" },
              { from: 180, to: 250, color: "#F78B12" },
            ]}
        />
      </View>
      <AppText style={styles.timestamp}>Last log: {data.lastLoggedAt}</AppText>
      <Button style={styles.logButton} onPress={()=>{}}>
        <AppText variant="semibold" style={styles.logButtonText}>
          Log Glucose
        </AppText>
      </Button>
    </View>
  );
}

export function GlucoseSummarySection({ data }: { data: GlucoseMetric | null }) {
  if (!data) return null;

  const tileColor = readingColors[data.status as string] || readingColors['danger']

  return (
    <View style={styles.summaryCard}>
      <AppText variant="semibold" style={styles.sectionTitle}>
        Daily Glucose Summary
      </AppText>
      <View style={styles.summaryRow}>
        <Metric label="Average" color={tileColor} value={data.average + ''} unit={data.unit} align="flex-start"/>
        <Metric label="Lowest" color={tileColor} value={data.lowest + ''} unit={data.unit} align="center"/>
        <Metric label="Highest" color={tileColor} value={data.highest + ''} unit={data.unit} align="flex-end"/>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mutedText: {
    color: colors.textTertiary,
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
    fontSize: fontSize.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  gaugeWrap: {
    height: 200,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  timestamp: {
    position: 'relative',
    color: colors.textTertiary,
    fontSize: fontSize.sm,
    textAlign: 'center'
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
    borderLeftColor: colors.error,
    padding: spacing.lg,
    ...shadows.sm,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
