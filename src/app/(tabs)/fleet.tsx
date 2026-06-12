import { View, Text, ScrollView, RefreshControl } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { AppCard } from "@/components/ui/AppCard";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { useFleetOverview } from "@/hooks/useFleet";
import { formatRONValue } from "@/lib/format";
import { Car, AlertTriangle } from "lucide-react-native";

const DOC_STATUS_COLOR: Record<string, string> = {
  valid: "#34D399",
  expires_soon: "#FBBF24",
  expired: "#F87171",
};

export default function FleetScreen() {
  const { data: fleet, isLoading, refetch, isRefetching } = useFleetOverview();

  return (
    <Screen className="flex-1 bg-bg">
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor="#5B8DEF" />}
      >
        <View className="mb-2">
          <Text className="text-ink text-2xl font-bold">Flotă</Text>
        </View>

        {isLoading ? (
          <SkeletonList count={3} />
        ) : !fleet?.length ? (
          <EmptyState
            icon={<Car size={32} color="#7FA8FF" />}
            title="Nicio mașină în flotă"
            description="Adaugă mașini din tab-ul Garaj."
          />
        ) : (
          fleet.map((car) => (
            <AppCard key={car.id}>
              <View className="flex-row items-start justify-between mb-2">
                <View>
                  <Text className="text-ink font-bold text-base">{car.make} {car.model} ({car.year})</Text>
                  <Text className="text-ink-soft text-sm">{car.plateNumber}</Text>
                  {car.assignedUser && (
                    <Text className="text-ink-soft text-sm mt-0.5">
                      {[car.assignedUser.firstName, car.assignedUser.lastName].filter(Boolean).join(" ") || car.assignedUser.email}
                    </Text>
                  )}
                </View>
                <View className="items-end">
                  <Text className="text-ink-soft text-xs">{car.mileage.toLocaleString("ro-RO")} km</Text>
                  <Text className="text-brand-glow text-sm font-semibold mt-1">{formatRONValue(car.totalCosts12m)} RON/an</Text>
                </View>
              </View>

              {car.documents.length > 0 && (
                <View className="gap-1 pt-2 border-t border-line">
                  {car.documents.map((doc, i) => (
                    <View key={i} className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        {doc.status !== "valid" && <AlertTriangle size={13} color={DOC_STATUS_COLOR[doc.status]} />}
                        <Text className="text-ink-soft text-sm">{doc.title}</Text>
                      </View>
                      <Badge
                        label={doc.status === "valid" ? `${doc.daysLeft}z` : doc.status === "expires_soon" ? `${doc.daysLeft}z` : "Expirat"}
                        color={DOC_STATUS_COLOR[doc.status]}
                        small
                      />
                    </View>
                  ))}
                </View>
              )}
            </AppCard>
          ))
        )}
      </ScrollView>
    </Screen>
  );
}
