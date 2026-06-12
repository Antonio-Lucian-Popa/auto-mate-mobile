import { useState } from "react";
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { AppCard } from "@/components/ui/AppCard";
import { Badge } from "@/components/ui/Badge";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useTrips } from "@/hooks/useTrips";
import { useRole } from "@/hooks/useRole";
import { TRIP_STATUS_META } from "@/constants";
import { formatDate } from "@/lib/date";
import { formatRONValue } from "@/lib/format";
import { MapPin, Plus } from "lucide-react-native";
import type { TripStatus } from "@/types";

const STATUS_FILTERS: { value: TripStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Toate" },
  { value: "ACTIVE", label: "Active" },
  { value: "SUBMITTED", label: "Trimise" },
  { value: "APPROVED", label: "Aprobate" },
  { value: "REJECTED", label: "Respinse" },
];

export default function TripsScreen() {
  const [statusFilter, setStatusFilter] = useState<TripStatus | "ALL">("ALL");
  const { canApprove } = useRole();

  const { data: trips, isLoading, refetch, isRefetching } = useTrips(
    statusFilter !== "ALL" ? { status: statusFilter } : undefined
  );

  return (
    <Screen className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#5B8DEF" />}
      >
        <View className="mb-1">
          <Text className="text-ink text-2xl font-bold">Delegații</Text>
        </View>

        {/* Filtre status */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.value;
            return (
              <TouchableOpacity
                key={f.value}
                onPress={() => setStatusFilter(f.value)}
                className={`px-4 py-2 rounded-full border ${active ? "bg-brand border-brand" : "border-line bg-bg-card"}`}
              >
                <Text className={`text-sm font-medium ${active ? "text-white" : "text-ink-soft"}`}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <SkeletonList count={4} />
        ) : !trips?.length ? (
          <EmptyState
            icon={<MapPin size={32} color="#7FA8FF" />}
            title="Nicio delegație"
            description={statusFilter === "ALL" ? "Creează prima delegație pentru a înregistra cheltuieli." : "Nicio delegație cu statusul selectat."}
            actionLabel={statusFilter === "ALL" ? "Delegație nouă" : undefined}
            onAction={statusFilter === "ALL" ? () => router.push("/trips/add") : undefined}
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
                  <Text className="text-ink-soft text-xs">
                    {formatDate(trip.startDate)}{trip.endDate ? ` → ${formatDate(trip.endDate)}` : ""}
                  </Text>
                  {trip.user && (
                    <Text className="text-ink-soft text-xs mt-0.5">
                      {[trip.user.firstName, trip.user.lastName].filter(Boolean).join(" ") || trip.user.email}
                    </Text>
                  )}
                  {(trip.totalExpenses != null || trip.budget != null) && (
                    <View className="flex-row justify-between mt-2 pt-2 border-t border-line">
                      {trip.totalExpenses != null && (
                        <Text className="text-ink text-sm font-medium">{formatRONValue(trip.totalExpenses)} RON cheltuieli</Text>
                      )}
                      {trip.budget != null && (
                        <Text className="text-ink-soft text-sm">buget: {formatRONValue(trip.budget)}</Text>
                      )}
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
