import { mockActivities, completedActivityIds, Activity } from "../constants/mockDb";

export { Activity };

export const fetchActivities = async (date: string): Promise<Activity[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Return activities for the specific date if they exist, otherwise return default mock
  const list = mockActivities[date] || mockActivities.default;
  return [...list];
};

export const addActivity = async (data: { exerciseType: string; duration: number; description?: string; date: string }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const newActivity: Activity = {
    id: Math.random().toString(36).substring(2, 9),
    name: data.exerciseType,
    durationMins: data.duration,
    iconName: 'dumbbell', // Default icon for custom activity
  };

  if (!mockActivities[data.date]) {
    mockActivities[data.date] = [...mockActivities.default];
  }
  
  mockActivities[data.date].push(newActivity);

  return { success: true, data: newActivity };
};

export const saveCompletedActivity = async (date: string, activityId: string) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  if (!completedActivityIds[date]) {
    completedActivityIds[date] = [];
  }
  
  if (!completedActivityIds[date].includes(activityId)) {
    completedActivityIds[date].push(activityId);
  }

  return { success: true };
};
