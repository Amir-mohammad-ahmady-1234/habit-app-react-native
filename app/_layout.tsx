import AuthProvider, { useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useAuth();
  const router = useRouter();
  const segment = useSegments();

  useEffect(() => {
    const isAuthGroup = segment[0] === "auth";

    if (!user && !isAuthGroup && !isUserLoading) {
      router.replace("/auth");
    } else if (user && isAuthGroup && !isUserLoading) {
      router.replace("/");
    }
  }, [router, segment, user, isUserLoading]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView>
      <AuthProvider>
        <PaperProvider theme={DefaultTheme}>
          <SafeAreaProvider>
            <RouteGuard>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              </Stack>
            </RouteGuard>
          </SafeAreaProvider>
        </PaperProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
