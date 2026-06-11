import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import {
  GlucoseSection,
  GlucoseSummarySection,
  Hba1cSection,
  type HomeDashboardData,
  HomeHeader,
  HomeSectionStack,
  LifestyleQuestionSection,
  type LifestyleQuestionData,
  type MedicationData,
  MedicationSection,
  NutritionSection,
  TrackingSummarySection,
} from "../../components/home";
import { useAuth } from "../../context/AuthContext";
import { getHomeDashboardData, getLifestyleQuestions, getMedication } from "../../services/homepage";
import { colors, spacing } from "../../theme";

export default function Home() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const firstName = user?.name?.split(" ")[0] || "User";
  
  const [homeData, setHomeData] = useState<HomeDashboardData | null>(null);
  const [lifestyleQuestions, setLifestyleQuestions] = useState<LifestyleQuestionData | null>(null);
  const [medication, setMedication] = useState<MedicationData[] | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchHomeData = async () => {
        try {
          const data = await getHomeDashboardData();
          setHomeData(data);

          const medicationData = await getMedication();
          setMedication(medicationData?.data || null)

          const lifestyleqnaData = await getLifestyleQuestions();
          setLifestyleQuestions(lifestyleqnaData?.data || null)
        } catch (error) {
          console.error("Error fetching home data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchHomeData();
    }, [])
  );

  // Show loading state or actual data
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 92 },
          ]}
        >
          <HomeHeader name={firstName} />
          {/* Loading indicator could be added here */}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const refreshMedication = async () => {
    try {
      const medicationData = await getMedication();
      setMedication(medicationData?.data || null);
    } catch (error) {
      console.error("Error refreshing medication:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 92 },
        ]}
      >
        <HomeHeader name={firstName} />

        <HomeSectionStack>
          <GlucoseSection data={homeData?.glucose || null} />
          <GlucoseSummarySection data={homeData?.glucose || null} />
          <NutritionSection data={homeData?.nutrition || null} />
          <TrackingSummarySection
            meals={homeData?.meals}
            weightKg={homeData?.weightKg}
            activityMinutes={homeData?.dailyActivityDurationMinutes}
          />
          <Hba1cSection data={homeData?.hba1c || null} />
          <LifestyleQuestionSection data={lifestyleQuestions || null} />
          <MedicationSection data={medication || []} onRefresh={refreshMedication} />
        </HomeSectionStack>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
});
