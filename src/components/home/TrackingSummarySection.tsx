import { SvgIcon } from "@/utils/icon";
import { StyleSheet, View } from "react-native";
import { borderRadius, colors, fontSize, spacing } from "../../theme";
import AppText from "../AppText";

type TrackingSummarySectionProps = {
  meals?: Record<string, number>;
  weightKg?: Record<string, number>;
  activityMinutes?: number;
};

type TrackingTileProps = {
  accentColor: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
};

export function TrackingSummarySection({
  meals,
  weightKg,
  activityMinutes,
}: TrackingSummarySectionProps) {
  return (
    <View style={styles.container}>
      <TrackingTile
        accentColor={colors.success}
        icon={<SvgIcon source={require("../../../assets/svgs/tabs/meal.svg")} size={60} />}
        title="Log Meal"
        subtitle={meals ? `${meals?.logged ?? 0}/${meals?.total ?? 0}` : ''}
      />

      <TrackingTile
        accentColor={colors.error}
        icon={<SvgIcon source={require("../../../assets/svgs/weight.svg")} size={60} />}
        title={weightKg ? `${weightKg?.current ?? 0}kg / ${weightKg?.target ?? 0}kg` : 'Log Weight'}
        subtitle={weightKg ? 'Log Weight' : ''}
      />

      <TrackingTile
        accentColor={colors.success}
        icon={<SvgIcon source={require("../../../assets/svgs/activity.svg")} size={60} />}
        title={activityMinutes ? `${activityMinutes ?? 0} mins` : "Log Activity" }
        subtitle={activityMinutes ? "Log Activities" : ''}
      />
    </View>
  );
}

function TrackingTile({ accentColor, icon, title, subtitle }: TrackingTileProps) {
  return (
    <View 
      style={[
        styles.tile, 
        { 
          borderTopColor: accentColor,
          borderTopWidth: 6,
        }
      ]}
    >
      <View>
        {icon}
      </View>
      <AppText variant="medium" style={styles.tileTitle}>
        {title}
      </AppText>
      <AppText variant="medium" style={styles.tileSubtitle}>
        {subtitle}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: spacing.xl,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: "#E5E5E5",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  tileTitle: {
    marginTop: spacing.md,
    color: colors.textPrimary,
    fontSize: fontSize.lg,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  tileSubtitle: {
    color: colors.textTertiary,
    fontSize: fontSize.md,
    textAlign: "center",
  },
});
