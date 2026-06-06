import { View, Text } from "react-native";
import { Fuel, Gauge, TrendingDown } from "lucide-react-native";
import { AppCard } from "@/components/ui/AppCard";
import { formatNumber, formatRON } from "@/lib/format";

type Props = { avgConsumption: number | null; avgPrice: number | null; monthlyCost: number };

export function FuelSummaryCard({ avgConsumption, avgPrice, monthlyCost }: Props) {
  return (
    <AppCard>
      <View className="flex-row items-center gap-2 mb-4">
        <Fuel size={18} color="#5B8DEF" />
        <Text className="text-ink font-semibold">Sumar alimentări</Text>
      </View>
      <View className="flex-row justify-between">
        <View className="items-center flex-1 gap-1">
          <Gauge size={18} color="#7FA8FF" />
          <Text className="text-ink text-lg font-bold">{avgConsumption ? `${formatNumber(avgConsumption, 1)}` : "—"}</Text>
          <Text className="text-ink-faint text-xs">L / 100 km</Text>
        </View>
        <View className="w-px bg-line" />
        <View className="items-center flex-1 gap-1">
          <TrendingDown size={18} color="#34D399" />
          <Text className="text-ink text-lg font-bold">{avgPrice ? formatNumber(avgPrice, 2) : "—"}</Text>
          <Text className="text-ink-faint text-xs">RON / litru</Text>
        </View>
        <View className="w-px bg-line" />
        <View className="items-center flex-1 gap-1">
          <Fuel size={18} color="#FBBF24" />
          <Text className="text-ink text-lg font-bold">{formatRON(monthlyCost)}</Text>
          <Text className="text-ink-faint text-xs">luna curentă</Text>
        </View>
      </View>
    </AppCard>
  );
}
