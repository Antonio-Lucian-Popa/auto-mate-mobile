import { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { router } from "expo-router";
import { ScanLine, Fuel, Wallet, BellPlus, FileText, Gauge, TrendingUp, Coins, MapPin, AlertTriangle } from "lucide-react-native";
import { useCars } from "@/hooks/useCars";
import { useReminders } from "@/hooks/useReminders";
import { useCarStore } from "@/stores/carStore";
import { useStats } from "@/hooks/useStats";
import { useAuthStore } from "@/stores/authStore";
import { CarCard } from "@/components/cards/CarCard";
import { ReminderCard } from "@/components/cards/ReminderCard";
import { StatCard } from "@/components/ui/StatCard";
import { QuickAction } from "@/components/ui/QuickAction";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { AppCard } from "@/components/ui/AppCard";
import { MonthlyBarChart } from "@/components/charts/MonthlyBarChart";
import { SegmentedField } from "@/components/forms/SegmentedField";
import { computeCarStatus } from "@/lib/status";
import { daysUntil } from "@/lib/date";
import { sumByMonth } from "@/lib/series";
import { formatRONValue, formatNumber } from "@/lib/format";
import { costsService } from "@/services/costs/costsService";
import { fuelService } from "@/services/fuel/fuelService";

export default function DashboardScreen() {
  const { data: cars, isLoading, refetch, isRefetching } = useCars();
  const { data: reminders } = useReminders();
  const { selectedCarId, setSelectedCar } = useCarStore();
  const { data: stats, refetch: refetchStats } = useStats();
  const user = useAuthStore((s) => s.user);
  const [monthlyCost, setMonthlyCost] = useState(0);
  const [avgConsumption, setAvgConsumption] = useState<number | null>(null);
  const [costSeries, setCostSeries] = useState<{ label: string; value: number }[]>([]);

  const selectedCar = useMemo(() => {
    if (!cars?.length) return null;
    return cars.find((c) => c.id === selectedCarId) ?? cars[0];
  }, [cars, selectedCarId]);

  useEffect(() => {
    if (selectedCar) {
      costsService.monthlyTotal(selectedCar.id).then(setMonthlyCost);
      fuelService.averageConsumption(selectedCar.id).then(setAvgConsumption);
      costsService.list(selectedCar.id).then((list) =>
        setCostSeries(sumByMonth(list, 6, (c) => c.date, (c) => c.amount))
      );
    }
  }, [selectedCar?.id]);

  const handleRefresh = () => {
    refetch();
    refetchStats();
  };

  const carReminders = useMemo(
    () => (reminders ?? []).filter((r) => r.carId === selectedCar?.id && r.status !== "done"),
    [reminders, selectedCar]
  );
  const upcoming = useMemo(
    () => [...carReminders].sort((a, b) => daysUntil(a.dueDate) - daysUntil(b.dueDate)).slice(0, 3),
    [carReminders]
  );
  const costPerKm = selectedCar && selectedCar.currentMileage > 0 ? monthlyCost / selectedCar.currentMileage : null;

  if (isLoading) {
    return (
      <Screen className="flex-1 bg-bg px-5 pt-2">
        <SkeletonList count={4} />
      </Screen>
    );
  }

  if (!cars?.length) {
    return (
      <Screen className="flex-1 bg-bg">
        <EmptyState
          icon={<Fuel size={32} color="#7FA8FF" />}
          title="Niciun autovehicul"
          description="Adaugă prima mașină ca să începi să urmărești costuri, alimentări și remindere."
          actionLabel="Adaugă mașină"
          onAction={() => router.push("/car/add")}
        />
      </Screen>
    );
  }

  return (
    <Screen className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={handleRefresh} tintColor="#5B8DEF" />}
      >
        <View>
          <Text className="text-ink-soft">Salut{user?.name ? `, ${user.name}` : ""} 👋</Text>
          <Text className="text-ink text-2xl font-bold">Dashboard</Text>
        </View>

        {/* Banner delegatie activa */}
        {stats?.activeTrip && (
          <TouchableOpacity onPress={() => router.push(`/trips/${stats.activeTrip!.id}`)}>
            <AppCard style={{ borderColor: "#34D399", borderWidth: 1 }}>
              <View className="flex-row items-center gap-2 mb-1">
                <MapPin size={16} color="#34D399" />
                <Text className="text-brand font-semibold text-sm">Delegație activă</Text>
              </View>
              <Text className="text-ink font-bold">{stats.activeTrip.destination}</Text>
              <View className="flex-row justify-between mt-2">
                <Text className="text-ink-soft text-sm">Total cheltuieli</Text>
                <Text className="text-ink font-medium">{formatRONValue(stats.activeTrip.runningTotal)} RON</Text>
              </View>
              {stats.activeTrip.budgetRemaining != null && (
                <View className="flex-row justify-between mt-1">
                  <Text className="text-ink-soft text-sm">Buget rămas</Text>
                  <Text
                    className={`text-sm font-medium ${stats.activeTrip.budgetRemaining < 0 ? "text-danger" : "text-green-400"}`}
                  >
                    {formatRONValue(stats.activeTrip.budgetRemaining)} RON
                  </Text>
                </View>
              )}
            </AppCard>
          </TouchableOpacity>
        )}

        {/* Documente expirante din stats */}
        {stats?.expiringDocuments && stats.expiringDocuments.length > 0 && (
          <AppCard style={{ borderColor: "#FBBF24", borderWidth: 1 }}>
            <View className="flex-row items-center gap-2 mb-2">
              <AlertTriangle size={16} color="#FBBF24" />
              <Text className="text-ink font-semibold text-sm">Documente ce expiră curând</Text>
            </View>
            {stats.expiringDocuments.slice(0, 3).map((doc, i) => (
              <View key={i} className="flex-row justify-between py-1">
                <Text className="text-ink-soft text-sm">{doc.title} ({doc.car})</Text>
                <Text className="text-yellow-400 text-sm">{doc.daysLeft}z</Text>
              </View>
            ))}
          </AppCard>
        )}

        {cars.length > 1 && selectedCar && (
          <SegmentedField
            label="Alege mașina"
            options={cars.map((car: { id: string; brand: string; model: string }) => ({ value: car.id, label: `${car.brand} ${car.model}` }))}
            value={selectedCar.id}
            onChange={setSelectedCar}
          />
        )}

        {selectedCar && (
          <CarCard
            car={selectedCar}
            status={computeCarStatus(carReminders)}
            onPress={() => router.push(`/car/${selectedCar.id}`)}
            selected
          />
        )}

        <View className="flex-row gap-3">
          <StatCard label="Cost lună" value={formatRONValue(stats?.currentMonth.total ?? monthlyCost)} sub="RON" icon={<Wallet size={16} color="#5B8DEF" />} />
          <StatCard label="Consum" value={avgConsumption ? `${formatNumber(avgConsumption, 1)}` : "—"} sub="L/100km" icon={<Gauge size={16} color="#34D399" />} accent="#34D399" />
        </View>
        <View className="flex-row gap-3">
          <StatCard label="Cost / km" value={costPerKm ? formatRONValue(costPerKm) : "—"} sub={costPerKm ? "RON/km" : undefined} icon={<Coins size={16} color="#FBBF24" />} accent="#FBBF24" />
          <StatCard label="Reminder-e" value={`${carReminders.length}`} sub="active" icon={<TrendingUp size={16} color="#A78BFA" />} accent="#A78BFA" />
        </View>

        {costSeries.some((m) => m.value > 0) && (
          <MonthlyBarChart data={costSeries} title="Cheltuieli ultimele 6 luni" color="#5B8DEF" />
        )}

        <View>
          <Text className="text-ink font-semibold mb-3">Acțiuni rapide</Text>
          <View className="flex-row justify-between flex-wrap gap-2">
            <QuickAction icon={<ScanLine size={22} color="#5B8DEF" />} label="Scan bon" onPress={() => router.push("/receipts/scan")} />
            <QuickAction icon={<MapPin size={22} color="#34D399" />} label="Delegație" onPress={() => router.push("/trips/add")} accent="#34D399" />
            <QuickAction icon={<Fuel size={22} color="#FBBF24" />} label="Alimentări" onPress={() => router.push("/fuel")} accent="#FBBF24" />
            <QuickAction icon={<Wallet size={22} color="#A78BFA" />} label="Costuri" onPress={() => router.push("/costs")} accent="#A78BFA" />
            <QuickAction icon={<BellPlus size={22} color="#22D3EE" />} label="Reminder" onPress={() => router.push("/reminders/add")} accent="#22D3EE" />
            <QuickAction icon={<FileText size={22} color="#FB923C" />} label="Documente" onPress={() => router.push("/documents")} accent="#FB923C" />
          </View>
        </View>

        <View>
          <Text className="text-ink font-semibold mb-3">Reminder-e apropiate</Text>
          {upcoming.length ? (
            <View className="gap-3">
              {upcoming.map((r) => (
                <ReminderCard key={r.id} reminder={r} onPress={() => router.push(`/reminders/${r.id}`)} />
              ))}
            </View>
          ) : (
            <View className="bg-bg-card border border-line rounded-2xl p-5 items-center">
              <Text className="text-ink-soft">Totul este în regulă ✨</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
