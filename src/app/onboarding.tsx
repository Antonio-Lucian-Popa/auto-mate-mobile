import { useRef, useState } from "react";
import { View, Text, useWindowDimensions, FlatList, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Car, ScanLine, BellRing } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { AppButton } from "@/components/ui/AppButton";
import { useAuthStore } from "@/stores/authStore";
import { useSettingsStore } from "@/stores/settingsStore";

const SLIDES = [
  { icon: Car, color: "#5B8DEF", title: "Toate mașinile tale într-un singur loc", body: "Garaj, kilometri, documente și istoric — organizate clar, cu un design plăcut și rapid." },
  { icon: ScanLine, color: "#34D399", title: "Scanează bonuri și urmărește costurile", body: "OCR offline citește bonurile de carburant direct pe telefon. Vezi cât cheltui lună de lună." },
  { icon: BellRing, color: "#A78BFA", title: "Primește remindere pentru RCA, ITP și rovinietă", body: "Nu mai uiți niciodată de o expirare. Te anunțăm din timp, cu notificări locale." },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const update = useSettingsStore((s) => s.update);
  const continueAsGuest = useAuthStore((s) => s.continueAsGuest);

  const finish = () => {
    update({ onboarded: true });
    continueAsGuest();
    router.replace("/(tabs)");
  };

  const next = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      finish();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-row justify-end px-5 pt-2">
        <Pressable onPress={finish} className="active:opacity-60 px-3 py-2">
          <Text className="text-ink-soft">Sari peste</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <View style={{ width }} className="items-center justify-center px-10">
              <Animated.View entering={FadeIn.duration(400)} className="items-center gap-6">
                <View className="w-28 h-28 rounded-[2rem] items-center justify-center" style={{ backgroundColor: item.color + "22" }}>
                  <Icon size={52} color={item.color} />
                </View>
                <Text className="text-ink text-3xl font-bold text-center leading-9">{item.title}</Text>
                <Text className="text-ink-soft text-center text-base leading-6">{item.body}</Text>
              </Animated.View>
            </View>
          );
        }}
      />

      <View className="flex-row justify-center gap-2 mb-6">
        {SLIDES.map((_, i) => (
          <View key={i} className={`h-2 rounded-full ${i === index ? "w-6 bg-brand" : "w-2 bg-line"}`} />
        ))}
      </View>

      <View className="px-5 pb-4">
        <AppButton title={index === SLIDES.length - 1 ? "Începe" : "Continuă"} onPress={next} />
      </View>
    </SafeAreaView>
  );
}
