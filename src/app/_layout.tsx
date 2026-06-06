import "../../global.css";
import { useEffect } from "react";
import { Stack, useRootNavigationState, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { useCarStore } from "@/stores/carStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { colors } from "@/constants/theme";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

export const unstable_settings = {
  initialRouteName: "index",
};

function useProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  const onboarded = useSettingsStore((s) => s.onboarded);
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;
    if (status === "idle" || status === "loading") return;
    const firstSegment = segments[0] as string | undefined;
    const atRoot = !firstSegment || firstSegment === "index";
    const inAuthGroup = firstSegment === "(auth)";
    const inOnboarding = firstSegment === "onboarding";

    if (status === "unauthenticated") {
      if (!onboarded && !inOnboarding) {
        router.replace("/onboarding");
      } else if (onboarded && !inAuthGroup && !inOnboarding) {
        router.replace("/(auth)/login");
      }
    } else if (status === "authenticated" && (atRoot || inAuthGroup || inOnboarding)) {
      router.replace("/(tabs)");
    }
  }, [status, segments, onboarded, navigationState?.key]);
}

function RootNavigator() {
  useProtectedRoute();

  return (
    <Stack initialRouteName="index" screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0B0F19" }, animation: "slide_from_right" }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="car" />
      <Stack.Screen name="reminders" />
      <Stack.Screen name="costs" />
      <Stack.Screen name="fuel" />
      <Stack.Screen name="receipts" options={{ presentation: "modal" }} />
      <Stack.Screen name="documents" />
    </Stack>
  );
}

export default function RootLayout() {
  const bootstrap = useAuthStore((s) => s.bootstrap);
  const loadSelected = useCarStore((s) => s.loadSelected);
  const hydrate = useSettingsStore((s) => s.hydrate);

  useEffect(() => {
    bootstrap();
    loadSelected();
    hydrate();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar style="light" backgroundColor={colors.bg} translucent={false} />
            <RootNavigator />
          </View>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
