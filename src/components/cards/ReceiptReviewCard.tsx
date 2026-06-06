import { View, Text } from "react-native";
import { Fuel } from "lucide-react-native";
import { AppCard } from "@/components/ui/AppCard";
import { ConfidenceBadge } from "@/components/ui/ConfidenceBadge";
import { formatRON } from "@/lib/format";

type Conf = "high" | "medium" | "low";

/**
 * Card sumar premium pentru un bon scanat. Totalul e evidentiat,
 * iar fiecare camp-cheie are un badge de incredere.
 */
export function ReceiptReviewCard({
  merchant,
  total,
  confidenceTotal,
  confidenceMerchant,
}: {
  merchant?: string;
  total?: number;
  confidenceTotal: Conf;
  confidenceMerchant: Conf;
}) {
  return (
    <AppCard className="items-center py-6">
      <View className="w-16 h-16 rounded-3xl bg-brand/15 border border-brand/30 items-center justify-center mb-3">
        <Fuel size={28} color="#5B8DEF" />
      </View>
      <View className="flex-row items-center gap-2">
        <Text className="text-ink text-lg font-bold">{merchant ?? "Stație necunoscută"}</Text>
        <ConfidenceBadge level={confidenceMerchant} />
      </View>
      <Text className="text-ink text-4xl font-bold mt-3">{formatRON(total)}</Text>
      <View className="mt-2">
        <ConfidenceBadge level={confidenceTotal} />
      </View>
    </AppCard>
  );
}
