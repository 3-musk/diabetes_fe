
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



export type LifestyleQuestion = {
  id: string;
  question: string;
  options: string[];
};

// ─── Shared In-Memory State ───────────────────────────────────────────────




export let medications: MedicationEntry[] = [];




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
