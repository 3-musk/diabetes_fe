import { HomeDashboardData } from "../components/home/types";

// Get home dashboard data
export const getHomeDashboardData = async (): Promise<HomeDashboardData> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // TODO: Replace with actual API call
  // API: GET /api/home/dashboard
  // Headers: { Authorization: `Bearer ${accessToken}` }

  return {
    glucose: {
      value: 142,
      unit: "mg/dL",
      status: "danger",
      lastLoggedAt: "2026-06-03T14:30:00Z",
    },
    glucoseSummary: {
      unit: "mg/dl",
      status: "danger",
      average: 70,
      lowest: 55,
      highest: 280,
    },
    nutrition: {
      metrics: [
        {
          label: "Calories",
          value: "1,842",
          icon: "fire",
          color: "#FF6B6B",
        },
        {
          label: "Carbs",
          value: "186g",
          icon: "cutlery",
          color: "#4ECDC4",
        },
        {
          label: "Protein",
          value: "78g",
          icon: "heartbeat",
          color: "#FFD166",
        },
      ],
      goals: [
        {
          icon: "tint",
          value: "2L",
          label: "Water",
        },
        {
          icon: "apple",
          value: "5",
          label: "Fruits",
        },
        {
          icon: "leaf",
          value: "3",
          label: "Veg",
        },
      ],
    },
    hba1c: {
      value: "7.2",
      date: "2026-05-15",
      status: "high",
      note: "Target: < 6.5%",
    },
    medications: [
      {
        name: "Metformin",
        dose: "500mg",
        icon: "medkit",
      },
      {
        name: "Glimepiride",
        dose: "2mg",
        icon: "flask",
      },
    ],
    lifestyleQuestion: {
      current: 3,
      total: 10,
      question:
        "How often do you engage in moderate physical activity, such as walking, cycling, yoga, etc. per week?",
    },
  };
};
