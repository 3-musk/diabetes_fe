import { useFonts } from 'expo-font';
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { APP_PATHS, ROUTES } from "../constants/routes";
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from "../context/AuthContext";
import { AlertProvider } from "../context/AlertContext";
import { colors, spacing, fontSize, borderRadius, fontWeight } from "../theme";
import { checkMaintenanceMode } from "../utils/deviceAndConfig";
import { AppText, Button } from "../components";
import { FontAwesome } from '@react-native-vector-icons/fontawesome';

// Prevent splash screen from hiding automatically
SplashScreen.preventAutoHideAsync();

function MaintenanceScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <View style={styles.maintenanceContainer}>
      <View style={styles.maintenanceCard}>
        <View style={styles.maintenanceIconContainer}>
          <FontAwesome name="wrench" size={48} color={colors.primary} />
        </View>
        <AppText variant="semibold" style={styles.maintenanceTitle}>
          App Under Maintenance
        </AppText>
        <AppText variant="medium" style={styles.maintenanceSubtitle}>
          The app is currently undergoing scheduled maintenance. Please try again later.
        </AppText>
        <Button
          title="Try Again"
          onPress={onRetry}
          variant="primary"
          style={styles.maintenanceButton}
        />
      </View>
    </View>
  );
}

function AuthRouter({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, isFirstTimeUser, isSubscriptionActive, hasDismissedSubscription, tempToken, accessToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isConfigLoading, setIsConfigLoading] = useState(true);

  const runMaintenanceCheck = async () => {
    try {
      const maintenance = await checkMaintenanceMode();
      setIsMaintenance(maintenance);
    } catch (e) {
      console.error('Failed to run maintenance check:', e);
      setIsMaintenance(true);
    } finally {
      setIsConfigLoading(false);
    }
  };

  useEffect(() => {
    runMaintenanceCheck();
  }, []);

  const [loaded] = useFonts({
    'Chillax-Regular': require('../../assets/fonts/Chillax-Regular.otf'),
    'Chillax-Medium': require('../../assets/fonts/Chillax-Medium.otf'),
    'Chillax-Semibold': require('../../assets/fonts/Chillax-Semibold.otf'),
    'Chillax-Bold': require('../../assets/fonts/Chillax-Bold.otf'),
  });

  useEffect(() => {
    if (isLoading || !loaded || isConfigLoading) return;

    // Hide splash screen once fonts, auth, and config are loaded
    SplashScreen.hideAsync();

    if (isMaintenance) return;

    // Auth flow routing logic
    if (!isLoggedIn) {
      // Not logged in -> go to login
      if (pathname !== ROUTES.login) {
        router.replace(ROUTES.login);
      }
      return;
    }

    if (tempToken && !accessToken) {
      // Logged in but not registered -> go to register
      if (pathname !== ROUTES.register) {
        router.replace(ROUTES.register);
      }
      return;
    }

    // Registered user
    if (isFirstTimeUser) {
      // If first-time user and subscription is inactive, force them to stay on subscription/payment screen.
      if (!isSubscriptionActive) {
        if (pathname !== ROUTES.subscription && pathname !== ROUTES.payment) {
          router.replace(ROUTES.subscription);
        }
      } else {
        // Subscription active: route/allow them on home or valid app paths.
        if (!APP_PATHS.includes(pathname as (typeof APP_PATHS)[number])) {
          router.replace(ROUTES.appHome);
        }
      }
    } else {
      // Existing user (isFirstTimeUser is false)
      if (!isSubscriptionActive) {
        // If they have not dismissed subscription yet, route to subscription screen.
        if (!hasDismissedSubscription) {
          if (pathname !== ROUTES.subscription && pathname !== ROUTES.payment) {
            router.replace(ROUTES.subscription);
          }
        } else {
          // If dismissed, allow on valid app paths.
          if (!APP_PATHS.includes(pathname as (typeof APP_PATHS)[number]) && pathname !== ROUTES.subscription) {
            router.replace(ROUTES.appHome);
          }
        }
      } else {
        // Subscription active: allow to home or valid app paths.
        if (!APP_PATHS.includes(pathname as (typeof APP_PATHS)[number])) {
          router.replace(ROUTES.appHome);
        }
      }
    }
  }, [isLoading, loaded, isConfigLoading, isMaintenance, isLoggedIn, tempToken, accessToken, isFirstTimeUser, isSubscriptionActive, hasDismissedSubscription, pathname, router]);

  if (isLoading || !loaded || isConfigLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (isMaintenance) {
    return (
      <MaintenanceScreen
        onRetry={() => {
          setIsConfigLoading(true);
          runMaintenanceCheck();
        }}
      />
    );
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background);
  }, []);

  return (
    <SafeAreaProvider>
      <AlertProvider>
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <AuthProvider>
            <AuthRouter>
              <RootLayoutNav />
            </AuthRouter>
          </AuthProvider>
        </View>
      </AlertProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  maintenanceContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  maintenanceCard: {
    backgroundColor: colors.primaryBackground || '#FFFFFF',
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  maintenanceIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  maintenanceTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  maintenanceSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.xl,
  },
  maintenanceButton: {
    width: '100%',
  },
});
