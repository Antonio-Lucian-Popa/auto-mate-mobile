import "../../global.css";
import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { useCarStore } from "@/stores/carStore";
import { useSettingsStore } from "@/stores/settingsStore";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function useProtectedRoute() {
  const status = useAuthStore((s) => s.status);
  const onboarded = useSettingsStore((s) => s.onboarded);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (status === "idle" || status === "loading") return;
    const inAuthGroup = segments[0] === "(auth)";
    const inOnboarding = segments[0] === "onboarding";

    if (status === "unauthenticated") {
      if (!onboarded && !inOnboarding) {
        router.replace("/onboarding");
      } else if (onboarded && !inAuthGroup && !inOnboarding) {
        router.replace("/(auth)/login");
      }
    } else if (status === "authenticated" && (inAuthGroup || inOnboarding)) {
      router.replace("/(tabs)");
    }
  }, [status, segments, onboarded]);
}

function RootNavigator() {
  useProtectedRoute();
  const status = useAuthStore((s) => s.status);

  if (status === "idle" || status === "loading") {
    return (
      <View className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator color="#5B8DEF" size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#0B0F19" }, animation: "slide_from_right" }}>
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
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
