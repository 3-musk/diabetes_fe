import { Activity, ActivityResponse } from "../types/activity";
import { apiClient } from "../utils/apiClient";

export { Activity };

export const fetchActivities = async (
  startDate: string,
  endDate: string,
  page: number = 0,
  size: number = 10
): Promise<ActivityResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('startDate', startDate);
    params.append('endDate', endDate);
    params.append('page', page.toString());
    params.append('size', size.toString());

    const response = await apiClient.get(`/api/activities/details?${params.toString()}`);
    
    if (response.data && response.data.success) {
      const data = response.data.data;
      return {
        startDate: data.startDate,
        endDate: data.endDate,
        activities: (data.activities || []).map((e: any) => ({
          id: e.key || e.id,
          name: e.activityTitle || e.name || e.exerciseType,
          durationMins: e.durationMinutes || e.durationMins || e.duration,
          iconName: e.iconName || 'dumbbell',
          completed: e.isCompleted ?? e.completed ?? false,
        })),
        page: data.page ?? page,
        size: data.size ?? size,
        totalItems: data.totalItems ?? 0,
        totalPages: data.totalPages ?? 0,
        hasNext: data.hasNext ?? false,
      };
    }
    
    return {
      startDate,
      endDate,
      activities: [],
      page,
      size,
      totalItems: 0,
      totalPages: 0,
      hasNext: false
    };
  } catch (error) {
    console.error("Error fetching activities", error);
    return {
      startDate,
      endDate,
      activities: [],
      page,
      size,
      totalItems: 0,
      totalPages: 0,
      hasNext: false
    };
  }
};

export const addActivity = async (data: { exerciseType: string; duration: number; description?: string; date: string }) => {
  try {
    const payload = {
      activityTitle: data.exerciseType,
      durationMinutes: data.duration,
      description: data.description || "",
      activityDate: data.date
    };
    
    const response = await apiClient.post("/api/activities/add-activity", payload);
    
    if (response.data && response.data.success) {
      const resData = response.data.data;
      return { 
        success: true, 
        data: {
          id: resData?.key || Math.random().toString(36).substring(2, 9),
          name: resData?.activityTitle || data.exerciseType,
          durationMins: resData?.durationMinutes || data.duration,
          iconName: 'dumbbell',
          completed: resData?.isCompleted ?? true,
        } 
      };
    } else {
      throw new Error(response.data?.message || "Failed to add activity");
    }
  } catch (error: any) {
    console.error("Error adding activity:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to add activity",
    };
  }
};

export const saveCompletedActivities = async (activityIds: string[]) => {
  try {
    const payload = activityIds.map(id => ({ key: id }));
    
    const response = await apiClient.put(`/api/activities/update-activities`, payload);
    
    if (response.data && response.data.success) {
      return { success: true };
    } else {
      throw new Error(response.data?.message || "Failed to complete activities");
    }
  } catch (error: any) {
    console.error("Error completing activities:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || "Failed to complete activities",
    };
  }
};
