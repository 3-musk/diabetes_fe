import {
  HomeDashboardData,
  LifestyleQuestionData,
  MedicationData,
  IconName,
} from "../components/home/types";
import {
  completedActivityIds,
  glucoseReadings,
  hba1cHistory,
  lifestyleAnswers,
  medications,
  mockActivities,
  weightHistory,
  completedMedicationIds,
  lifestyleQuestionsList
} from "../constants/mockDb";

// Helper to determine glucose status
const getGlucoseStatus = (value: number): string => {
  if (value <= 100) return "normal";
  if (value <= 140) return "borderline";
  if (value <= 180) return "out_of_range";
  return "danger";
};

// Get home dashboard data
export const getHomeDashboardData =
  async (): Promise<HomeDashboardData | null> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 1. Glucose Reading
    let glucose = null;
    if (glucoseReadings.length > 0) {
      const latestReading = glucoseReadings[glucoseReadings.length - 1];
      const values = glucoseReadings.map((r) => r.glucoseValue);
      const sum = values.reduce((acc, v) => acc + v, 0);
      const avg = Math.round(sum / values.length);
      const min = Math.min(...values);
      const max = Math.max(...values);

      glucose = {
        value: latestReading.glucoseValue,
        unit: "mg/dL",
        status: getGlucoseStatus(latestReading.glucoseValue),
        timestamp: latestReading.timestamp,
        statistics: {
          average: avg,
          lowest: min,
          highest: max,
        },
      };
    }

    // 2. Weight
    const weightKg = {
      current: weightHistory.history[0]?.weightKg || 75.5,
      target: weightHistory.target || 70,
    };

    // 3. Daily Activity Duration
    const todayKey = new Date().toISOString().split("T")[0];
    const completedIds = completedActivityIds[todayKey] || [];
    const activitiesList = mockActivities[todayKey] || mockActivities.default;
    const dailyActivityDurationMinutes = activitiesList
      .filter((act) => completedIds.includes(act.id))
      .reduce((acc, act) => acc + act.durationMins, 0);

    // 4. HbA1c
    let hba1c = null;
    if (hba1cHistory.length > 0) {
      const latestHba1c = hba1cHistory[0]; // unshift on save, so index 0 is latest
      hba1c = {
        value: latestHba1c.value,
        testDate: latestHba1c.date,
        status: latestHba1c.status,
      };
    }

    return {
      glucose,
      weightKg,
      meals: {
        logged: 3,
        total: 5,
      },
      dailyActivityDurationMinutes,
      hba1c,
      nutrition: {
        carbohydrates: {
          currentVal: 25,
          rangeMax: 45,
          rangeMin: 20,
          status: "optimal",
        },
        totalFat: {
          currentVal: 25,
          rangeMax: 45,
          rangeMin: 20,
          status: "limit",
        },
        protein: {
          currentVal: 25,
          rangeMax: 45,
          rangeMin: 20,
          status: "increase",
        },
        dietaryFiber: {
          currentVal: 25,
          rangeMax: 45,
          rangeMin: 20,
          status: "limit",
        },
        addedSugar: {
          currentVal: null,
          rangeMax: 45,
          rangeMin: 20,
          status: null,
        },
      },
    };
  };

export const getMedication = async (): Promise<{
  data: MedicationData[];
} | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const todayKey = new Date().toISOString().split("T")[0];
  const takenList = completedMedicationIds[todayKey] || [];

  const list = medications.map((med) => {
    let icon: IconName = "medkit";
    if (med.category === "Pills") icon = "circle-o";
    else if (med.category === "Liquid") icon = "flask";
    else if (med.category === "Others") icon = "user-md";

    let dose = med.strength;
    if (med.isSystemGenerated && med.time) {
      dose += ` . ${med.time}`;
    }

    return {
      id: med.id,
      name: med.medName,
      dose,
      icon,
      isSystemGenerated: med.isSystemGenerated,
      isTaken: takenList.includes(med.id),
    };
  });

  return { data: list };
};

export const getLifestyleQuestions = async (): Promise<{
  data: LifestyleQuestionData;
} | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const unanswered = lifestyleQuestionsList.filter((q) => !lifestyleAnswers[q.id]);

  if (unanswered.length === 0) {
    return {
      data: {
        isCompleted: true,
        current: lifestyleQuestionsList.length,
        total: lifestyleQuestionsList.length,
        question: "You have answered all lifestyle questions.",
      },
    };
  }

  const nextQuestion = unanswered[0];
  const answeredCount = lifestyleQuestionsList.length - unanswered.length;

  return {
    data: {
      current: answeredCount + 1,
      total: lifestyleQuestionsList.length,
      question: nextQuestion.question,
    },
  };
};
