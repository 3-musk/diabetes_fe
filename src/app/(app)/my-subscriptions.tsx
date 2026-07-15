import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, Button, PageHeader, ScreenContainer } from '../../components';
import { ROUTES } from '../../constants/routes';
import { subscriptionTexts } from '../../constants/subscription';
import { apiClient } from '../../utils/apiClient';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

type SubscriptionPlan = {
  planName: string;
  startDate: string;
  endDate: string;
  status: string;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
};

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':   return { bg: '#E6F9EE', text: '#1A8C4E' };
    case 'expired':  return { bg: '#FFEBEE', text: '#C62828' };
    case 'cancelled': return { bg: '#FFF3E0', text: '#E65100' };
    default:         return { bg: colors.secondarybackground, text: colors.textSecondary };
  }
};

const getSubscriptions = async (): Promise<SubscriptionPlan[]> => {
  try {
    const response = await apiClient.get('/api/ecommerce/subscriptions');
    if (response.data?.success && response.data?.data?.plans) {
      return response.data.data.plans;
    }
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
  }
  return [];
};

export default function MySubscriptionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    const data = await getSubscriptions();
    setPlans(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPlans(); }, [fetchPlans]);

  const renderItem = ({ item }: { item: SubscriptionPlan }) => {
    const sc = statusColor(item.status);
    return (
      <View style={s.card}>
        {/* Top row: plan name + status pill */}
        <View style={s.cardTop}>
          <AppText variant="semibold" style={s.planName} numberOfLines={2}>
            {item.planName}
          </AppText>
          <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
            <AppText style={[s.statusText, { color: sc.text }]}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </AppText>
          </View>
        </View>

        {/* Date rows */}
        <View style={s.divider} />
        <View style={s.dateRow}>
          <AppText style={s.dateLabel}>{subscriptionTexts.startDate}</AppText>
          <AppText variant="medium" style={s.dateValue}>{formatDate(item.startDate)}</AppText>
        </View>
        <View style={s.dateRow}>
          <AppText style={s.dateLabel}>{subscriptionTexts.endDate}</AppText>
          <AppText variant="medium" style={s.dateValue}>{formatDate(item.endDate)}</AppText>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer edges={['top']}>
      <PageHeader title={subscriptionTexts.mySubscription} />

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={(item, i) => `${item.planName}-${i}`}
          renderItem={renderItem}
          contentContainerStyle={[s.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <AppText style={s.emptyText}>{subscriptionTexts.noSubscriptions}</AppText>
            </View>
          }
        />
      )}

      {/* Docked footer button */}
      <View style={[s.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          title={subscriptionTexts.viewPlans}
          size="lg"
          style={s.footerBtn}
          onPress={() => router.push(ROUTES.subscription as any)}
        />
      </View>
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  planName: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    flexShrink: 0,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dateLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  dateValue: {
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerBtn: {
    borderRadius: borderRadius.full,
  },
});
