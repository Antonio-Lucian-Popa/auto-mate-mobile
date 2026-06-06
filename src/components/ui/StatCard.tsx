import { View, Text } from "react-native";
import { AppCard } from "./AppCard";

type Props = { label: string; value: string; sub?: string; icon?: React.ReactNode; accent?: string };

export function StatCard({ label, value, sub, icon, accent = "#5B8DEF" }: Props) {
  return (
    <AppCard className="flex-1">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-ink-faint text-xs uppercase tracking-wide">{label}</Text>
        {icon && (
          <View className="w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: accent + "22" }}>
            {icon}
          </View>
        )}
      </View>
      <Text className="text-ink text-2xl font-bold">{value}</Text>
      {sub && <Text className="text-ink-soft text-xs mt-1">{sub}</Text>}
    </AppCard>
  );
}
