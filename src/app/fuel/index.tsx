import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Alert } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { router, useFocusEffect } from "expo-router";
import { Fuel, Plus, Trash2, Gauge } from "lucide-react-native";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppCard } from "@/components/ui/AppCard";
import { HeaderIconButton } from "@/components/ui/HeaderIconButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { FuelSummaryCard } from "@/components/cards/FuelSummaryCard";
import { TrendLineChart } from "@/components/charts/TrendLineChart";
import { MonthlyBarChart } from "@/components/charts/MonthlyBarChart";
import { SkeletonList } from "@/components/ui/Skeleton";
import { SegmentedField } from "@/components/forms/SegmentedField";
import { useActiveCar } from "@/hooks/useActiveCar";
import { fuelService } from "@/services/fuel/fuelService";
import { sumByMonth, shortMonthLabel } from "@/lib/series";
import { formatRON, formatNumber, formatMileage } from "@/lib/format";
import { formatDate } from "@/lib/date";
import type { FuelLog } from "@/types";

export default function FuelHistoryScreen() {
  const { active, options, setSelected } = useActiveCar();
  const [logs, setLogs] = useState<FuelLog[]>([]);
  const [avg, setAvg] = useState<number | null>(null);
  const [series, setSeries] = useState<{ date: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!active) { setLoading(false); return; }
    setLoading(true);
    const [list, consumption, consSeries] = await Promise.all([
      fuelService.list(active.id),
      fuelService.averageConsumption(active.id),
      fuelService.consumptionSeries(active.id),
    ]);
    setLogs(list);
    setAvg(consumption);
    setSeries(consSeries);
    setLoading(false);
  }, [active]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const monthYm = new Date().toISOString().slice(0, 7);
  const monthlyCost = logs.filter((l) => l.date.startsWith(monthYm)).reduce((s, l) => s + l.total, 0);
  const priced = logs.filter((l) => l.pricePerLiter > 0);
  const avgPrice = priced.length ? priced.reduce((s, l) => s + l.pricePerLiter, 0) / priced.length : null;

  const trendData = series.map((s) => ({ label: shortMonthLabel(s.date), value: s.value }));
  const monthlySpend = sumByMonth(logs, 6, (l) => l.date, (l) => l.total);
  const hasSpendChart = monthlySpend.some((m) => m.value > 0);

  const remove = (id: string) => {
    Alert.alert("Șterge alimentarea", "Sigur vrei să o ștergi?", [
      { text: "Anulează", style: "cancel" },
      { text: "Șterge", style: "destructive", onPress: async () => { await fuelService.remove(id); load(); } },
    ]);
  };

  return (
    <Screen className="flex-1 bg-bg">
      <View className="flex-1 px-5 pt-2">
        <ScreenHeader title="Alimentări" subtitle={active ? `${active.brand} ${active.model}` : undefined} back
          right={<HeaderIconButton accessibilityLabel="Adaugă alimentare" onPress={() => router.push("/fuel/add")} icon={<Plus size={20} color="#7FA8FF" />} />} />

        {options.length > 1 && active && (
          <View className="mb-4">
            <SegmentedField label="Alege mașina" options={options} value={active.id} onChange={setSelected} />
          </View>
        )}

        {loading ? (
          <SkeletonList count={4} />
        ) : logs.length === 0 ? (
          <EmptyState icon={<Fuel size={30} color="#34D399" />} title="Nicio alimentare" description="Adaugă prima alimentare sau scanează un bon." actionLabel="Adaugă alimentare" onAction={() => router.push("/fuel/add")} />
        ) : (
          <FlatList
            data={logs}
            keyExtractor={(i) => i.id}
            ListHeaderComponent={
              <View className="gap-4 mb-4">
                <FuelSummaryCard avgConsumption={avg} avgPrice={avgPrice} monthlyCost={monthlyCost} />
                {trendData.length >= 2 && (
                  <TrendLineChart data={trendData} title="Consum L/100km" unit="L" color="#34D399" />
                )}
                {hasSpendChart && (
                  <MonthlyBarChart data={monthlySpend} title="Cost carburant pe luni" color="#5B8DEF" />
                )}
              </View>
            }
            ItemSeparatorComponent={() => <View className="h-3" />}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <AppCard onPress={() => remove(item.id)}>
                <View className="flex-row items-center gap-3">
                  <View className="w-11 h-11 rounded-2xl bg-ok/15 items-center justify-center"><Fuel size={20} color="#34D399" /></View>
                  <View className="flex-1">
                    <Text className="text-ink font-semibold">{item.station ?? "Alimentare"}</Text>
                    <Text className="text-ink-faint text-xs">
                      {formatDate(item.date)} · {formatNumber(item.liters, 1)} L
                      {item.pricePerLiter ? ` · ${formatNumber(item.pricePerLiter, 2)} RON/L` : ""}
                    </Text>
                    {item.mileage ? <View className="flex-row items-center gap-1 mt-0.5"><Gauge size={11} color="#6B7693" /><Text className="text-ink-faint text-xs">{formatMileage(item.mileage)}</Text></View> : null}
                  </View>
                  <View className="items-end">
                    <Text className="text-ink font-bold">{formatRON(item.total)}</Text>
                    <Trash2 size={14} color="#6B7693" />
                  </View>
                </View>
              </AppCard>
            )}
          />
        )}
      </View>
    </Screen>
  );
}
