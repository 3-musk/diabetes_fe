import { Stack, usePathname, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../context/AuthContext";

function AuthRouter({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading, isNewUser, isSubscribed } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Auth flow routing logic
    if (!isLoggedIn) {
      // Not logged in -> go to login
      if (pathname !== "/login") {
        router.replace('/login' as never);
      }
    } else if (isNewUser) {
      // Logged in but not registered -> go to register
      if (pathname !== "/register") {
        router.replace('/register' as never);
      }
    } else {
      // Logged in, registered, and subscribed -> go to app
      if (pathname !== "/" && !pathname?.startsWith("/(app)") && pathname !== "/subscription") {
        router.replace('/(app)' as never);
      }
    }
  }, [isLoading, isLoggedIn, isNewUser, isSubscribed, pathname, router]);

  if (isLoading) {
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
      }}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="(app)" />
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