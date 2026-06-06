import { View, Text } from "react-native";
import { Fuel, Wrench, ShieldCheck, MoreHorizontal } from "lucide-react-native";
import { COST_CATEGORIES } from "@/constants";
import { formatRON } from "@/lib/format";
import { formatDate } from "@/lib/date";
import type { Cost } from "@/types";

const ICONS: Record<string, any> = { FUEL: Fuel, SERVICE: Wrench, INSURANCE: ShieldCheck };

export function CostTimelineItem({ cost, last }: { cost: Cost; last?: boolean }) {
  const cat = COST_CATEGORIES.find((c) => c.value === cost.category);
  const Icon = ICONS[cost.category] ?? MoreHorizontal;
  const color = cat?.color ?? "#6B7693";
  return (
    <View className="flex-row gap-4">
      <View className="items-center">
        <View className="w-10 h-10 rounded-2xl items-center justify-center" style={{ backgroundColor: color + "22" }}>
          <Icon size={18} color={color} />
        </View>
        {!last && <View className="w-0.5 flex-1 bg-line my-1" />}
      </View>
      <View className="flex-1 pb-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-ink font-semibold">{cat?.label ?? "Cost"}</Text>
          <Text className="text-ink font-bold">{formatRON(cost.amount)}</Text>
        </View>
        <Text className="text-ink-faint text-xs mt-0.5">
          {formatDate(cost.date)}{cost.vendor ? ` · ${cost.vendor}` : ""}
        </Text>
        {cost.notes ? <Text className="text-ink-soft text-sm mt-1">{cost.notes}</Text> : null}
      </View>
    </View>
  );
}
