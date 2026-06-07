export const glucose = {
  pageTitle: "Log Glucose",
  unitText: "mg/dl",
  sectionReadingSession: "Reading Session",
  sectionTypeOfReading: "Type of Reading",
  sectionSymptoms: "Symptoms",
  sectionMedication: "Medication",
  takenText: "Taken",
  logBtn: "Log Reading",

  readingSessions: [
    { id: "morning", label: "Morning (6:00 am to 11:59 am)" },
    { id: "afternoon", label: "Afternoon (12:00 pm to 4:00 pm)" },
    { id: "evening", label: "Evening (4:01 pm to 6:00 pm)" },
    { id: "night", label: "Night (6:01 pm to 5:59 am)" },
  ],

  readingTypes: [
    { id: "fasting", label: "Fasting" },
    { id: "before_meal", label: "Before Meal" },
    { id: "after_meal", label: "After Meal" },
    { id: "random", label: "Random" },
  ] as const,

  symptoms: [
    { id: "frequent_urination", label: "Frequent Urination (hyperglycemia)" },
    { id: "excessive_thirst", label: "Excessive thirst" },
    { id: "fatigue", label: "Fatigue/low energy" },
    { id: "blurred_vision", label: "Blurred vision" },
    { id: "shakiness", label: "Shakiness/trembling" },
    { id: "sweating", label: "Sweating" },
    { id: "others", label: "Others" },
  ] as const,
};

export const GLUCOSE_MIN = 0;
export const GLUCOSE_MAX = 1000;
export const RULER_STEP = 1;
export const TICK_WIDTH = 15;
