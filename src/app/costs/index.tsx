import { useState, useCallback } from "react";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { SectionList } from "react-native";
import { Wallet, Plus } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppButton } from "@/components/ui/AppButton";
import { AppCard } from "@/components/ui/AppCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CostTimelineItem } from "@/components/cards/CostTimelineItem";
import { MonthlyBarChart } from "@/components/charts/MonthlyBarChart";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useActiveCar } from "@/hooks/useActiveCar";
import { costsService } from "@/services/costs/costsService";
import { sumByMonth } from "@/lib/series";
import { formatRON } from "@/lib/format";
import type { Cost } from "@/types";

const MONTHS = ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"];

function monthLabel(ym: string) {
  const [y, m] = ym.split("-");
  return `${MONTHS[Number(m) - 1]} ${y}`;
}

export default function CostsHistoryScreen() {
  const { active } = useActiveCar();
  const [costs, setCosts] = useState<Cost[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!active) { setLoading(false); return; }
    setLoading(true);
    setCosts(await costsService.list(active.id));
    setLoading(false);
  }, [active]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const groups = costs.reduce<Record<string, Cost[]>>((acc, c) => {
    const ym = c.date.slice(0, 7);
    (acc[ym] ||= []).push(c);
    return acc;
  }, {});
  const sections = Object.keys(groups).sort((a, b) => b.localeCompare(a)).map((ym) => ({
    title: monthLabel(ym),
    total: groups[ym].reduce((s, c) => s + c.amount, 0),
    data: groups[ym],
  }));
  const grandTotal = costs.reduce((s, c) => s + c.amount, 0);
  const monthlySeries = sumByMonth(costs, 6, (c) => c.date, (c) => c.amount);
  const hasChart = monthlySeries.some((m) => m.value > 0);

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5 pt-2">
        <ScreenHeader title="Costuri" subtitle={active ? `${active.brand} ${active.model}` : undefined} back
          right={<AppButton title="Adaugă" onPress={() => router.push("/costs/add")} className="h-10 px-4" icon={<Plus size={16} color="#fff" />} />} />

        {loading ? (
          <SkeletonList count={5} />
        ) : costs.length === 0 ? (
          <EmptyState icon={<Wallet size={30} color="#FBBF24" />} title="Niciun cost" description="Adaugă prima cheltuială pentru a urmări costurile mașinii." actionLabel="Adaugă cost" onAction={() => router.push("/costs/add")} />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(i) => i.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
            ListHeaderComponent={
              <View className="gap-4 mb-4">
                {hasChart && (
                  <MonthlyBarChart data={monthlySeries} title="Cheltuieli pe luni" color="#FBBF24" />
                )}
                <AppCard className="flex-row items-center justify-between">
                  <Text className="text-ink-soft">Total cheltuit</Text>
                  <Text className="text-ink text-xl font-bold">{formatRON(grandTotal)}</Text>
                </AppCard>
              </View>
            }
            renderSectionHeader={({ section }) => (
              <View className="flex-row items-center justify-between mt-2 mb-3">
                <Text className="text-ink-soft font-semibold capitalize">{section.title}</Text>
                <Text className="text-ink-faint text-sm">{formatRON((section as any).total)}</Text>
              </View>
            )}
            renderItem={({ item, index, section }) => (
              <CostTimelineItem cost={item} last={index === section.data.length - 1} />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
