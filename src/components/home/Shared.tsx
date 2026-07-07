import { FontAwesome } from "@react-native-vector-icons/fontawesome";
import type React from "react";
import { Pressable, View } from "react-native";
import { colors } from "../../theme";
import AppText from "../ui/AppText";
import { homeStyles as styles } from "./styles";
import type { GoalChipData, IconName } from "./types";

export function HomeSectionStack({ children }: { children: React.ReactNode }) {
  return <View style={styles.stack}>{children}</View>;
}

export function SetupCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <AppText variant="semibold" style={styles.sectionTitle}>
        {title}
      </AppText>
      {children}
    </View>
  );
}

export function OutlineAction({ title, onPress }: { title: string, onPress?: () => void }) {
  return (
    <Pressable style={styles.outlineButton} onPress={onPress}>
      <AppText variant="semibold" style={styles.outlineButtonText}>
        {title}
      </AppText>
    </Pressable>
  );
}

export function QuickLink({ icon, title, subtitle }: { icon: IconName; title: string; subtitle: string }) {
  return (
    <Pressable style={styles.quickLink}>
      <View style={styles.quickIcon}>
        <FontAwesome name={icon} size={17} color={colors.secondaryForeground} />
      </View>
      <View style={styles.quickText}>
        <AppText variant="semibold" style={styles.quickTitle}>
          {title}
        </AppText>
        <AppText style={styles.timestamp}>{subtitle}</AppText>
      </View>
      <FontAwesome name="angle-right" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

type MetricProps = {
  color: string;
  value: string;
  label: string;
  unit: string;
  align?: "flex-start" | "center" | "flex-end";
};

export function Metric({ color, value, label, unit, align }: MetricProps) {
  return (
    <View style={[styles.metric, { alignItems: align }]}>
      <View style={[styles.metricValueRow]}>
        <AppText variant="semibold" style={[styles.metricValue, {color:color}]}>
          {value}
        </AppText>
        <AppText variant="medium" style={[styles.metricUnit, {color:color}]}>{unit}</AppText>
      </View>
      <AppText
        variant="regular" 
        style={styles.metricLabel}
      >
        {label}
      </AppText>
    </View>
  );
}

export function GoalChip({ icon, value, label }: GoalChipData) {
  return (
    <View style={styles.goalChip}>
      <FontAwesome name={icon} size={15} color={colors.secondaryForeground} />
      <View>
        <AppText variant="semibold" style={styles.goalValue}>
          {value}
        </AppText>
        <AppText style={styles.timestamp}>{label}</AppText>
      </View>
    </View>
  );
}
