import { Pressable, Text, View } from "react-native";
import * as Haptics from "expo-haptics";

export function QuickAction({ icon, label, onPress, accent = "#5B8DEF" }: { icon: React.ReactNode; label: string; onPress: () => void; accent?: string }) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      className="items-center gap-2 active:opacity-70"
      style={{ width: 72 }}
    >
      <View className="w-14 h-14 rounded-2xl items-center justify-center border border-line" style={{ backgroundColor: accent + "1A" }}>
        {icon}
      </View>
      <Text className="text-ink-soft text-xs text-center" numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}
