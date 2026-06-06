import { useState } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { AppTextInput } from "@/components/ui/AppTextInput";
import { AppButton } from "@/components/ui/AppButton";
import { SegmentedField } from "@/components/forms/SegmentedField";
import { useCreateCar } from "@/hooks/useCars";
import { useCarStore } from "@/stores/carStore";
import { FUEL_TYPES } from "@/constants";
import type { FuelType } from "@/types";

type Form = { brand: string; model: string; year: string; licensePlate: string; vin: string; currentMileage: string };

export default function AddCarScreen() {
  const { control, handleSubmit } = useForm<Form>({ defaultValues: { brand: "", model: "", year: "", licensePlate: "", vin: "", currentMileage: "" } });
  const [fuelType, setFuelType] = useState<FuelType>("motorina");
  const create = useCreateCar();
  const setSelected = useCarStore((s) => s.setSelectedCar);

  const onSubmit = (d: Form) => {
    create.mutate(
      {
        brand: d.brand.trim(),
        model: d.model.trim(),
        year: Number(d.year) || new Date().getFullYear(),
        licensePlate: d.licensePlate.trim().toUpperCase(),
        vin: d.vin.trim() || undefined,
        fuelType,
        currentMileage: Number(d.currentMileage) || 0,
      },
      {
        onSuccess: (car) => {
          setSelected(car.id);
          router.back();
        },
      }
    );
  };

  return (
    <Screen className="flex-1 bg-bg">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <ScreenHeader title="Adaugă mașină" back />
          <Controller control={control} name="brand" rules={{ required: "Obligatoriu" }} render={({ field: { value, onChange }, fieldState }) => (
            <AppTextInput label="Marcă" placeholder="ex: Volkswagen" value={value} onChangeText={onChange} error={fieldState.error?.message} />
          )} />
          <Controller control={control} name="model" rules={{ required: "Obligatoriu" }} render={({ field: { value, onChange }, fieldState }) => (
            <AppTextInput label="Model" placeholder="ex: Golf 7" value={value} onChangeText={onChange} error={fieldState.error?.message} />
          )} />
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Controller control={control} name="year" render={({ field: { value, onChange } }) => (
                <AppTextInput label="An" placeholder="2018" keyboardType="number-pad" value={value} onChangeText={onChange} />
              )} />
            </View>
            <View className="flex-1">
              <Controller control={control} name="currentMileage" render={({ field: { value, onChange } }) => (
                <AppTextInput label="Km actuali" placeholder="120000" keyboardType="number-pad" value={value} onChangeText={onChange} />
              )} />
            </View>
          </View>
          <Controller control={control} name="licensePlate" rules={{ required: "Obligatoriu" }} render={({ field: { value, onChange }, fieldState }) => (
            <AppTextInput label="Număr înmatriculare" placeholder="VN 12 ABC" autoCapitalize="characters" value={value} onChangeText={onChange} error={fieldState.error?.message} />
          )} />
          <Controller control={control} name="vin" render={({ field: { value, onChange } }) => (
            <AppTextInput label="VIN (opțional)" placeholder="WVWZZZ..." autoCapitalize="characters" value={value} onChangeText={onChange} />
          )} />
          <SegmentedField label="Combustibil" options={FUEL_TYPES} value={fuelType} onChange={(v) => setFuelType(v as FuelType)} />
          <AppButton title="Salvează mașina" onPress={handleSubmit(onSubmit)} loading={create.isPending} className="mt-2" />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
