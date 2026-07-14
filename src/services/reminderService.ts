import type { ReminderData } from "../components";
import { apiClient } from "../utils/apiClient";

// Mapping dictionaries
const freqToApi: Record<string, string> = {
  "Only Once": "ONCE",
  Daily: "DAILY",
  Custom: "CUSTOM",
};

const apiToFreq: Record<string, "Only Once" | "Daily" | "Custom"> = {
  ONCE: "Only Once",
  DAILY: "Daily",
  CUSTOM: "Custom",
};

const dayToApi: Record<string, string> = {
  Sun: "SUNDAY",
  Mon: "MONDAY",
  Tue: "TUESDAY",
  Wed: "WEDNESDAY",
  Thu: "THURSDAY",
  Fri: "FRIDAY",
  Sat: "SATURDAY",
};

const apiToDay: Record<string, string> = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

// Convert HH:mm to hour, minute, period
const parseTime = (timeStr: string) => {
  if (!timeStr) return { hour: "12", minute: "00", period: "AM" };
  const [hStr, mStr] = timeStr.split(":");
  let h = parseInt(hStr, 10);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return {
    hour: String(h).padStart(2, "0"),
    minute: String(mStr || "00").padStart(2, "0"),
    period,
  };
};

// Convert hour, minute, period to HH:mm
const formatTime = (hour: string, minute: string, period: string) => {
  let h = parseInt(hour, 10);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${minute.padStart(2, "0")}`;
};

export type ReminderPage = {
  items: ReminderData[];
  hasNext: boolean;
};

const PAGE_SIZE = 10;

const mapItem = (item: any): ReminderData => {
  const time = parseTime(item.remindAtTime);
  return {
    id: item.id,
    title: item.title,
    frequency: apiToFreq[item.frequency] || 'Daily',
    days: (item.daysOfWeek || []).map((d: string) => apiToDay[d] || d),
    startDate: item.startDate || '',
    endDate: item.endDate || '',
    hour: time.hour,
    minute: time.minute,
    period: time.period,
  };
};

export const getReminders = async (page = 0): Promise<ReminderPage> => {
  try {
    const response = await apiClient.get(`/api/reminders/list?page=${page}&size=${PAGE_SIZE}`);
    if (response.data && response.data.success && response.data.data) {
      const data = response.data.data;
      return {
        items: (data.items || []).map(mapItem),
        hasNext: data.hasNext ?? false,
      };
    }
  } catch (error) {
    console.error('Error fetching reminders:', error);
  }
  return { items: [], hasNext: false };
};

export const saveReminder = async (
  data: ReminderData,
): Promise<ReminderData> => {
  try {
    const payload: any = {
      title: data.title,
      remindAtTime: formatTime(data.hour, data.minute, data.period),
      frequency: freqToApi[data.frequency] || "DAILY",
    };

    if (data.frequency === "Custom") {
      payload.startDate = data.startDate || undefined;
      payload.endDate = data.endDate || undefined;
      payload.daysOfWeek = data.days.map((d) => dayToApi[d] || d);
    }

    let response;
    const headers = {
      "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
    };

    if (data.id) {
      response = await apiClient.put(`/api/reminders/update/${data.id}`, payload, { headers });
    } else {
      response = await apiClient.post("/api/reminders/create", payload, { headers });
    }

    if (response.data && response.data.success && response.data.data) {
      const item = response.data.data;
      const time = parseTime(item.remindAtTime);
      return {
        id: item.id,
        title: item.title,
        frequency: apiToFreq[item.frequency] || "Daily",
        days: (item.daysOfWeek || []).map((d: string) => apiToDay[d] || d),
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        hour: time.hour,
        minute: time.minute,
        period: time.period,
      };
    }
  } catch (error) {
    console.error("Error saving reminder:", error);
    throw error;
  }
  return data;
};

export const deleteReminder = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/reminders/delete/${id}`);
  } catch (error) {
    console.error("Error deleting reminder:", error);
    // If the API does not exist, this might fail, but it's okay.
  }
};
