import { useMemo } from "react";
import { View, Text, FlatList } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { router } from "expo-router";
import { AlertTriangle, Car as CarIcon, Plus } from "lucide-react-native";
import { useCars } from "@/hooks/useCars";
import { useFleetOverview } from "@/hooks/useFleet";
import { useReminders } from "@/hooks/useReminders";
import { useCarStore } from "@/stores/carStore";
import { useRole } from "@/hooks/useRole";
import { CarCard } from "@/components/cards/CarCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { AppCard } from "@/components/ui/AppCard";
import { Badge } from "@/components/ui/Badge";
import { computeCarStatus } from "@/lib/status";
import { formatMileage, formatRONValue } from "@/lib/format";
import type { FleetCar, FleetDocument, Reminder } from "@/types";

const DOC_STATUS_COLOR: Record<string, string> = {
  valid: "#5AE0A0",
  expires_soon: "#FFCC66",
  expired: "#FF6B6B",
};

const DOC_STATUS_LABEL: Record<string, string> = {
  valid: "valid",
  expires_soon: "expiră",
  expired: "expirat",
};

function driverName(car: FleetCar) {
  const user = car.assignedUser;
  if (!user) return "Nealocată";
  return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;
}

export default function GarageScreen() {
  const { data: cars, isLoading } = useCars();
  const { data: reminders } = useReminders();
  const { selectedCarId, setSelectedCar } = useCarStore();
  const { canManageFleet, canViewFleet } = useRole();
  const showFleetOverview = canViewFleet();
  const { data: fleet } = useFleetOverview(showFleetOverview);

  const fleetById = useMemo<Map<string, FleetCar>>(() => {
    return new Map((fleet ?? []).map((car: FleetCar) => [car.id, car]));
  }, [fleet]);

  const fleetTotals = useMemo(() => {
    const rows = fleet ?? [];
    return {
      cost12m: rows.reduce((sum: number, car: FleetCar) => sum + (car.totalCosts12m ?? 0), 0),
      expiringDocs: rows.reduce((sum: number, car: FleetCar) => {
        return sum + (car.documents ?? []).filter((doc: FleetDocument) => doc.status !== "valid").length;
      }, 0),
    };
  }, [fleet]);

  const renderFleetMeta = (fleetCar?: FleetCar) => {
    if (!showFleetOverview || !fleetCar) return null;

    const documents = (fleetCar.documents ?? []).filter((doc: FleetDocument) => doc.status !== "valid").slice(0, 2);

    return (
      <View className="mt-2 rounded-2xl border border-line bg-bg-soft px-4 py-3">
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1">
            <Text className="text-ink-faint text-xs font-semibold uppercase">Șofer</Text>
            <Text className="text-ink text-sm font-semibold" numberOfLines={1}>{driverName(fleetCar)}</Text>
          </View>
          <View className="items-end">
            <Text className="text-ink-faint text-xs font-semibold uppercase">Costuri 12 luni</Text>
            <Text className="text-ink text-sm font-semibold">{formatRONValue(fleetCar.totalCosts12m ?? 0)} RON</Text>
          </View>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-ink-soft text-xs">Kilometraj: {formatMileage(fleetCar.mileage)}</Text>
          {documents.length > 0 ? (
            <View className="flex-row items-center gap-1.5">
              <AlertTriangle size={14} color="#FFCC66" />
              <Text className="text-xs font-semibold" style={{ color: "#FFCC66" }}>{documents.length} documente</Text>
            </View>
          ) : (
            <Text className="text-xs font-semibold" style={{ color: "#5AE0A0" }}>Documente ok</Text>
          )}
        </View>

        {documents.length > 0 && (
          <View className="mt-3 flex-row flex-wrap gap-2">
            {documents.map((doc: FleetDocument) => (
              <Badge
                key={`${doc.category}-${doc.expiresAt}`}
                small
                label={`${doc.title}: ${DOC_STATUS_LABEL[doc.status] ?? doc.status}`}
                color={DOC_STATUS_COLOR[doc.status] ?? "#7FA8FF"}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <Screen className="flex-1 bg-bg">
      <View className="flex-1 px-5 pt-2">
        <ScreenHeader title="Garaj" subtitle={`${cars?.length ?? 0} autovehicule`} inset={false} />
        {showFleetOverview && !!fleet?.length && (
          <AppCard className="mb-3">
            <Text className="text-ink-faint text-xs font-semibold uppercase">Overview garaj</Text>
            <View className="mt-3 flex-row gap-3">
              <View className="flex-1">
                <Text className="text-ink text-xl font-bold">{formatRONValue(fleetTotals.cost12m)} RON</Text>
                <Text className="text-ink-soft text-xs mt-1">costuri în ultimele 12 luni</Text>
              </View>
              <View className="flex-1">
                <Text className="text-ink text-xl font-bold">{fleetTotals.expiringDocs}</Text>
                <Text className="text-ink-soft text-xs mt-1">documente expirate sau aproape</Text>
              </View>
            </View>
          </AppCard>
        )}
        {isLoading ? (
          <SkeletonList count={3} />
        ) : !cars?.length ? (
          <EmptyState
            icon={<CarIcon size={32} color="#7FA8FF" />}
            title="Garaj gol"
            description="Adaugă prima mașină pentru a urmări costuri, documente și remindere."
            actionLabel={canManageFleet() ? "Adaugă mașină" : undefined}
            onAction={canManageFleet() ? () => router.push("/car/add") : undefined}
          />
        ) : (
          <FlatList
            data={cars}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
            renderItem={({ item }) => {
              const carReminders = (reminders ?? []).filter((r: Reminder) => r.carId === item.id && r.status !== "done");
              const fleetCar = fleetById.get(item.id);
              return (
                <View>
                  <CarCard
                    car={item}
                    status={computeCarStatus(carReminders)}
                    selected={item.id === selectedCarId}
                    onPress={() => {
                      setSelectedCar(item.id);
                      router.push(`/car/${item.id}`);
                    }}
                  />
                  {renderFleetMeta(fleetCar)}
                </View>
              );
            }}
          />
        )}
      </View>
      {canManageFleet() && (
        <FloatingActionButton onPress={() => router.push("/car/add")} icon={<Plus size={28} color="#fff" />} />
      )}
    </Screen>
  );
}
