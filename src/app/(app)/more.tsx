import { FontAwesome } from '@react-native-vector-icons/fontawesome';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAlert } from '../../context/AlertContext';
import { AppText, BackButton, Button, ScreenContainer } from '../../components';
import { more as MORECONSTANTS } from '../../constants/more';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import { borderRadius, colors, fontSize, shadows, spacing } from '../../theme';
import { SvgIcon } from '../../utils/icon';

type MenuItem = {
  id: string;
  label: string;
  icon: any;
  iconBg: string;
  iconColor?: string;
  onPress: () => void;
};

export default function More() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { alert } = useAlert();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    alert(MORECONSTANTS.logoutAlertTitle, MORECONSTANTS.logoutAlertMessage, [
      { text: MORECONSTANTS.cancelBtn, style: 'cancel' },
      {
        text: MORECONSTANTS.logoutBtn,
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
      label: MORECONSTANTS.menuUserProfile,
      icon: require('../../../assets/svgs/more/user_profile.svg'),
      iconBg: colors.secondary,
      // iconColor: colors.secondaryForeground,
      onPress: () =>
        router.push({
          pathname: ROUTES.appProfile as any,
          params: { returnTo: ROUTES.appMore },
        }),
    },
    {
      id: 'subscription',
      label: MORECONSTANTS.menuMySubscription,
      icon: require('../../../assets/svgs/more/subscription.svg'),
      iconBg: colors.secondary,
      // iconColor: colors.secondaryForeground,
      onPress: () =>
        router.push({
          pathname: ROUTES.subscription as any,
        }),
    },
    {
      id: 'notifications',
      label: MORECONSTANTS.menuPushNotifications,
      icon: require('../../../assets/svgs/more/notification.svg'),
      iconBg: colors.secondary,
      // iconColor: colors.secondaryForeground,
      onPress: () =>
        router.push({
          pathname: ROUTES.appNotifications as any,
          params: { returnTo: ROUTES.appMore },
        }),
    },
    {
      id: 'logout',
      label: MORECONSTANTS.logoutBtn,
      icon: require('../../../assets/svgs/more/logout.svg'),
      iconBg: colors.primary,
      // iconColor: colors.primaryBackground,
      onPress: handleLogout,
    },
  ];

  const displayName = user?.name || 'User';

  return (
    <ScreenContainer edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton color={colors.primaryBackground}/>
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
              <FontAwesome name="pencil" size={12} color={colors.primaryBackground} />
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
                <SvgIcon source={item.icon} size={40} color={item.iconColor} />
              </View>
              <AppText variant="medium" style={styles.menuLabel}>{item.label}</AppText>
              {item.id !== 'logout' && (
                <FontAwesome name="angle-right" size={18} color={colors.textTertiary} />
              )}
            </Pressable>
          ))}
        </View>

        {/* Test Alerts section */}
        <View style={styles.testSection}>
          <AppText variant="semibold" style={styles.testTitle}>Test Alert Dialogs</AppText>
          <View style={styles.buttonRowGrid}>
            <Button
              title="Info Alert"
              size="sm"
              style={{ flex: 1, backgroundColor: colors.primary, borderColor: colors.primary }}
              onPress={() => alert('Information', 'This is a premium custom info alert dialog.', undefined, { type: 'info' })}
            />
            <Button
              title="Success Alert"
              size="sm"
              style={{ flex: 1, backgroundColor: colors.success, borderColor: colors.success }}
              onPress={() => alert('Success', 'The action has completed successfully!', undefined, { type: 'success' })}
            />
          </View>
          <View style={styles.buttonRowGrid}>
            <Button
              title="Warning Alert"
              size="sm"
              style={{ flex: 1, backgroundColor: colors.warning, borderColor: colors.warning }}
              onPress={() => alert('Warning', 'Please proceed with caution.', undefined, { type: 'warning' })}
            />
            <Button
              title="Error Alert"
              size="sm"
              style={{ flex: 1, backgroundColor: colors.error, borderColor: colors.error }}
              onPress={() => alert('Error', 'An unexpected error occurred. Please try again.', undefined, { type: 'error' })}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
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
  testSection: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
  testTitle: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  buttonRowGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
