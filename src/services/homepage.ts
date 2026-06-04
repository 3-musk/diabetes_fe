import {
  HomeDashboardData,
  LifestyleQuestionData,
  MedicationData,
} from "../components/home/types";

// Get home dashboard data
export const getHomeDashboardData =
  async (): Promise<HomeDashboardData | null> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // TODO: Replace with actual API call
    // API: GET /api/home/dashboard
    // Headers: { Authorization: `Bearer ${accessToken}` }
    return null;
    // return {
    //   glucose: {
    //     value: 142,
    //     unit: "mg/dL",
    //     status: "danger",
    //     timestamp: "2026-06-03T14:30:00Z",
    //     statistics: {
    //       average: 70,
    //       lowest: 55,
    //       highest: 280,
    //     },
    //   },
    //   weightKg: {
    //     current: 45,
    //     target: 60,
    //   },
    //   meals: {
    //     logged: 3,
    //     total: 5,
    //   },
    //   dailyActivityDurationMinutes: 67,
    //   hba1c: {
    //     value: 7.2,
    //     testDate: "2026-05-15",
    //     status: "Prediabetes",
    //   },
    //   nutrition: {
    //     carbohydrates: {
    //       currentVal: 25,
    //       rangeMax: 45,
    //       rangeMin: 20,
    //       status: "optimal",
    //     },
    //     totalFat: {
    //       currentVal: 25,
    //       rangeMax: 45,
    //       rangeMin: 20,
    //       status: "limit",
    //     },
    //     protein: {
    //       currentVal: 25,
    //       rangeMax: 45,
    //       rangeMin: 20,
    //       status: "increase",
    //     },
    //     dietaryFiber: {
    //       currentVal: 25,
    //       rangeMax: 45,
    //       rangeMin: 20,
    //       status: "limit",
    //     },
    //     addedSugar: {
    //       currentVal: null,
    //       rangeMax: 45,
    //       rangeMin: 20,
    //       status: null,
    //     },
    //   },
    // };
  };

export const getMedication = async (): Promise<{
  data: MedicationData[];
} | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // TODO: Replace with actual API call
  // API: GET /api/home/dashboard
  // Headers: { Authorization: `Bearer ${accessToken}` }

  return null;

  // return {
  //   data: [
  //     {
  //       name: "Metformin",
  //       dose: "500mg",
  //       icon: "medkit",
  //     },
  //     {
  //       name: "Glimepiride",
  //       dose: "2mg",
  //       icon: "flask",
  //     },
  //   ],
  // };
};

export const getLifestyleQuestions = async (): Promise<{
  data: LifestyleQuestionData;
} | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // TODO: Replace with actual API call
  // API: GET /api/home/dashboard
  // Headers: { Authorization: `Bearer ${accessToken}` }

  return null;
  // return {
  //   data: {
  //     current: 3,
  //     total: 10,
  //     question:
  //       "How often do you engage in moderate physical activity (walking, cycling, yoga, etc.) per week?",
  //   },
  // };
};
