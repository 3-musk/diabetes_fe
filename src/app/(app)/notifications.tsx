import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BackButton, ScreenContainer } from '../../components';
import { notifications as NOTIFICATIONS_CONSTANTS } from '../../constants/notifications';
import {
  AppNotification,
  getNotifications,
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

  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const pageRef = useRef(0);
  const isFetchingRef = useRef(false);

  const handleBack = useCallback(() => {
    if (returnTo) router.navigate(returnTo as any);
    else router.back();
  }, [router, returnTo]);

  const fetchPage = useCallback(async (page: number, replace: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (replace) setLoading(true);
    else setLoadingMore(true);

    const result = await getNotifications(page);

    setItems(prev => replace ? result.items : [...prev, ...result.items]);
    setHasNext(result.hasNext);
    pageRef.current = page;

    if (replace) setLoading(false);
    else setLoadingMore(false);

    isFetchingRef.current = false;
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPage(0, true);
    }, [fetchPage])
  );

  const handleLoadMore = useCallback(() => {
    if (!hasNext || loadingMore || loading) return;
    fetchPage(pageRef.current + 1, false);
  }, [hasNext, loadingMore, loading, fetchPage]);

  const handleMarkAsRead = async (id: string) => {
    const updated = await markNotificationAsRead(id);
    if (!updated) return;
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, isRead: true } : item))
    );
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <View style={[s.card, !item.isRead && s.cardUnread]}>
      <View style={s.cardHeader}>
        <View style={s.titleRow}>
          {!item.isRead && <View style={s.unreadDot} />}
          <AppText
            variant={item.isRead ? 'medium' : 'semibold'}
            style={s.cardTitle}
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
      <AppText style={s.cardTime}>{formatTimestamp(item.createdAt)}</AppText>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={s.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <ScreenContainer edges={['top']}>
      <View style={s.header}>
        <BackButton color={colors.primaryBackground} onPress={handleBack} />
        <AppText variant="semibold" style={s.headerTitle}>
          {NOTIFICATIONS_CONSTANTS.pageTitle}
        </AppText>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + spacing.xl }]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <FontAwesome name="bell-o" size={32} color={colors.textTertiary} />
              <AppText style={s.emptyText}>{NOTIFICATIONS_CONSTANTS.emptyAll}</AppText>
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
  listContent: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    paddingTop: spacing.sm,
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
    marginBottom: spacing.xs,
  },
  titleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  markReadText: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: '600',
    flexShrink: 0,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    flexShrink: 0,
  },
  cardTitle: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  cardTime: {
    fontSize: fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
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
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
