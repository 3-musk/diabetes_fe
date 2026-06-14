export type AppNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
};

let mockNotifications: AppNotification[] = [
  {
    id: '1',
    title: 'Glucose reminder',
    body: 'Time to log your post-meal glucose reading.',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    isRead: false,
  },
  {
    id: '2',
    title: 'Care plan updated',
    body: 'Your personalized care plan has new meal recommendations.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    isRead: false,
  },
  {
    id: '3',
    title: 'Medication reminder',
    body: 'Take Metformin 500mg with your evening meal.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isRead: true,
  },
  {
    id: '4',
    title: 'Weekly summary ready',
    body: 'Your glucose trends for the past 7 days are available.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    isRead: true,
  },
];

const delay = (ms = 400) => new Promise(resolve => setTimeout(resolve, ms));

export const getNotifications = async (): Promise<AppNotification[]> => {
  await delay();
  return [...mockNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export const markNotificationAsRead = async (id: string): Promise<AppNotification | null> => {
  await delay(200);
  const index = mockNotifications.findIndex(notification => notification.id === id);
  if (index === -1) return null;

  mockNotifications[index] = { ...mockNotifications[index], isRead: true };
  return mockNotifications[index];
};

export const markAllNotificationsAsRead = async (): Promise<AppNotification[]> => {
  await delay(200);
  mockNotifications = mockNotifications.map(notification => ({
    ...notification,
    isRead: true,
  }));
  return [...mockNotifications];
};

export const addPushNotification = async (
  notification: Pick<AppNotification, 'title' | 'body'> & { createdAt?: string }
): Promise<AppNotification> => {
  await delay(100);
  const newNotification: AppNotification = {
    id: Date.now().toString(),
    title: notification.title,
    body: notification.body,
    createdAt: notification.createdAt ?? new Date().toISOString(),
    isRead: false,
  };
  mockNotifications.unshift(newNotification);
  return newNotification;
};
