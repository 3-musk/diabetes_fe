import { SvgIcon } from "@/utils/icon";
import { FontAwesome } from "@react-native-vector-icons/fontawesome";
import { Pressable, StyleSheet, View } from "react-native";
import { borderRadius, colors, fontSize, shadows, spacing } from "../../theme";
import AppText from "../AppText";
import Button from "../Button";
import { OutlineAction, SetupCard } from "./Shared";
import type { MedicationData } from "./types";

export function MedicationSection({ data }: { data: MedicationData[] }) {
  if (!data.length) {
    return (
      <SetupCard title="Medications">
        <AppText style={styles.bodyText}>
          Add your prescribed medicines to get reminders and stay on track.
        </AppText>
        <OutlineAction title="Add Medication" />
      </SetupCard>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeaderRow}>
        <AppText variant="semibold" style={styles.sectionTitle}>
          Medications
        </AppText>
        <Pressable style={styles.addCircle}>
          <FontAwesome name="plus" size={15} color={colors.primaryForeground} />
        </Pressable>
      </View>
      {data.map((item) => (
        <View key={item.name} style={styles.medicationItem}>
          <View style={styles.medicationIcon}>
            <SvgIcon source={require('../../../assets/svgs/medication.svg')} size={50}/>
          </View>
          <View style={styles.medicationText}>
            <AppText variant="semibold" style={styles.medicationName}>
              {item.name}
            </AppText>
            <AppText style={styles.timestamp}>{item.dose}</AppText>
          </View>
          <Button 
            variant="ghost"
            onPress={()=>{}}
            icon={<SvgIcon source={require('../../../assets/svgs/delete.svg')} size={28}/>}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bodyText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
    lineHeight: 18,
    marginBottom: spacing.lg,
    marginLeft: spacing.xl
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.secondary,
    padding: spacing.lg,
    ...shadows.sm,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  addCircle: {
    width: 30,
    height:30,
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  medicationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
  },
  medicationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.secondary,
  },
  medicationText: {
    flex: 1,
    gap: 4,
    marginLeft: 4
  },
  medicationName: {
    color: colors.textPrimary,
    fontSize: fontSize.lg,
  },
  timestamp: {
    color: colors.textTertiary,
    fontSize: fontSize.sm,
  },
});
