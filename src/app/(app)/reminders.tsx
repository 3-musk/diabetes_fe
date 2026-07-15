import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../../context/AlertContext';

import { AppText, Button, PageHeader, ReminderData, ReminderModal, ScreenContainer } from '../../components';
import { reminders as REMINDERSCONSTANTS } from '../../constants/reminders';
import { deleteReminder, getReminders, saveReminder } from '../../services/reminderService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

export default function RemindersScreen() {
  const { alert } = useAlert();
  const insets = useSafeAreaInsets();

  const [items, setItems] = useState<ReminderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ReminderData | null>(null);
  const pageRef = useRef(0);
  const isFetchingRef = useRef(false);

  const fetchPage = useCallback(async (page: number, replace: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (replace) setLoading(true);
    else setLoadingMore(true);

    const result = await getReminders(page);

    setItems(prev => replace ? result.items : [...prev, ...result.items]);
    setHasNext(result.hasNext);
    pageRef.current = page;

    if (replace) setLoading(false);
    else setLoadingMore(false);

    isFetchingRef.current = false;
  }, []);

  // Load on mount
  useState(() => { fetchPage(0, true); });

  const handleLoadMore = useCallback(() => {
    if (!hasNext || loadingMore || loading) return;
    fetchPage(pageRef.current + 1, false);
  }, [hasNext, loadingMore, loading, fetchPage]);

  const handleAddPress = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleEditPress = (item: ReminderData) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleDeletePress = (item: ReminderData) => {
    alert(
      REMINDERSCONSTANTS.deleteConfirmTitle,
      REMINDERSCONSTANTS.deleteConfirmMessage,
      [
        { text: REMINDERSCONSTANTS.cancelBtn, style: 'cancel' },
        {
          text: REMINDERSCONSTANTS.deleteBtn,
          style: 'destructive',
          onPress: async () => {
            if (item.id) {
              await deleteReminder(item.id);
              setItems(prev => prev.filter(r => r.id !== item.id));
            }
          },
        },
      ]
    );
  };

  const handleSaveReminder = async (data: ReminderData) => {
    const saved = await saveReminder(data);
    setItems(prev => {
      const exists = prev.find(r => r.id === saved.id);
      if (exists) return prev.map(r => (r.id === saved.id ? saved : r));
      return [saved, ...prev];
    });
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: ReminderData }) => (
    <View style={s.card}>
      <View style={s.cardContent}>
        <AppText variant="semibold" style={s.cardTitle}>{item.title}</AppText>
        <AppText style={s.cardSubtitle}>
          {item.frequency === 'Custom' && item.days.length > 0
            ? item.days.join(', ')
            : item.frequency}
        </AppText>
        <AppText style={s.cardTime}>
          {item.hour}:{item.minute} {item.period}
        </AppText>
      </View>
      <View style={s.cardActions}>
        <Pressable style={s.iconBtn} onPress={() => handleEditPress(item)}>
          <FontAwesome name="pencil" size={18} color={colors.primary} />
        </Pressable>
        <Pressable style={[s.iconBtn, s.deleteBtn]} onPress={() => handleDeletePress(item)}>
          <FontAwesome name="trash" size={18} color={colors.error} />
        </Pressable>
      </View>
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
      {/* Header */}
      <PageHeader title={REMINDERSCONSTANTS.pageTitle} />

      {/* List */}
      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 100 }]}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <AppText style={s.emptyText}>{REMINDERSCONSTANTS.emptyState}</AppText>
            </View>
          }
        />
      )}

      {/* Footer Add Button */}
      <View style={[s.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button
          title={REMINDERSCONSTANTS.addBtn}
          onPress={handleAddPress}
          size="lg"
          style={s.addBtnFull}
        />
      </View>

      {/* Modal */}
      <ReminderModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveReminder}
        initialData={editingItem}
      />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  cardTime: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEF3E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: { backgroundColor: '#FFEBEE' },
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
  addBtnFull: { borderRadius: borderRadius.full },
  footerLoader: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
