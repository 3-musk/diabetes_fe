import { glucoseReadings } from "../constants/mockDb";

export type ReadingSession = { id: string; label: string };
export type ReadingType = { id: string; label: string };
export type Symptom = { id: string; label: string };

// Initial mock data that would come from API
export const getGlucoseInitialData = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (glucoseReadings.length > 0) {
    const last = glucoseReadings[glucoseReadings.length - 1];
    return {
      recentGlucoseValue: last.glucoseValue,
      recentSession: last.session,
      recentReadingType: last.readingType,
      recentSymptoms: [...last.symptoms],
    };
  }

  return {
    recentGlucoseValue: 165,
    recentSession: 'morning',
    recentReadingType: 'fasting',
    recentSymptoms: [] as string[],
  };
};

export const saveGlucoseReading = async (data: any) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const value = data.glucoseValue;
  const newReading = {
    id: Math.random().toString(36).substring(2, 9),
    glucoseValue: value,
    session: data.session,
    readingType: data.readingType,
    symptoms: data.symptoms || [],
    timestamp: new Date().toISOString(),
  };

  glucoseReadings.push(newReading);

  if (value < 70) {
    return {
      success: true,
      status: 'low',
      next_steps: {
        title: "Eat or drink something fast",
        steps: [
          "4-5 Glucose Tablets",
          "1/2 cup juice",
          "1 tbsp honey",
          "3-4 biscuits",
          "1 banana"
        ]
      }
    };
  } else if (value > 250) {
    return {
      success: true,
      status: 'high',
      next_steps: {
        title: "Eat or drink something fast",
        steps: [
          "White Rice",
          "Fruit Juice",
          "Sweets",
          "Bread/ Maida",
          "Soft Drink"
        ]
      }
    };
  }
  
  return { success: true, status: 'normal' };
};
