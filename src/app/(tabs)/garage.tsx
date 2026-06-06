import { View, Text, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Car as CarIcon, Plus } from "lucide-react-native";
import { useCars } from "@/hooks/useCars";
import { useReminders } from "@/hooks/useReminders";
import { useCarStore } from "@/stores/carStore";
import { CarCard } from "@/components/cards/CarCard";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonList } from "@/components/ui/Skeleton";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { computeCarStatus } from "@/lib/status";

export default function GarageScreen() {
  const { data: cars, isLoading } = useCars();
  const { data: reminders } = useReminders();
  const { selectedCarId, setSelectedCar } = useCarStore();

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-5 pt-2">
        <ScreenHeader title="Garaj" subtitle={`${cars?.length ?? 0} autovehicule`} />
        {isLoading ? (
          <SkeletonList count={3} />
        ) : !cars?.length ? (
          <EmptyState
            icon={<CarIcon size={32} color="#7FA8FF" />}
            title="Garaj gol"
            description="Adaugă prima mașină pentru a urmări costuri, documente și remindere."
            actionLabel="Adaugă mașină"
            onAction={() => router.push("/car/add")}
          />
        ) : (
          <FlatList
            data={cars}
            keyExtractor={(c) => c.id}
            contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
            renderItem={({ item }) => {
              const carReminders = (reminders ?? []).filter((r) => r.carId === item.id && r.status !== "done");
              return (
                <CarCard
                  car={item}
                  status={computeCarStatus(carReminders)}
                  selected={item.id === selectedCarId}
                  onPress={() => {
                    setSelectedCar(item.id);
                    router.push(`/car/${item.id}`);
                  }}
                />
              );
            }}
          />
        )}
      </View>
      <FloatingActionButton onPress={() => router.push("/car/add")} icon={<Plus size={28} color="#fff" />} />
    </SafeAreaView>
  );
}
