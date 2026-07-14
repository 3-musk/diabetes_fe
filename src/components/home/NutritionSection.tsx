import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import {
  NUTRIENT_DISPLAY,
  NUTRITION_STATUS_CONFIG,
  NUTRITION_STATUS_GAUGE,
  NUTRITION_STRINGS,
} from "../../constants/nutritionConfig";
import { ROUTES } from "../../constants/routes";
import { useFeatureAccess } from "../../hooks/useFeatureAccess";
import { borderRadius, colors, fontSize, shadows, spacing } from "../../theme";
import AppText from "../ui/AppText";
import { OutlineAction, SetupCard } from "./Shared";
import type { NutritionData, NutritionRange } from "./types";

function getNutrientState(item: NutritionRange) {
  if (!item.status) {
    return {
      subtitle: NUTRITION_STRINGS.noDataLabel,
      accentColor: colors.textTertiary,
      needleAngle: null,
      arcStartAngle: undefined,
      arcEndAngle: undefined,
    };
  }

  const normalizedStatus = item.status.toLowerCase() as keyof typeof NUTRITION_STATUS_CONFIG;
  const status   = NUTRITION_STATUS_CONFIG[normalizedStatus];
  const position = NUTRITION_STATUS_GAUGE[normalizedStatus];

  if (!status || !position) {
    return {
      subtitle: item.status,
      accentColor: colors.textTertiary,
      needleAngle: null,
      arcStartAngle: undefined,
      arcEndAngle: undefined,
    };
  }

  return {
    subtitle: status.label,
    accentColor: status.color,
    ...position,
  };
}

function polarToCartesian(cx: number, cy: number, radius: number, angle: number) {
  const radians = (angle * Math.PI) / 180;
  return {
    x: cx + Math.cos(radians) * radius,
    y: cy + Math.sin(radians) * radius,
  };
}

function describeArc(cx: number, cy: number, radius: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, radius, startAngle);
  const end   = polarToCartesian(cx, cy, radius, endAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
}

export function NutritionSection({ data, leftBorder=true }: { data: NutritionData | null, leftBorder?: boolean }) {
  const router = useRouter();
  const { checkFeature } = useFeatureAccess();

  if (!data) {
    return (
      <SetupCard title={NUTRITION_STRINGS.sectionTitle}>
        <AppText style={styles.mutedText}>
          {NUTRITION_STRINGS.emptyBody}
        </AppText>
        <OutlineAction 
          title={NUTRITION_STRINGS.emptyAction} 
          onPress={() => checkFeature('meals', () => router.push(ROUTES.appMeals as any))}
        />
      </SetupCard>
    );
  }

  return <NutritionCompassCard data={data} leftBorder={leftBorder}/>;
}

function getBorderLeftColor(data: NutritionData): string {
  const statuses = Object.values(data).map(r => r.status?.toLowerCase());

  if (statuses.some(s => s === "limit" || s === "high")) {
    return NUTRITION_STATUS_CONFIG.limit.color;
  }
  if (statuses.some(s => s === "increase" || s === "low")) {
    return NUTRITION_STATUS_CONFIG.increase.color;
  }
  return NUTRITION_STATUS_CONFIG.optimal.color;
}

function NutritionCompassCard({ data, leftBorder=true }: { data: NutritionData, leftBorder?: boolean  }) {
  const borderLeftColor = getBorderLeftColor(data);
  const borderLeftWidth = leftBorder===false ? 0 : 4
  return (
    <View style={[styles.card, { borderLeftColor }, {borderLeftWidth}]}>
      <AppText variant="medium" style={styles.sectionTitle}>
        {NUTRITION_STRINGS.sectionTitle}
      </AppText>

      <View style={styles.nutritionRow}>
        {NUTRIENT_DISPLAY.map((nutrient) => {
          const range = data[nutrient.key];
          const state = getNutrientState(range);

          return (
            <NutrientGaugeItem
              key={nutrient.key}
              title={nutrient.title}
              subtitle={state.subtitle}
              accentColor={state.accentColor}
              needleAngle={state.needleAngle}
              arcStartAngle={state.arcStartAngle}
              arcEndAngle={state.arcEndAngle}
            />
          );
        })}
      </View>
    </View>
  );
}

function NutrientGaugeItem({
  title,
  subtitle,
  accentColor,
  needleAngle,
  arcStartAngle,
  arcEndAngle,
}: {
  title: string;
  subtitle: string;
  accentColor: string;
  needleAngle: number | null;
  arcStartAngle?: number;
  arcEndAngle?: number;
}) {
  const centerX      = 34;
  const centerY      = 34;
  const arcRadius    = 27;
  const needleLength = 16;
  const radians  = ((needleAngle ?? 270) * Math.PI) / 180;
  const needleX  = centerX + Math.cos(radians) * needleLength;
  const needleY  = centerY + Math.sin(radians) * needleLength;

  return (
    <View style={styles.nutrientItem}>
      {needleAngle === null ? (
        <>
          <Svg width={70} height={42} viewBox="0 0 70 42">
            <Path
              d={describeArc(centerX, centerY, arcRadius, 205, 335)}
              stroke={`${accentColor}22`}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d={`M${centerX} ${centerY} L${needleX} ${needleY}`}
              stroke={colors.secondaryForeground}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Circle
              cx={centerX}
              cy={centerY}
              r={3.5}
              fill={colors.surface}
              stroke={colors.secondaryForeground}
              strokeWidth={2}
            />
          </Svg>
          <AppText variant="medium" style={styles.nutrientTitle}>
            {title}
          </AppText>
          <AppText style={[styles.nutrientSubtitle, {fontSize: fontSize.sm}]}>
            {subtitle}
          </AppText>
        </>
      ) : (
        <>
          <Svg width={70} height={42} viewBox="0 0 70 42">
            <Path
              d={describeArc(centerX, centerY, arcRadius, 205, 335)}
              stroke={`${accentColor}22`}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d={describeArc(centerX, centerY, arcRadius, arcStartAngle ?? 255, arcEndAngle ?? 285)}
              stroke={accentColor}
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
            />
            <Path
              d={`M${centerX} ${centerY} L${needleX} ${needleY}`}
              stroke={colors.secondaryForeground}
              strokeWidth={2}
              strokeLinecap="round"
            />
            <Circle
              cx={centerX}
              cy={centerY}
              r={3.5}
              fill={colors.surface}
              stroke={colors.secondaryForeground}
              strokeWidth={2}
            />
          </Svg>
          <AppText variant="medium" style={styles.nutrientTitle}>
            {title}
          </AppText>
          <AppText style={styles.nutrientSubtitle}>
            {subtitle}
          </AppText>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mutedText: {
    color: colors.textPrimary,
    fontSize: fontSize.md,
    lineHeight: 18,
    marginLeft: spacing.xl,
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.xxl,
  },
  nutritionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  nutrientItem: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
  },
  nutrientTitle: {
    color: colors.textPrimary,
    fontSize: fontSize.xl,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  nutrientSubtitle: {
    color: colors.textTertiary,
    fontSize: fontSize.lg,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  noDataGauge: {
    width: 70,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
  },
  noDataText: {
    color: colors.textTertiary,
    fontSize: fontSize.xl,
  },
});
