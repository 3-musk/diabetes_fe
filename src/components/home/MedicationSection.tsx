import { SvgIcon } from "@/utils/icon";
import { FontAwesome } from "@react-native-vector-icons/fontawesome";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { ROUTES } from "../../constants/routes";
import { deleteMedication, toggleMedicationTaken } from "../../services/medicationService";
import { borderRadius, colors, fontSize, shadows, spacing } from "../../theme";
import Checkbox from "../inputs/CheckBox";
import AppText from "../ui/AppText";
import { OutlineAction, SetupCard } from "./Shared";
import { medication } from "../../constants/medication";
import type { MedicationData } from "./types";

export function MedicationSection({ data, onRefresh }: { data: MedicationData[], onRefresh?: () => void }) {
  const router = useRouter();
  const goToAddMedication = () => router.push(ROUTES.appAddMedication as any);

  const [localChecked, setLocalChecked] = useState<Record<string, boolean>>({});

  const handleToggle = async (id: string, initialTaken: boolean) => {
    const isCurrentlyChecked = localChecked[id] !== undefined ? localChecked[id] : initialTaken;
    setLocalChecked(prev => ({ ...prev, [id]: !isCurrentlyChecked }));
    await toggleMedicationTaken(id);
    onRefresh?.();
  };

  const handleDelete = async (id: string) => {
    await deleteMedication(id);
    onRefresh?.();
  };

  if (!data.length) {
    return (
      <SetupCard title={medication.medicationsTitle}>
        <AppText style={styles.bodyText}>
          {medication.emptyBody}
        </AppText>
        <OutlineAction title={medication.addMedicationBtn} onPress={goToAddMedication} />
      </SetupCard>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeaderRow}>
        <AppText variant="semibold" style={styles.sectionTitle}>
          {medication.medicationsTitle}
        </AppText>
        <Pressable style={styles.addCircle} onPress={goToAddMedication}>
          <FontAwesome name="plus" size={15} color={colors.primaryBackground} />
        </Pressable>
      </View>
      {data.map((item) => {
        const isChecked = localChecked[item.id] !== undefined ? localChecked[item.id] : !!item.isTaken;
        return (
          <View key={item.id} style={styles.medicationItem}>
            <View style={styles.medicationIcon}>
              <SvgIcon source={require('../../../assets/svgs/medication.svg')} size={48}/>
            </View>
            <View style={styles.medicationText}>
              <AppText variant="semibold" style={styles.medicationName}>
                {item.name}
              </AppText>
              <AppText variant="medium" style={styles.timestamp}>{item.dose}</AppText>
            </View>
            <View style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "flex-end"
            }}>
              {item.isSystemGenerated ? (
                <Checkbox
                  checked={isChecked}
                  onChange={() => handleToggle(item.id, !!item.isTaken)}
                  containerStyle={{ marginBottom: 0, padding: spacing.lg, paddingRight: spacing.sm}}
                />
              ) : (
                <Pressable onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <SvgIcon source={require('../../../assets/svgs/delete.svg')} size={20}/>
                </Pressable>
              )}
            </View>
          </View>
        );
      })}
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
    alignContent: "center",
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
  deleteBtn: {
    padding: spacing.lg,
    paddingRight: spacing.sm
  }
});
