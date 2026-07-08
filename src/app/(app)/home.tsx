import { useCallback, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { LoadingSpinner, ScreenContainer } from "../../components";
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
import { getHomeDashboardData, getMedication } from "../../services/homepage";
import { colors, spacing } from "../../theme";
import { UI_STRINGS } from "../../constants/uiConstants";

export default function Home() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const firstName = user?.name?.split(" ")[0] || "User";
  const hasLoadedRef = useRef(false);

  const [homeData, setHomeData] = useState<HomeDashboardData | null>(null);
  const [lifestyleQuestions, setLifestyleQuestions] = useState<LifestyleQuestionData | null>(null);
  const [medication, setMedication] = useState<MedicationData[] | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = useCallback(async () => {
    const isRefresh = hasLoadedRef.current;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setInitialLoading(true);
    }

    try {
      const [data, medicationData] = await Promise.all([
        getHomeDashboardData(),
        getMedication(),
      ]);

      setHomeData(data);
      setMedication(medicationData?.data || null);
      if (data && data.totalLifestyleQuestions) {
        setLifestyleQuestions({
          current: data.currentQuestionNumber || 1,
          total: data.totalLifestyleQuestions || 12,
          question: data.lifestyleQuestion || "Please answer the lifestyle questionnaire.",
          isCompleted: data.currentQuestionNumber ? data.currentQuestionNumber > data.totalLifestyleQuestions : false,
        });
      } else {
        setLifestyleQuestions(null);
      }
      hasLoadedRef.current = true;
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [fetchHomeData])
  );

  const refreshMedication = async () => {
    try {
      const medicationData = await getMedication();
      setMedication(medicationData?.data || null);
    } catch (error) {
      console.error("Error refreshing medication:", error);
    }
  };

  if (initialLoading && !hasLoadedRef.current) {
    return (
      <ScreenContainer edges={["top"]}>
        <LoadingSpinner text={UI_STRINGS.loadingDashboard} fullScreen />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={["top"]}>
      <View style={styles.content}>
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

        {refreshing && (
          <View style={styles.refreshOverlay} pointerEvents="none">
            <View style={styles.refreshBadge}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  refreshOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(251, 249, 239, 0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  refreshBadge: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    padding: spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
});
