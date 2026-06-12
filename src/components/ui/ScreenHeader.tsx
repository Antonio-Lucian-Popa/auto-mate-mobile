import { View, Text, Pressable } from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { router } from "expo-router";
import { cn } from "@/lib/cn";

type Props = { title: string; subtitle?: string; right?: React.ReactNode; back?: boolean; onBack?: () => void; inset?: boolean };

export function ScreenHeader({ title, subtitle, right, back, onBack, inset = true }: Props) {
  const showBack = back || onBack;
  return (
    <View className={cn("flex-row items-center justify-between mb-5 min-h-12", inset && "px-5 pt-2")}>
      <View className="flex-row items-center gap-3 flex-1 min-h-12">
        {showBack && (
          <Pressable
            onPress={onBack ?? (() => router.back())}
            className="w-11 h-11 rounded-xl bg-bg-card border border-line items-center justify-center active:opacity-70"
          >
            <ChevronLeft size={22} color="#F4F7FF" />
          </Pressable>
        )}
        <View className="flex-1 justify-center">
          <Text className="text-ink text-2xl font-bold leading-8" numberOfLines={1}>{title}</Text>
          {subtitle && <Text className="text-ink-soft text-sm">{subtitle}</Text>}
        </View>
      </View>
      {right ? <View className="ml-3">{right}</View> : null}
    </View>
  );
}
