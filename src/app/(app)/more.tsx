import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useRouter } from 'expo-router';
import { Alert, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '../../components';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  iconBg: string;
  onPress: () => void;
};

export default function More() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      id: 'profile',
      label: 'User Profile',
      icon: 'user-circle-o',
      iconBg: colors.secondary,
      onPress: () => router.push('/(app)/profile'),
    },
    {
      id: 'notifications',
      label: 'Push Notifications',
      icon: 'bell-o',
      iconBg: colors.secondary,
      onPress: () => router.push('/(app)/settings'),
    },
    {
      id: 'logout',
      label: 'Logout',
      icon: 'sign-out',
      iconBg: colors.primary,
      onPress: handleLogout,
    },
  ];

  const displayName = user?.name || 'User';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={16} color={colors.primaryForeground} />
        </Pressable>
        <AppText variant="semibold" style={styles.headerTitle}>Profile</AppText>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?img=8' }}
              style={styles.avatar}
            />
            <Pressable style={styles.editBadge}>
              <FontAwesome name="pencil" size={12} color={colors.primaryForeground} />
            </Pressable>
          </View>
          <AppText variant="semibold" style={styles.userName}>{displayName}</AppText>
        </View>

        {/* Menu card */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <Pressable
              key={item.id}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={item.onPress}
            >
              <View style={[styles.iconCircle, { backgroundColor: item.iconBg }]}>
                <FontAwesome name={item.icon} size={18} color={colors.secondaryForeground} />
              </View>
              <AppText variant="medium" style={styles.menuLabel}>{item.label}</AppText>
              {item.id !== 'logout' && (
                <FontAwesome name="angle-right" size={18} color={colors.textTertiary} />
              )}
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: fontSize.xl,
    color: colors.textPrimary,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: colors.secondary,
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  userName: {
    fontSize: fontSize.xxl,
    color: colors.textPrimary,
  },
  menuCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.secondary,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
});
