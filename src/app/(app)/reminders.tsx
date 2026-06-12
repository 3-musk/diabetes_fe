import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText, BackButton, Button, ReminderData, ReminderModal, ScreenContainer } from '../../components';
import { reminders as REMINDERSCONSTANTS } from '../../constants/reminders';
import { deleteReminder, getReminders, saveReminder } from '../../services/reminderService';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

export default function RemindersScreen() {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ReminderData[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ReminderData | null>(null);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    setLoading(true);
    const data = await getReminders();
    setItems(data);
    setLoading(false);
  };

  const handleAddPress = () => {
    setEditingItem(null);
    setModalVisible(true);
  };

  const handleEditPress = (item: ReminderData) => {
    setEditingItem(item);
    setModalVisible(true);
  };

  const handleDeletePress = (item: ReminderData) => {
    Alert.alert(
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
      if (exists) {
        return prev.map(r => (r.id === saved.id ? saved : r));
      }
      return [...prev, saved];
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

  return (
    <ScreenContainer edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <BackButton color={colors.primaryBackground} />
        <AppText variant="semibold" style={s.headerTitle}>{REMINDERSCONSTANTS.pageTitle}</AppText>
      </View>

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
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.md
  },
  headerTitle: { fontSize: fontSize.lg, color: colors.textPrimary },
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
  cardContent: {
    flex: 1,
  },
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
  deleteBtn: {
    backgroundColor: '#FFEBEE',
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
  addBtnFull: {
    borderRadius: borderRadius.full,
  },
});
