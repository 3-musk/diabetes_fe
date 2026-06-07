export type ReadingSession = { id: string; label: string };
export type ReadingType = { id: string; label: string };
export type Symptom = { id: string; label: string };

// Initial mock data that would come from API
export const getGlucoseInitialData = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
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
