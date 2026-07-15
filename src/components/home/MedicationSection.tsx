import { SvgIcon } from "@/utils/icon";
import { FontAwesome } from "@react-native-vector-icons/fontawesome";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { medication } from "../../constants/medication";
import { ROUTES } from "../../constants/routes";
import { useFeatureAccess } from "../../hooks/useFeatureAccess";
import { deleteMedication, toggleMedicationTaken } from "../../services/medicationService";
import { borderRadius, colors, fontSize, spacing } from "../../theme";
import Checkbox from "../inputs/CheckBox";
import AppText from "../ui/AppText";
import { OutlineAction, SetupCard } from "./Shared";
import type { MedicationData } from "./types";

export function MedicationSection({ data, onRefresh }: { data: MedicationData[], onRefresh?: () => void }) {
  const router = useRouter();
  const { checkFeature } = useFeatureAccess();
  const goToAddMedication = () => checkFeature('medications', () => router.push(ROUTES.appAddMedication as any));

  const [localChecked, setLocalChecked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLocalChecked({});
  }, [data]);

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

  const userMeds = data.filter(m => !m.isSystemGenerated);
  const doctorMeds = data.filter(m => m.isSystemGenerated);

  const renderMedicationItem = (item: MedicationData) => {
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
  };

  return (
    <View style={styles.container}>
      {/* User Medications */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <AppText variant="medium" style={styles.sectionTitle}>
            {medication.medicationsTitle}
          </AppText>
          <Pressable style={styles.addCircle} onPress={goToAddMedication}>
            <FontAwesome name="plus" size={15} color={colors.primaryBackground} />
          </Pressable>
        </View>
        {userMeds.length > 0 ? (
          userMeds.map(renderMedicationItem)
        ) : (
          <AppText style={[styles.bodyText, { marginLeft: 0, marginTop: spacing.md }]}>
            {medication.noMedicationsAdded}
          </AppText>
        )}
      </View>

      {/* Doctor Suggested Medications */}
      {doctorMeds.length > 0 && (
        <View style={[styles.sectionContainer, { marginTop: spacing.xxl }]}>
          <View style={styles.sectionHeaderRow}>
            <AppText variant="medium" style={styles.sectionTitle}>
              {medication.doctorSuggested}
            </AppText>
          </View>
          {doctorMeds.map(renderMedicationItem)}
        </View>
      )}
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
  container: {
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FBC02D',
    padding: spacing.lg,
  },
  sectionContainer: {
    // optional container styling
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
