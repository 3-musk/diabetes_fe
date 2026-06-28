import {
  HomeDashboardData,
  IconName,
  LifestyleQuestionData,
  MedicationData,
} from "../components/home/types";
import { apiClient } from "../utils/apiClient";

// Get home dashboard data
export const getHomeDashboardData =
  async (): Promise<HomeDashboardData | null> => {
    try {
      const response = await apiClient.get('/api/dashboard');
      if (response.data && response.data.success && response.data.data) {
        const apiData = response.data.data;

        // 1. Glucose Reading
        let glucose = null;
        if (apiData.glucose && apiData.glucose.value !== null && apiData.glucose.value !== undefined) {
          glucose = {
            value: parseFloat(apiData.glucose.value),
            unit: apiData.glucose.unit || "mg/dL",
            status: apiData.glucose.status || "normal",
            timestamp: apiData.glucose.timestamp || new Date().toISOString(),
            statistics: apiData.glucose.statistics ? {
              average: parseFloat(apiData.glucose.statistics.average ?? apiData.glucose.value),
              lowest: parseFloat(apiData.glucose.statistics.lowest ?? apiData.glucose.value),
              highest: parseFloat(apiData.glucose.statistics.highest ?? apiData.glucose.value),
            } : {
              average: parseFloat(apiData.glucose.value),
              lowest: parseFloat(apiData.glucose.value),
              highest: parseFloat(apiData.glucose.value),
            }
          };
        }

        // 2. Weight
        let weightKg = null;
        if (apiData.weightKg !== null && apiData.weightKg !== undefined) {
          weightKg = {
            current: typeof apiData.weightKg === 'object' ? parseFloat(apiData.weightKg.current ?? 0) : parseFloat(apiData.weightKg),
            target: typeof apiData.weightKg === 'object' ? parseFloat(apiData.weightKg.target ?? 70) : 70,
          };
        }

        // 3. Meals
        let meals = { logged: 0, total: 4 };
        if (apiData.meal) {
          meals = {
            logged: apiData.meal.logged ?? 0,
            total: apiData.meal.total ?? 4,
          };
        }

        // 4. Daily Activity Duration
        const dailyActivityDurationMinutes = apiData.dailyActivityDurationMinutes !== null && apiData.dailyActivityDurationMinutes !== undefined
          ? parseInt(apiData.dailyActivityDurationMinutes)
          : 0;

        // 5. HbA1c
        let hba1c = null;
        if (apiData.hbA1c && typeof apiData.hbA1c === 'object') {
          if (apiData.hbA1c.value !== null && apiData.hbA1c.value !== undefined) {
            hba1c = {
              value: parseFloat(apiData.hbA1c.value),
              testDate: apiData.hbA1c.testDate || apiData.hbA1c.timestamp || new Date().toISOString(),
              status: apiData.hbA1c.status || "normal",
            };
          }
        } else if (apiData.hbA1c !== null && apiData.hbA1c !== undefined) {
          hba1c = {
            value: parseFloat(apiData.hbA1c),
            testDate: new Date().toISOString(),
            status: "normal",
          };
        }

        // 6. Nutrition
        let nutrition = null;
        const nutrients = apiData.nutrients || apiData.nutrition;
        if (nutrients) {
          const mapRange = (item: any) => {
            if (!item) return { currentVal: null, rangeMax: 0, rangeMin: 0, status: null };
            return {
              currentVal: item.currentVal !== null ? parseFloat(item.currentVal) : null,
              rangeMax: item.max !== undefined ? parseFloat(item.max) : (item.rangeMax !== undefined ? parseFloat(item.rangeMax) : 0),
              rangeMin: item.min !== undefined ? parseFloat(item.min) : (item.rangeMin !== undefined ? parseFloat(item.rangeMin) : 0),
              status: item.status || null,
            };
          };

          nutrition = {
            carbohydrates: mapRange(nutrients.carbohydrates),
            totalFat: mapRange(nutrients.totalFat),
            protein: mapRange(nutrients.protein),
            dietaryFiber: mapRange(nutrients.dietaryFibre || nutrients.dietaryFiber),
            addedSugar: mapRange(nutrients.addedSugar),
          };
        }

        return {
          glucose,
          weightKg,
          meals,
          dailyActivityDurationMinutes,
          hba1c,
          nutrition,
        };
      }
    } catch (error) {
      console.warn("Failed to fetch dashboard data from server:", error);
    }

    return {
      glucose: null,
      weightKg: null,
      meals: {
        logged: 0,
        total: 4,
      },
      dailyActivityDurationMinutes: 0,
      hba1c: null,
      nutrition: null,
    };
  };

export const getMedication = async (): Promise<{
  data: MedicationData[];
} | null> => {
  try {
    const response = await apiClient.get('/api/medications');
    if (response.data && response.data.success && response.data.data) {
      const list = (response.data.data || []).map((med: any) => {
        let icon: IconName = "medkit";
        if (med.category === "Pills") icon = "circle-o";
        else if (med.category === "Liquid") icon = "flask";
        else if (med.category === "Others") icon = "user-md";

        let dose = med.strength || med.dose || '';
        if (med.isSystemGenerated && med.time) {
          dose += ` . ${med.time}`;
        }

        return {
          id: med.id,
          name: med.medName || med.name || '',
          dose,
          icon,
          isSystemGenerated: !!med.isSystemGenerated,
          isTaken: !!med.isTaken,
        };
      });
      return { data: list };
    }
  } catch (error) {
    console.warn("Failed to fetch medications from server:", error);
  }

  return { data: [] };
};

export const getLifestyleQuestions = async (): Promise<{
  data: LifestyleQuestionData;
} | null> => {
  try {
    const response = await apiClient.get('/api/care-plan/lifestyle');
    if (response.data && response.data.success && response.data.data) {
      const { questionnaire, lifestyleAnswers } = response.data.data;
      const questions = questionnaire?.questions || [];
      const hasSavedAnswers = !!lifestyleAnswers?.hasSavedAnswers;

      if (hasSavedAnswers) {
        return {
          data: {
            isCompleted: true,
            current: questions.length,
            total: questions.length,
            question: "You have answered all lifestyle questions.",
          },
        };
      }

      const firstQuestion = questions[0]?.question || "Please answer the lifestyle questionnaire.";
      return {
        data: {
          isCompleted: false,
          current: 1,
          total: questions.length || 12,
          question: firstQuestion,
        },
      };
    }
  } catch (error) {
    console.warn("Failed to fetch lifestyle questionnaire from server:", error);
  }

  return {
    data: {
      isCompleted: false,
      current: 1,
      total: 12,
      question: "Which carbohydrate foods do you eat most often? (Select all)",
    }
  };
};
