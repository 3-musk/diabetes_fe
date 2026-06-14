export const NOTIFICATION_FILTERS = ['All', 'Unread', 'Read'] as const;

export type NotificationFilter = typeof NOTIFICATION_FILTERS[number];

export const notifications = {
  pageTitle: 'Notifications',
  markAsRead: 'Mark as read',
  markAllAsRead: 'Mark all as read',
  emptyAll: 'No notifications yet.',
  emptyUnread: 'No unread notifications.',
  emptyRead: 'No read notifications.',
  unreadLabel: 'Unread',
};
