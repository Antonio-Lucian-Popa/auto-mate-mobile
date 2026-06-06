import { useMemo } from "react";
import { useCars } from "./useCars";
import { useCarStore } from "@/stores/carStore";
import type { Car } from "@/types";

/**
 * Rezolva masina "activa": cea selectata in store, altfel prima din lista.
 * Returneaza si optiunile pentru un selector (folosit in formulare).
 */
export function useActiveCar() {
  const { data: cars = [], isLoading } = useCars();
  const selectedId = useCarStore((s) => s.selectedCarId);
  const setSelected = useCarStore((s) => s.setSelectedCar);

  const active: Car | undefined = useMemo(
    () => cars.find((c) => c.id === selectedId) ?? cars[0],
    [cars, selectedId]
  );

  const options = useMemo(
    () => cars.map((c) => ({ value: c.id, label: `${c.brand} ${c.model}` })),
    [cars]
  );

  return { cars, active, options, isLoading, setSelected };
}
