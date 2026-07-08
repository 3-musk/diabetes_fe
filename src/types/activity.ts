export type Activity = {
  id: string;
  name: string;
  durationMins: number;
  iconName?: string;
  completed?: boolean;
};

export type ActivityResponse = {
  startDate: string;
  endDate: string;
  activities: Activity[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
};
