export type GlucoseReadingEntry = {
  id: string;
  glucoseValue: number;
  session: string;
  readingType: string;
  symptoms: string[];
  timestamp: string;
};

export type WeightEntry = {
  id: string;
  date: string;
  weightKg: number;
  onTarget: boolean;
};

export type WeightHistory = {
  target: number;
  bmi: number;
  history: WeightEntry[];
};

export type HbA1cStatus = "Normal" | "Prediabetes" | "Diabetes";

export type HbA1cEntry = {
  id: string;
  date: string;
  value: number;
  status: HbA1cStatus;
};

export type MedicationEntry = {
  id: string;
  category: 'Capsules' | 'Pills' | 'Liquid' | 'Others';
  medName: string;
  strength: string;
  frequency: number;
  startDate: string;
  endDate: string;
  isSystemGenerated?: boolean;
  time?: string;
};

export type Activity = {
  id: string;
  name: string;
  durationMins: number;
  iconName?: string;
};

export type LifestyleQuestion = {
  id: string;
  question: string;
  options: string[];
};

// ─── Shared In-Memory State ───────────────────────────────────────────────

export const glucoseReadings: GlucoseReadingEntry[] = [];

export const weightHistory: WeightHistory = {
  target: 70,
  bmi: 20.7,
  history: [
    { id: "1", date: "Feb 14, 2026", weightKg: 75.5, onTarget: true },
    { id: "2", date: "Feb 13, 2026", weightKg: 76.2, onTarget: false },
    { id: "3", date: "Feb 12, 2026", weightKg: 77.0, onTarget: false },
  ],
};

export const hba1cHistory: HbA1cEntry[] = [
  { id: "1", date: "Feb 14, 2026", value: 6.1, status: "Prediabetes" },
  { id: "2", date: "Feb 16, 2026", value: 6.8, status: "Diabetes" },
  { id: "3", date: "Feb 14, 2026", value: 5.0, status: "Normal" },
];

export let medications: MedicationEntry[] = [
  {
    id: "med_1",
    category: "Capsules",
    medName: "Metformin",
    strength: "10mg",
    frequency: 1,
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    isSystemGenerated: false,
  },
  {
    id: "med_2",
    category: "Pills",
    medName: "Lisinopril",
    strength: "10mg",
    frequency: 1,
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    isSystemGenerated: false,
  },
  {
    id: "med_3",
    category: "Capsules",
    medName: "Vitamin D3",
    strength: "2000 IU",
    frequency: 1,
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    isSystemGenerated: false,
  },
  {
    id: "sys_med_1",
    category: "Capsules",
    medName: "Metformin",
    strength: "10mg",
    frequency: 1,
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    isSystemGenerated: true,
    time: "6:00 AM"
  },
  {
    id: "sys_med_2",
    category: "Capsules",
    medName: "Metformin",
    strength: "10mg",
    frequency: 1,
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    isSystemGenerated: true,
    time: "6:00 AM"
  }
];

export const mockActivities: Record<string, Activity[]> = {
  default: [
    { id: '1', name: 'Running', durationMins: 30, iconName: 'person-running' },
    { id: '2', name: 'Yoga', durationMins: 30, iconName: 'spa' },
    { id: '3', name: 'Strength Training', durationMins: 30, iconName: 'dumbbell' },
    { id: '4', name: 'Evening Walk', durationMins: 45, iconName: 'shoe-prints' },
  ],
};

export const completedActivityIds: Record<string, string[]> = {};

export const completedMedicationIds: Record<string, string[]> = {};

export const lifestyleAnswers: Record<string, string> = {};

export const lifestyleQuestionsList: LifestyleQuestion[] = [
  {
    id: "q1",
    question: "Which carbohydrate foods do you eat most often",
    options: [
      "White rice",
      "Brown Rice/ Whole grains",
      "White roti/ chapati",
      "Whole wheat bread",
      "Potatoes",
      "Other"
    ]
  },
  {
    id: "q2",
    question: "How often do you eat meals outside home (restaurants, takeaway)?",
    options: ["Never", "1-2 times a week", "3-4 times a week", "Every day"]
  },
  {
    id: "q3",
    question: "How often do you engage in moderate physical activity per week?",
    options: ["0 days", "1-2 days", "3-4 days", "5+ days"]
  },
  {
    id: "q4",
    question: "Do you smoke or use tobacco products?",
    options: ["Yes, regularly", "Occasionally", "No, I quit", "Never"]
  },
  {
    id: "q5",
    question: "How many hours of sleep do you get on average?",
    options: ["< 5 hours", "5-6 hours", "7-8 hours", "> 8 hours"]
  },
  {
    id: "q6",
    question: "How often do you consume sugary drinks?",
    options: ["Daily", "Weekly", "Rarely", "Never"]
  },
  {
    id: "q7",
    question: "How often do you feel stressed?",
    options: ["Always", "Often", "Sometimes", "Rarely"]
  }
];
