import { View, Text, Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";

type Props = { title: string; subtitle?: string; right?: React.ReactNode; back?: boolean };

export function ScreenHeader({ title, subtitle, right, back }: Props) {
  return (
    <View className="flex-row items-center justify-between mb-5">
      <View className="flex-row items-center gap-3 flex-1">
        {back && (
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 rounded-xl bg-bg-card border border-line items-center justify-center active:opacity-70"
          >
            <ChevronLeft size={22} color="#F4F7FF" />
          </Pressable>
        )}
        <View className="flex-1">
          <Text className="text-ink text-2xl font-bold" numberOfLines={1}>{title}</Text>
          {subtitle && <Text className="text-ink-soft text-sm">{subtitle}</Text>}
        </View>
      </View>
      {right}
    </View>
  );
}
