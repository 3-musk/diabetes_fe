import { useFonts } from 'expo-font';
import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { APP_PATHS, ROUTES } from "../constants/routes";
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from "../context/AuthContext";

// Prevent splash screen from hiding automatically
SplashScreen.preventAutoHideAsync();

function AuthRouter({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, isNewUser, isFirstTimeUser, isSubscriptionActive, hasDismissedSubscription } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [loaded] = useFonts({
    'Chillax-Regular': require('../../assets/fonts/Chillax-Regular.otf'),
    'Chillax-Medium': require('../../assets/fonts/Chillax-Medium.otf'),
    'Chillax-Semibold': require('../../assets/fonts/Chillax-Semibold.otf'),
    'Chillax-Bold': require('../../assets/fonts/Chillax-Bold.otf'),
  });

  useEffect(() => {
    if (isLoading || !loaded) return;

    // Hide splash screen once fonts and auth state are loaded
    SplashScreen.hideAsync();

    // Auth flow routing logic
    if (!isLoggedIn) {
      // Not logged in -> go to login
      if (pathname !== ROUTES.login) {
        router.replace(ROUTES.login);
      }
      return;
    }

    if (isNewUser) {
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
  }, [isLoading, loaded, isLoggedIn, isNewUser, isFirstTimeUser, isSubscriptionActive, hasDismissedSubscription, pathname, router]);

  if (isLoading || !loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="(app)" />
      <Stack.Screen name="profile" options={{ presentation: 'transparentModal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthRouter>
        <RootLayoutNav />
      </AuthRouter>
    </AuthProvider>
  );
}
