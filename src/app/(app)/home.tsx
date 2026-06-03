import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  GlucoseSection,
  GlucoseSummarySection,
  Hba1cSection,
  HomeDashboardData,
  HomeHeader,
  HomeSectionStack,
  LifestyleQuestionSection,
  MedicationSection,
  NutritionSection,
  QuickSetupSection,
} from "../../components/home";
import { useAuth } from "../../context/AuthContext";
import { getHomeDashboardData } from "../../services/homepage";
import { colors, spacing } from "../../theme";

export default function Home() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const firstName = user?.name?.split(" ")[0] || "Pradeep";
  
  const [homeData, setHomeData] = useState<HomeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const data = await getHomeDashboardData();
        setHomeData(data);
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

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
          <GlucoseSummarySection data={homeData?.glucoseSummary || null} />
          <NutritionSection data={homeData?.nutrition || null} />
          <QuickSetupSection show={!homeData?.glucose || !homeData?.nutrition} />
          <Hba1cSection data={homeData?.hba1c || null} />
          <LifestyleQuestionSection data={homeData?.lifestyleQuestion || null} />
          <MedicationSection data={homeData?.medications || []} />
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
