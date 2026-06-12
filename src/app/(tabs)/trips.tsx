import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { AppCard } from "@/components/ui/AppCard";
import { Badge } from "@/components/ui/Badge";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useTrips } from "@/hooks/useTrips";
import { TRIP_STATUS_META } from "@/constants";
import { formatDate } from "@/lib/date";
import { formatRONValue } from "@/lib/format";
import { MapPin, Plus } from "lucide-react-native";

export default function TripsScreen() {
  const { data: trips, isLoading, refetch, isRefetching } = useTrips();

  return (
    <Screen className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#5B8DEF" />}
      >
        <View className="mb-2">
          <Text className="text-ink text-2xl font-bold">Delegații</Text>
        </View>

        {isLoading ? (
          <SkeletonList count={4} />
        ) : !trips?.length ? (
          <EmptyState
            icon={<MapPin size={32} color="#7FA8FF" />}
            title="Nicio delegație"
            description="Creează prima delegație pentru a înregistra cheltuieli."
            actionLabel="Delegație nouă"
            onAction={() => router.push("/trips/add")}
          />
        ) : (
          trips.map((trip) => {
            const meta = TRIP_STATUS_META[trip.status] ?? { label: trip.status, color: "#6B7693" };
            return (
              <TouchableOpacity key={trip.id} onPress={() => router.push(`/trips/${trip.id}`)}>
                <AppCard>
                  <View className="flex-row items-start justify-between mb-1">
                    <Text className="text-ink font-semibold flex-1 mr-2">{trip.destination}</Text>
                    <Badge label={meta.label} color={meta.color} />
                  </View>
                  {trip.purpose && <Text className="text-ink-soft text-sm mb-1">{trip.purpose}</Text>}
                  <Text className="text-ink-soft text-xs">{formatDate(trip.startDate)}{trip.endDate ? ` → ${formatDate(trip.endDate)}` : ""}</Text>
                  {trip.totalExpenses != null && (
                    <View className="flex-row justify-between mt-2 pt-2 border-t border-line">
                      <Text className="text-ink-soft text-sm">Total cheltuieli</Text>
                      <Text className="text-ink font-medium">{formatRONValue(trip.totalExpenses)} RON</Text>
                    </View>
                  )}
                  {trip.budget != null && (
                    <View className="flex-row justify-between mt-1">
                      <Text className="text-ink-soft text-sm">Buget</Text>
                      <Text className="text-ink-soft text-sm">{formatRONValue(trip.budget)} RON</Text>
                    </View>
                  )}
                </AppCard>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
      <FloatingActionButton icon={<Plus size={22} color="#fff" />} onPress={() => router.push("/trips/add")} />
    </Screen>
  );
}
