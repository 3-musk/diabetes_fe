import { apiClient } from '../utils/apiClient';

export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
};

export type NotificationPage = {
  items: AppNotification[];
  hasNext: boolean;
};

const PAGE_SIZE = 10;

export const getNotifications = async (page = 0): Promise<NotificationPage> => {
  try {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const futureDate = new Date();
    futureDate.setFullYear(today.getFullYear() + 10);

    const start = thirtyDaysAgo.toISOString().split('T')[0];
    const end = futureDate.toISOString().split('T')[0];

    const response = await apiClient.get(
      `/api/notifications?page=${page}&size=${PAGE_SIZE}&startDate=${start}&endDate=${end}`,
      { headers: { 'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata' } }
    );
    if (response.data && response.data.success && response.data.data) {
      const data = response.data.data;
      return {
        items: (data.items || []).map((item: any): AppNotification => ({
          id: item.id,
          title: item.title,
          body: item.body || item.source || '',
          createdAt: item.created_at || new Date().toISOString(),
          isRead: item.read || false,
        })),
        hasNext: data.hasNext ?? false,
      };
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
  return { items: [], hasNext: false };
};

export const markNotificationAsRead = async (id: string): Promise<AppNotification | null> => {
  try {
    await apiClient.patch('/api/notifications/read', [id]);
    return { id, title: '', body: '', createdAt: '', isRead: true };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
};

export const markAllNotificationsAsRead = async (): Promise<AppNotification[]> => {
  // If there's an API for this later, implement here
  return [];
};

export const addPushNotification = async (
  notification: Pick<AppNotification, 'title' | 'body'> & { createdAt?: string }
): Promise<AppNotification> => {
  // Implement if you handle local pushes
  return {
    id: Date.now().toString(),
    title: notification.title,
    body: notification.body,
    createdAt: notification.createdAt ?? new Date().toISOString(),
    isRead: false,
  };
};
