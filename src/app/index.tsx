import { useEffect } from "react";
import { router, useRootNavigationState } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";

export default function IndexRoute() {
  const status = useAuthStore((s) => s.status);
  const onboarded = useSettingsStore((s) => s.onboarded);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;
    if (status === "idle" || status === "loading") return;

    if (status === "authenticated") {
      router.replace("/(tabs)");
    } else {
      router.replace(onboarded ? "/(auth)/login" : "/onboarding");
    }
  }, [status, onboarded, navigationState?.key]);

  return (
    <View className="flex-1 bg-bg items-center justify-center">
      <ActivityIndicator color="#5B8DEF" size="large" />
    </View>
  );
}
