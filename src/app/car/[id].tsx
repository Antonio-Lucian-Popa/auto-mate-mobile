import { useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, Pressable } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { useLocalSearchParams, router } from "expo-router";
import { Trash2, Fuel, Wallet, FileText, BellPlus, Gauge } from "lucide-react-native";
import { useCar, useDeleteCar } from "@/hooks/useCars";
import { useCarReminders } from "@/hooks/useReminders";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppCard } from "@/components/ui/AppCard";
import { StatCard } from "@/components/ui/StatCard";
import { QuickAction } from "@/components/ui/QuickAction";
import { ReminderCard } from "@/components/cards/ReminderCard";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { computeCarStatus, STATUS_META } from "@/lib/status";
import { formatMileage, formatRON } from "@/lib/format";
import { costsService } from "@/services/costs/costsService";
import { FUEL_TYPES } from "@/constants";

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: car, isLoading } = useCar(id);
  const { data: reminders } = useCarReminders(id);
  const del = useDeleteCar();
  const [monthlyCost, setMonthlyCost] = useState(0);

  useEffect(() => {
    if (id) costsService.monthlyTotal(id).then(setMonthlyCost);
  }, [id]);

  const onDelete = () => {
    Alert.alert("Șterge mașina", "Această acțiune nu poate fi anulată.", [
      { text: "Renunță", style: "cancel" },
      { text: "Șterge", style: "destructive", onPress: () => del.mutate(id, { onSuccess: () => router.back() }) },
    ]);
  };

  if (isLoading || !car) {
    return (
      <Screen className="flex-1 bg-bg px-5 pt-2">
        <Skeleton height={120} />
      </Screen>
    );
  }

  const status = computeCarStatus(reminders ?? []);
  const meta = STATUS_META[status];
  const fuelLabel = FUEL_TYPES.find((f) => f.value === car.fuelType)?.label ?? car.fuelType;

  return (
    <Screen className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 40 }}>
        <ScreenHeader
          title={`${car.brand} ${car.model}`}
          subtitle={car.licensePlate}
          back
          right={
            <Pressable onPress={onDelete} className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/30 items-center justify-center active:opacity-70">
              <Trash2 size={18} color="#F87171" />
            </Pressable>
          }
        />

        <AppCard>
          <Badge label={meta.label} color={meta.color} bg={meta.bg} />
          <View className="flex-row flex-wrap gap-y-3 mt-4">
            <View className="w-1/2"><Text className="text-ink-faint text-xs">An fabricație</Text><Text className="text-ink font-semibold">{car.year}</Text></View>
            <View className="w-1/2"><Text className="text-ink-faint text-xs">Combustibil</Text><Text className="text-ink font-semibold">{fuelLabel}</Text></View>
            <View className="w-1/2"><Text className="text-ink-faint text-xs">Kilometraj</Text><Text className="text-ink font-semibold">{formatMileage(car.currentMileage)}</Text></View>
            <View className="w-1/2"><Text className="text-ink-faint text-xs">VIN</Text><Text className="text-ink font-semibold" numberOfLines={1}>{car.vin ?? "—"}</Text></View>
          </View>
        </AppCard>

        <View className="flex-row gap-3">
          <StatCard label="Cost lună" value={formatRON(monthlyCost)} icon={<Wallet size={16} color="#5B8DEF" />} />
          <StatCard label="Reminder-e" value={`${(reminders ?? []).filter((r) => r.status !== "done").length}`} icon={<Gauge size={16} color="#A78BFA" />} accent="#A78BFA" />
        </View>

        <View className="flex-row justify-around">
          <QuickAction icon={<Fuel size={22} color="#34D399" />} label="Alimentare" onPress={() => router.push("/fuel/add")} accent="#34D399" />
          <QuickAction icon={<Wallet size={22} color="#FBBF24" />} label="Cost" onPress={() => router.push("/costs/add")} accent="#FBBF24" />
          <QuickAction icon={<BellPlus size={22} color="#A78BFA" />} label="Reminder" onPress={() => router.push("/reminders/add")} accent="#A78BFA" />
          <QuickAction icon={<FileText size={22} color="#22D3EE" />} label="Documente" onPress={() => router.push("/documents")} accent="#22D3EE" />
        </View>

        <View>
          <Text className="text-ink font-semibold mb-3">Reminder-e</Text>
          {(reminders ?? []).filter((r) => r.status !== "done").length ? (
            <View className="gap-3">
              {(reminders ?? []).filter((r) => r.status !== "done").map((r) => (
                <ReminderCard key={r.id} reminder={r} onPress={() => router.push(`/reminders/${r.id}`)} />
              ))}
            </View>
          ) : (
            <View className="bg-bg-card border border-line rounded-2xl p-5 items-center">
              <Text className="text-ink-soft">Niciun reminder activ</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
