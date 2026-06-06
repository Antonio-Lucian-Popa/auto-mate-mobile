import { View, Text, Image } from "react-native";
import { Car as CarIcon } from "lucide-react-native";
import { AppCard } from "@/components/ui/AppCard";
import { Badge } from "@/components/ui/Badge";
import { STATUS_META } from "@/lib/status";
import { formatMileage } from "@/lib/format";
import type { Car, CarStatus } from "@/types";

type Props = { car: Car; status?: CarStatus; onPress?: () => void; selected?: boolean };

export function CarCard({ car, status = "ok", onPress, selected }: Props) {
  const meta = STATUS_META[status];
  return (
    <AppCard onPress={onPress} className={selected ? "border-brand" : ""}>
      <View className="flex-row gap-4">
        <View className="w-16 h-16 rounded-2xl bg-bg-elevated items-center justify-center overflow-hidden">
          {car.photoUri ? (
            <Image source={{ uri: car.photoUri }} className="w-full h-full" />
          ) : (
            <CarIcon size={28} color="#7FA8FF" />
          )}
        </View>
        <View className="flex-1 justify-between">
          <View>
            <Text className="text-ink text-lg font-bold">{car.brand} {car.model}</Text>
            <Text className="text-ink-soft text-sm">{car.year} · {car.licensePlate}</Text>
          </View>
          <View className="flex-row items-center justify-between mt-2">
            <Badge label={meta.label} color={meta.color} bg={meta.bg} />
            <Text className="text-ink-faint text-xs">{formatMileage(car.currentMileage)}</Text>
          </View>
        </View>
      </View>
    </AppCard>
  );
}
