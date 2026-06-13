import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BackButton, PillTabs, ScreenContainer } from '../../components';
import {
  NOTIFICATION_FILTERS,
  NotificationFilter,
  notifications as NOTIFICATIONS_CONSTANTS,
} from '../../constants/notifications';
import {
  AppNotification,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '../../services/notificationService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString();
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<NotificationFilter>('All');
  const [markingAll, setMarkingAll] = useState(false);

  const handleBack = useCallback(() => {
    if (returnTo) {
      router.navigate(returnTo as any);
    } else {
      router.back();
    }
  }, [router, returnTo]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const data = await getNotifications();
    setItems(data);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const filteredItems = useMemo(() => {
    if (filter === 'Unread') return items.filter(item => !item.isRead);
    if (filter === 'Read') return items.filter(item => item.isRead);
    return items;
  }, [filter, items]);

  const unreadCount = useMemo(
    () => items.filter(item => !item.isRead).length,
    [items]
  );

  const emptyMessage =
    filter === 'Unread'
      ? NOTIFICATIONS_CONSTANTS.emptyUnread
      : filter === 'Read'
        ? NOTIFICATIONS_CONSTANTS.emptyRead
        : NOTIFICATIONS_CONSTANTS.emptyAll;

  const handleMarkAsRead = async (id: string) => {
    const updated = await markNotificationAsRead(id);
    if (!updated) return;

    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    setMarkingAll(true);
    const updated = await markAllNotificationsAsRead();
    setItems(updated);
    setMarkingAll(false);
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <View style={[s.card, !item.isRead && s.cardUnread]}>
      <View style={s.cardHeader}>
        <View style={s.titleRow}>
          {!item.isRead && <View style={s.unreadDot} />}
          <AppText
            variant={item.isRead ? 'medium' : 'semibold'}
            style={[s.cardTitle, !item.isRead && s.cardTitleUnread]}
          >
            {item.title}
          </AppText>
        </View>
        {!item.isRead && (
          <Pressable onPress={() => handleMarkAsRead(item.id)} hitSlop={8}>
            <AppText style={s.markReadText}>{NOTIFICATIONS_CONSTANTS.markAsRead}</AppText>
          </Pressable>
        )}
      </View>

      <AppText style={s.cardBody}>{item.body}</AppText>
      <AppText style={s.cardTime}>{formatTimestamp(item.createdAt)}</AppText>
    </View>
  );

  return (
    <ScreenContainer edges={['top']}>
      <View style={s.header}>
        <BackButton color={colors.primaryBackground} onPress={handleBack} />
        <AppText variant="semibold" style={s.headerTitle}>
          {NOTIFICATIONS_CONSTANTS.pageTitle}
        </AppText>
        {unreadCount > 0 && (
          <Pressable
            style={s.markAllBtn}
            onPress={handleMarkAllAsRead}
            disabled={markingAll}
          >
            <AppText variant="medium" style={s.markAllText}>
              {NOTIFICATIONS_CONSTANTS.markAllAsRead}
            </AppText>
          </Pressable>
        )}
      </View>

      <PillTabs
        options={NOTIFICATION_FILTERS}
        selected={filter}
        onSelect={setFilter}
        style={s.filters}
      />

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + spacing.xl }]}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <FontAwesome name="bell-o" size={32} color={colors.textTertiary} />
              <AppText style={s.emptyText}>{emptyMessage}</AppText>
            </View>
          }
        />
      )}
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  headerTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  markAllBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  markAllText: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  filters: {
    paddingHorizontal: spacing.xl,
    marginTop: 0,
    marginBottom: spacing.sm,
    justifyContent: 'flex-start',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardUnread: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondarybackground,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  cardTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  cardTitleUnread: {
    color: colors.textPrimary,
  },
  markReadText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
  },
  cardBody: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  cardTime: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
