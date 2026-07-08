export type HbA1cStatus = "Normal" | "Prediabetes" | "Diabetes";

export type HbA1cEntry = {
  id: string;
  date: string;
  value: number;
  status: HbA1cStatus;
};

export type HbA1cHistory = {
  history: HbA1cEntry[];
  hasNext?: boolean;
};
