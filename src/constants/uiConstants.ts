import { FontAwesome } from "@react-native-vector-icons/fontawesome";
export const METRICS = ["Glucose", "Meal", "Exercise", "Weight"] as const;

export const GLUCOSE_FILTERS = [
  "All",
  "Fasting",
  "Pre-Meal",
  "Post-Meal",
] as const;

export const FREQUENCIES = ["Only Once", "Daily", "Custom"] as const;

export const DAYS_OF_WEEK = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const;

export const PERIODS = ["AM", "PM"] as const;

export const TIME_FILTERS = [
  "7 Days",
  "1 Month",
  "6 Months",
  "1 Year",
  "Custom",
] as const;

export const BMI_SEGMENTS = [
  { color: "#73BFE3", label: "10", min: 10, end: 18.5, width: 18 },
  { color: "#7ED987", label: "18.5", min: 18.5, end: 25, width: 22 },
  { color: "#FBC02D", label: "25", min: 25, end: 30, width: 20 },
  { color: "#FF7A00", label: "30", min: 30, end: 35, width: 20 },
  { color: "#E53935", label: "35+", min: 35, end: 40, width: 20 },
];

export type MealSlot = {
  id: string;
  label: string;
  icon: any;
  diet?: string;
  physicalActivity?: string;
  medications?: string;
};

export const MOCK_MEAL_SLOTS: MealSlot[] = [
  {
    id: "morning",
    label: "Morning",
    icon: require("../../assets/svgs/care_plan/morning.svg"),
    diet: "Oats porridge with milk and mixed fruits",
    physicalActivity: "20-minute morning walk",
    medications: "Metformin 500mg after meal",
  },
  { id: "afternoon", label: "Afternoon", icon: require("../../assets/svgs/care_plan/afternoon.svg") },
  { id: "evening", label: "Evening", icon: require("../../assets/svgs/care_plan/evening.svg") },
  { id: "dinner", label: "Dinner", icon: require("../../assets/svgs/care_plan/dinner.svg") },
];
