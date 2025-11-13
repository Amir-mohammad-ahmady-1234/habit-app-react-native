import AuthProvider, { useAuth } from "@/lib/auth-context";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

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
    <AuthProvider>
      <RouteGuard>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </RouteGuard>
    </AuthProvider>
  );
}
