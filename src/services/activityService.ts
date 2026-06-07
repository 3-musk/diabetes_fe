export type Activity = {
  id: string;
  name: string;
  durationMins: number;
  iconName?: string; // FontAwesome icon name
};

// Initial mocked activities
const MOCK_ACTIVITIES: Record<string, Activity[]> = {
  default: [
    { id: '1', name: 'Running', durationMins: 30, iconName: 'person-running' },
    { id: '2', name: 'Yoga', durationMins: 30, iconName: 'spa' },
    { id: '3', name: 'Strength Training', durationMins: 30, iconName: 'dumbbell' },
    { id: '4', name: 'Evening Walk', durationMins: 45, iconName: 'shoe-prints' },
  ],
};

export const fetchActivities = async (date: string): Promise<Activity[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  // Return activities for the specific date if they exist, otherwise return default mock
  return MOCK_ACTIVITIES[date] || MOCK_ACTIVITIES.default;
};

export const addActivity = async (data: { exerciseType: string; duration: number; description?: string; date: string }) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const newActivity: Activity = {
    id: Math.random().toString(36).substr(2, 9),
    name: data.exerciseType,
    durationMins: data.duration,
    iconName: 'dumbbell', // Default icon for custom activity
  };

  if (!MOCK_ACTIVITIES[data.date]) {
    MOCK_ACTIVITIES[data.date] = [...MOCK_ACTIVITIES.default];
  }
  
  MOCK_ACTIVITIES[data.date].push(newActivity);

  return { success: true, data: newActivity };
};
