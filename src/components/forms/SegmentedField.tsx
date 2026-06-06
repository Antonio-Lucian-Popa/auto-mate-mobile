import { View, Text, Pressable, ScrollView } from "react-native";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string };

export function SegmentedField({ label, options, value, onChange }: { label?: string; options: Option[]; value: string; onChange: (v: string) => void }) {
  return (
    <View className="gap-2">
      {label && <Text className="text-ink-soft text-sm font-medium">{label}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              className={cn(
                "px-4 h-11 rounded-2xl items-center justify-center border",
                active ? "bg-brand border-brand" : "bg-bg-soft border-line"
              )}
            >
              <Text className={cn("font-medium text-sm", active ? "text-white" : "text-ink-soft")}>{o.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
